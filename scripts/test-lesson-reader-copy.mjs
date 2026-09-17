import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(p=>/^(?:basics|beginner|cma|fp3)\/.*\.html$/.test(p));
let practice=0;
for(const path of files){
 const html=fs.readFileSync(path,'utf8');
 assert.ok(!html.includes('この場の資料だけで解く'),path+' practice heading');
 assert.ok(!html.includes('撮影・復習の目安'),path+' production note');
 if(html.includes('class="fp-question"')){
  assert.ok(html.includes('<h2>練習問題</h2>'),path+' heading');
  assert.ok(html.includes('id="recap"'),path+' recap remains');
  assert.equal((html.match(/class="fp-question"/g)||[]).length,3,path+' question count');
  assert.equal((html.match(/答えと考え方を見る/g)||[]).length,3,path+' answers remain');
  practice++;
 }
}
for(const path of ['scripts/generate-cma.mjs','scripts/generate-fp3.mjs']){
 const code=fs.readFileSync(path,'utf8');
 assert.ok(!code.includes('この場の資料だけで解く'));assert.ok(!code.includes('撮影・復習の目安'));
}
assert.ok(practice>=217);
console.log('全講座の公開文言を確認。'+practice+'講義の練習問題・解説・まとめは維持。');
