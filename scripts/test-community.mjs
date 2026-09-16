import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { webcrypto } from 'node:crypto';
import assert from 'node:assert/strict';

// Exercise the actual route code against SQLite, without public test posts or production secrets.
const source = readFileSync('backend/worker.js', 'utf8').replace("import lessons from './lessons.json';", 'const lessons = ' + readFileSync('backend/lessons.json', 'utf8') + ';');
const { default: worker } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const sqlite = new DatabaseSync(':memory:');
sqlite.exec(readFileSync('backend/migrations/0001_community.sql', 'utf8'));
function statement(sql, args = []) {
  const query = sqlite.prepare(sql);
  return {
    bind(...values) { return statement(sql, values); },
    async first() { return query.get(...args) || null; },
    async all() { return { results: query.all(...args) }; },
    async run() { const result = query.run(...args); return { meta: { changes: Number(result.changes) } }; }
  };
}
const messages = [], pending = [];
const env = {
  SITE_ORIGIN: 'https://otona-finance.net', RATE_SALT: 'test-salt', INBOX_EMAIL: 'owner@example.com', MAIL_FROM: 'noreply@example.com', TURNSTILE_SITEKEY: 'public-key', TURNSTILE_SECRET: 'private-key',
  DB: { prepare: statement, async batch(statements) { return Promise.all(statements.map(s => s.all())); } },
  EMAIL: { async send(message) { messages.push(message); } }
};
const realFetch = globalThis.fetch;
globalThis.fetch = async (_url, options) => Response.json({ success: options.body.get('response') === 'valid', hostname: 'otona-finance.net', action: options.body.get('response') === 'valid' ? currentAction : 'wrong' });
// Cloudflare offers timingSafeEqual in SubtleCrypto; emulate it for Node's local Web Crypto.
Object.defineProperty(globalThis.crypto.subtle, 'timingSafeEqual', { value: (a, b) => Buffer.from(a).equals(Buffer.from(b)) });
let sequence = 0, currentAction = 'comment';
async function call(path, data, options = {}) {
  if (options.action) currentAction = options.action;
  const request = new Request(env.SITE_ORIGIN + path, { method: data ? 'POST' : 'GET', headers: { 'CF-Connecting-IP': options.ip || 'test-' + (++sequence), ...(data ? { 'Content-Type': 'application/json', Origin: options.origin || env.SITE_ORIGIN } : {}), ...(options.cookie ? { Cookie: options.cookie } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) });
  const response = await worker.fetch(request, env, { waitUntil(p) { pending.push(p); } });
  const result = await response.json(); return { response, result };
}
const lesson = '/basics/01/';
const comment = { lesson, name: '学習者', body: '<img src=x onerror=alert(1)> が分かりません', token: 'valid', consent: true };
assert.equal((await call('/api/admin/data')).response.status, 401);
assert.equal((await call('/api/comments', comment, { origin: 'https://evil.example' })).response.status, 403);
assert.equal((await call('/api/comments', { ...comment, token: 'invalid' })).response.status, 400);
assert.equal((await call('/api/comments', { ...comment, lesson: '/not-a-lesson/' })).response.status, 404);
assert.equal((await call('/api/comments', { ...comment, consent: false })).response.status, 400);
assert.equal((await call('/api/comments', comment)).response.status, 201);
await Promise.all(pending);
assert.equal(messages.length, 1);
assert.equal((await call('/api/comments?lesson=' + lesson)).result.comments.length, 0);
assert.equal((await call('/api/comments')).result.comments.length, 0);
const id = sqlite.prepare('SELECT id FROM comments').get().id;
const inquiry = { category: 'training', name: '担当者', email: 'client@example.com', organization: 'テスト会社', body: '研修の相談です。', token: 'valid', consent: true };
assert.equal((await call('/api/contact', inquiry, { action: 'contact' })).response.status, 201);
await Promise.all(pending);
assert.equal(sqlite.prepare('SELECT email FROM inquiries').get().email, 'client@example.com');
assert.equal(messages.at(-1).replyTo, 'client@example.com');
assert.equal((await call('/api/contact', { ...inquiry, email: 'invalid' }, { action: 'contact' })).response.status, 400);
const login = await call('/api/admin/login-request', { email: 'owner@example.com', token: 'valid' }, { action: 'admin' });
assert.equal(login.response.status, 200);
const code = messages.at(-1).text.match(/確認コード：(\d{6})/)[1];
assert.equal((await call('/api/admin/login-verify', { id: login.result.id, code: 'wrong' })).response.status, 401);
const verified = await call('/api/admin/login-verify', { id: login.result.id, code });
assert.equal(verified.response.status, 200);
const cookie = verified.response.headers.get('Set-Cookie'); assert.match(cookie, /HttpOnly; Secure; SameSite=Strict/);
assert.equal((await call('/api/admin/login-verify', { id: login.result.id, code })).response.status, 401);
const auth = { cookie };
assert.equal((await call('/api/admin/moderate', { id, status: 'approved', reply: '補足です。' }, auth)).response.status, 200);
const publicResult = (await call('/api/comments')).result;
assert.equal(publicResult.comments.length, 1); assert.equal(publicResult.comments[0].reply, '補足です。');
assert.equal(publicResult.comments[0].body, comment.body);
assert.doesNotMatch(JSON.stringify(publicResult), /owner@example|client@example|code_hash|notification_sent/);
assert.equal((await call('/api/admin/data', undefined, auth)).result.inquiries.length, 1);
assert.equal((await call('/api/admin/moderate', { id, status: 'rejected', reply: '' }, auth)).response.status, 200);
assert.equal((await call('/api/comments')).result.comments.length, 0);
assert.equal((await call('/api/admin/inquiry', { id: sqlite.prepare('SELECT id FROM inquiries').get().id, status: 'done' }, auth)).response.status, 200);
assert.equal((await call('/api/admin/logout', {}, auth)).response.status, 200);
assert.equal((await call('/api/admin/data', undefined, auth)).response.status, 401);
for (let i = 0; i < 5; i++) await call('/api/comments', { ...comment, token: 'invalid' }, { ip: 'repeat' });
assert.equal((await call('/api/comments', comment, { ip: 'repeat' })).response.status, 429);
globalThis.fetch = realFetch;
sqlite.close();
console.log('Passed: pending/approval/rejection, private inquiries, notifications, consent, challenge, CSRF, login/replay/logout, rate limits, public privacy.');
