import lessons from './lessons.json';

const publicColumns = 'id,lesson_path,name,body,reply,created_at,published_at';
function json(data, status = 200, extra = {}) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra } });
}
function fail(message, status = 400) { throw Object.assign(new Error(message), { status }); }
function text(value, max, label, required = true) {
  if (typeof value !== 'string') { if (!required && value == null) return ''; fail(`${label}を入力してください。`); }
  const s = value.trim();
  if ((required && !s) || s.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s)) fail(`${label}の入力を確認してください。`);
  return s;
}
async function hash(value) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map(x => x.toString(16).padStart(2, '0')).join('');
}
async function equal(a, b) {
  return crypto.subtle.timingSafeEqual(new TextEncoder().encode(await hash(a)), new TextEncoder().encode(await hash(b)));
}
async function body(request) {
  if (!request.headers.get('content-type')?.includes('application/json')) fail('送信形式が正しくありません。', 415);
  if (Number(request.headers.get('content-length') || 0) > 20000) fail('入力内容が長すぎます。', 413);
  const reader = request.body?.getReader();
  if (!reader) fail('入力内容がありません。');
  const chunks = []; let length = 0;
  while (true) {
    const { value, done } = await reader.read(); if (done) break;
    length += value.length;
    if (length > 20000) { await reader.cancel(); fail('入力内容が長すぎます。', 413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const c of chunks) { bytes.set(c, offset); offset += c.length; }
  let data; try { data = JSON.parse(new TextDecoder().decode(bytes)); } catch { fail('入力内容を確認してください。'); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) fail('入力内容を確認してください。');
  return data;
}
async function rate(env, request, scope, max, global = false) {
  const now = Math.floor(Date.now() / 1000);
  const identity = global ? 'site' : await hash(env.RATE_SALT + (request.headers.get('CF-Connecting-IP') || 'unknown'));
  const key = `${scope}:${identity}:${Math.floor(now / 3600)}`;
  const row = await env.DB.prepare('INSERT INTO limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key, now + 7200).first();
  if (row.count > max) fail('送信が続いています。時間をおいてお試しください。', 429);
  // Bounded retention; never keep raw IP addresses.
  await env.DB.prepare('DELETE FROM limits WHERE key IN (SELECT key FROM limits WHERE expires < ? LIMIT 100)').bind(now).run();
}
async function challenge(env, request, data, action) {
  if (!env.TURNSTILE_SECRET || !data.token) fail('確認チェックを完了してください。');
  const form = new FormData(); form.set('secret', env.TURNSTILE_SECRET); form.set('response', data.token);
  const ip = request.headers.get('CF-Connecting-IP'); if (ip) form.set('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form, signal: AbortSignal.timeout(10000) });
  const checked = await res.json();
  if (!checked.success || checked.hostname !== new URL(env.SITE_ORIGIN).hostname || checked.action !== action) fail('確認の期限が切れました。もう一度確認してください。');
}
async function mail(env, subject, message, replyTo) {
  await env.EMAIL.send({ to: env.INBOX_EMAIL, from: env.MAIL_FROM, subject, text: message, ...(replyTo ? { replyTo } : {}) });
}
async function notify(env, kind, id, message, replyTo) {
  try {
    await mail(env, `【おとなのファイナンス】${kind === 'comments' ? '講義に新しいコメント' : 'お問い合わせ'}`, message + `\n\n管理ページ：${env.SITE_ORIGIN}/admin/`, replyTo);
    const table = kind === 'comments' ? 'comments' : 'inquiries';
    await env.DB.prepare(`UPDATE ${table} SET notification_sent=1 WHERE id=?`).bind(id).run();
  } catch { console.error(JSON.stringify({ event: 'notification_failed', kind, id })); }
}
async function admin(env, request) {
  const token = request.headers.get('Cookie')?.match(/(?:^|;\s*)otona_admin=([^;]+)/)?.[1];
  if (!token || !(await env.DB.prepare('SELECT token_hash FROM sessions WHERE token_hash=? AND expires>?').bind(await hash(token), Date.now()).first())) fail('管理者ログインが必要です。', 401);
}
function cookie(value, seconds) { return `otona_admin=${value}; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=${seconds}`; }
async function route(request, env, ctx) {
  const url = new URL(request.url), path = url.pathname;
  if (url.origin !== env.SITE_ORIGIN) fail('この環境では受付していません。', 403);
  if (request.method === 'GET') {
    if (path === '/api/community/config') return json({ siteKey: env.TURNSTILE_SITEKEY });
    if (path === '/api/comments') {
      const lesson = url.searchParams.get('lesson');
      if (lesson && !lessons[lesson]) fail('講義が見つかりません。', 404);
      const query = lesson ? `SELECT ${publicColumns} FROM comments WHERE status='approved' AND lesson_path=? ORDER BY published_at DESC,id DESC LIMIT 100` : `SELECT ${publicColumns} FROM comments WHERE status='approved' ORDER BY published_at DESC,id DESC LIMIT 5`;
      const stmt = env.DB.prepare(query);
      const rows = await (lesson ? stmt.bind(lesson) : stmt).all();
      return json({ comments: rows.results.map(row => ({ ...row, lesson_title: lessons[row.lesson_path] })) });
    }
    if (path === '/api/admin/data') {
      await admin(env, request);
      const [comments, inquiries] = await env.DB.batch([
        env.DB.prepare('SELECT * FROM comments ORDER BY created_at DESC LIMIT 200'),
        env.DB.prepare('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 200')
      ]);
      return json({ comments: comments.results.map(x => ({ ...x, lesson_title: lessons[x.lesson_path] })), inquiries: inquiries.results });
    }
    fail('見つかりません。', 404);
  }
  if (request.method !== 'POST') fail('対応していない送信方法です。', 405);
  if (request.headers.get('Origin') !== env.SITE_ORIGIN) fail('送信元を確認できません。', 403);
  const data = await body(request);
  if (path === '/api/comments' || path === '/api/contact') {
    await rate(env, request, 'submit', 5); await rate(env, request, 'submit-total', 100, true);
    if (data.website) fail('送信できません。');
    await challenge(env, request, data, path === '/api/comments' ? 'comment' : 'contact');
    const name = text(data.name, 60, 'お名前'), message = text(data.body, path === '/api/comments' ? 2000 : 5000, '本文');
    if (data.consent !== true) fail('投稿・個人情報の扱いをご確認ください。');
    const id = crypto.randomUUID(), date = new Date().toISOString();
    if (path === '/api/comments') {
      const lesson = text(data.lesson, 120, '講義'); if (!lessons[lesson]) fail('講義が見つかりません。', 404);
      await env.DB.prepare('INSERT INTO comments(id,lesson_path,name,body,created_at) VALUES(?,?,?,?,?)').bind(id, lesson, name, message, date).run();
      ctx.waitUntil(notify(env, 'comments', id, `講義：${lessons[lesson]}\n${env.SITE_ORIGIN}${lesson}\nお名前：${name}\n\n${message}`));
      return json({ message: 'コメントを受け付けました。確認・承認後に公開します。' }, 201);
    }
    const email = text(data.email, 254, 'メールアドレス'); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\r\n]/.test(email)) fail('メールアドレスを確認してください。');
    const category = data.category; if (!['question', 'general', 'training'].includes(category)) fail('お問い合わせの種類を選んでください。');
    const organization = text(data.organization, 150, '会社・団体名', false);
    await env.DB.prepare('INSERT INTO inquiries(id,category,name,email,organization,body,created_at) VALUES(?,?,?,?,?,?,?)').bind(id, category, name, email, organization, message, date).run();
    ctx.waitUntil(notify(env, 'inquiries', id, `種類：${{ question: '講義への質問', general: '一般お問い合わせ', training: '研修依頼' }[category]}\nお名前：${name}\n返信先：${email}\n会社・団体：${organization}\n\n${message}`, email));
    return json({ message: 'お問い合わせを受け付けました。内容を確認してご連絡します。' }, 201);
  }
  if (path === '/api/admin/login-request') {
    await rate(env, request, 'login', 5); await rate(env, request, 'login-total', 10, true);
    await challenge(env, request, data, 'admin');
    const email = text(data.email, 254, 'メールアドレス');
    const id = crypto.randomUUID();
    if (await equal(email.toLowerCase(), env.INBOX_EMAIL.toLowerCase())) {
      // Rejection sampling avoids modulo bias in the six-digit code.
      let number; do { number = crypto.getRandomValues(new Uint32Array(1))[0]; } while (number >= 4294000000);
      const code = String(number % 1000000).padStart(6, '0');
      await env.DB.prepare('INSERT INTO login_codes(id,code_hash,expires) VALUES(?,?,?)').bind(id, await hash(env.RATE_SALT + id + code), Date.now() + 600000).run();
      await mail(env, '【おとなのファイナンス】管理ページの確認コード', `確認コード：${code}\n10分間有効です。\n\n${env.SITE_ORIGIN}/admin/\nこの操作に心当たりがなければ無視してください。`);
    }
    return json({ id, message: '登録されたメールアドレスの場合、確認コードを送信しました。' });
  }
  if (path === '/api/admin/login-verify') {
    await rate(env, request, 'verify', 20);
    const id = text(data.id, 36, '確認ID'), code = text(data.code, 6, '確認コード');
    const row = await env.DB.prepare('UPDATE login_codes SET attempts=attempts+1 WHERE id=? AND expires>? AND attempts<5 RETURNING code_hash').bind(id, Date.now()).first();
    if (!row || !(await equal(await hash(env.RATE_SALT + id + code), row.code_hash))) fail('確認コードが違うか、有効期限が切れています。', 401);
    const consumed = await env.DB.prepare('DELETE FROM login_codes WHERE id=? RETURNING id').bind(id).first(); if (!consumed) fail('このコードは使用済みです。', 401);
    const token = crypto.randomUUID() + crypto.randomUUID();
    await env.DB.prepare('INSERT INTO sessions(token_hash,expires) VALUES(?,?)').bind(await hash(token), Date.now() + 28800000).run();
    await env.DB.batch([env.DB.prepare('DELETE FROM sessions WHERE expires<?').bind(Date.now()), env.DB.prepare('DELETE FROM login_codes WHERE expires<?').bind(Date.now())]);
    return json({ ok: true }, 200, { 'Set-Cookie': cookie(token, 28800) });
  }
  await admin(env, request);
  if (path === '/api/admin/logout') {
    const token = request.headers.get('Cookie')?.match(/(?:^|;\s*)otona_admin=([^;]+)/)?.[1];
    if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await hash(token)).run();
    return json({ ok: true }, 200, { 'Set-Cookie': cookie('', 0) });
  }
  if (path === '/api/admin/moderate') {
    const id = text(data.id, 36, 'ID');
    if (!['pending', 'approved', 'rejected'].includes(data.status)) fail('公開状態を確認してください。');
    const reply = text(data.reply, 3000, '返信', false);
    const result = await env.DB.prepare('UPDATE comments SET status=?,reply=?,published_at=CASE WHEN ? = \'approved\' THEN COALESCE(published_at,?) ELSE published_at END WHERE id=?').bind(data.status, reply, data.status, new Date().toISOString(), id).run();
    if (!result.meta.changes) fail('コメントが見つかりません。', 404);
    return json({ ok: true });
  }
  if (path === '/api/admin/inquiry') {
    if (!['new', 'done'].includes(data.status)) fail('状態を確認してください。');
    const result = await env.DB.prepare('UPDATE inquiries SET status=? WHERE id=?').bind(data.status, text(data.id, 36, 'ID')).run();
    if (!result.meta.changes) fail('問い合わせが見つかりません。', 404);
    return json({ ok: true });
  }
  fail('見つかりません。', 404);
}
export default {
  async fetch(request, env, ctx) {
    try { return await route(request, env, ctx); }
    catch (error) {
      if (!error.status) console.error(JSON.stringify({ event: 'community_error' }));
      return json({ error: error.status ? error.message : '現在処理できません。時間をおいてお試しください。' }, error.status || 503);
    }
  }
};
