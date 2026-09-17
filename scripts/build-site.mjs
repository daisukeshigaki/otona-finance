import { execFileSync } from 'node:child_process';
import { mkdirSync, copyFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const output = resolve('dist');
// Only this generated output is replaced; private backend/source files are never published as assets.
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
let count = 0;
const urls = [];
for (const file of files) {
  if (!/^(index\.html|robots\.txt|_headers|_redirects|_routes\.json|assets\/|(?:basics|beginner|cma|fp3|contact|training|privacy|admin|columns|about|editorial-policy|how-to-use)\/)/.test(file)) continue;
  const target = resolve(output, file);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(file, target); count++;
  if ((file === 'index.html' || file.endsWith('/index.html')) && !file.startsWith('admin/')) urls.push('https://otona-finance.net/' + file.replace(/index\.html$/, ''));
}
writeFileSync(resolve(output, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.sort().map(url => '<url><loc>' + url + '</loc></url>').join('\n') + '\n</urlset>\n');
console.log(`Built ${count} public files.`);
