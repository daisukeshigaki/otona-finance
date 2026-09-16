import { execFileSync } from 'node:child_process';
import { mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const output = resolve('dist');
// Only this generated output is replaced; private backend/source files are never published as assets.
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
let count = 0;
for (const file of files) {
  if (!/^(index\.html|_headers|_redirects|_routes\.json|assets\/|(?:basics|beginner|cma|fp3|contact|training|privacy|admin)\/)/.test(file)) continue;
  const target = resolve(output, file);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(file, target); count++;
}
console.log(`Built ${count} public files.`);
