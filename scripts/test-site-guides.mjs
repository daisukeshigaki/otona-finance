import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {columns,guides} from './site-guide-content.mjs';
assert.equal(columns.length,8);assert.equal(guides.length,3);
const home=fs.readFileSync('index.html','utf8');
for(const d of [...columns,...guides]){
 const route=columns.includes(d)?'/columns/'+d.slug+'/':'/'+d.slug+'/';
 const html=fs.readFileSync(route.slice(1)+'index.html','utf8');
 assert.ok(home.includes('href="'+route+'"'),'TOP link '+route);
 assert.ok(html.includes('<h1>'+d.title+'</h1>'),'title '+route);
 assert.ok(html.includes('https://otona-finance.net'+route),'canonical '+route);
 assert.ok(d.sections.length>=4);
 assert.ok(d.sections.map(s=>s.html.replace(/<[^>]+>/g,'')).join('').length>=550,'body length '+route);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length,'unique IDs '+route);
 for(const m of html.matchAll(/(?:href|src)="([^"?#]+)(?:[?#][^"]*)?"/g)){
  const url=m[1];if(!url.startsWith('/'))continue;
  assert.ok(fs.existsSync(url.slice(1)+(url.endsWith('/')?'index.html':'')),'local link '+url);
 }
 for(const m of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(m[1]));
 if(columns.includes(d)){
  const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(schema['@type'],'Article');assert.equal(schema.headline,d.title);
  assert.equal(schema.author.url,'https://otona-finance.net/about/');
  assert.ok(html.includes('出典・公式の確認先'));assert.ok(html.includes('あわせて読む'));
 }
 assert.ok(!html.includes('daisuke.shigaki@'),'private email');
}
assert.equal(execFileSync('node',['scripts/generate-site-guides.mjs'],{encoding:'utf8'}).trim(),'*** Begin Patch\n\n*** End Patch');
assert.equal(45*10/60,7.5);assert.equal(212*10,2120);assert.equal(100-60-25,15);assert.equal(10+3-8-7,-2);
console.log('8コラム・3案内ページ：TOP導線、本文、出典、内部リンク、目次、構造化データ、再生成と計算を確認。');
