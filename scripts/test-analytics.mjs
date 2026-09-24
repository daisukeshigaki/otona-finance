import fs from 'node:fs';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

execFileSync(process.execPath, ['scripts/build-site.mjs'], { stdio: 'pipe' });
const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const publicHtml = tracked.filter(file => (file === 'index.html' || /^(?:basics|beginner|cma|fp3|contact|training|privacy|columns|about|editorial-policy|how-to-use)\/.*\.html$/.test(file)) && !file.startsWith('admin/'));
assert.ok(publicHtml.length > 200);
for (const file of publicHtml) {
  const html = fs.readFileSync('dist/' + file, 'utf8');
  assert.equal((html.match(/G-Q6BM1HHV68/g) || []).length, 1, file);
  assert.equal((html.match(/googletagmanager\.com\/gtag\/js/g) || []).length, 1, file);
  assert.ok(html.includes("localStorage.setItem(storageKey, '1')"), file);
  assert.ok(html.includes("navigator.webdriver === true"), file);
  assert.ok(html.includes("/^(localhost|127\\.0\\.0\\.1)$/"), file);
  assert.ok(html.indexOf('otona_finance_analytics_opt_out') < html.indexOf('</head>'), file);
}
const admin = fs.readFileSync('dist/admin/index.html','utf8');
assert.ok(!admin.includes('G-Q6BM1HHV68'));
console.log(`PASS: Google Analyticsを公開${publicHtml.length}ページへ挿入し、運営者・ローカル・自動確認・管理画面は除外`);
