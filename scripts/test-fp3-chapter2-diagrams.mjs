import assert from 'node:assert/strict';
import fs from 'node:fs';
import {diagrams} from './fp3-chapter2-diagrams.mjs';
import {riskLectures} from './fp3-risk-content.mjs';
assert.equal(new Set(diagrams.map(d=>d.id)).size,29);
assert.equal(diagrams.length,32);
for(let n=1;n<=6;n++){
 const html=fs.readFileSync(`fp3/02/0${n}/index.html`,'utf8');
 const lesson=riskLectures.find(d=>d.number===n);
 assert.equal((html.match(/id="introduction"/g)||[]).length,1);
 assert.ok(html.includes('この講義で学ぶこと'));
 assert.equal(lesson.questions.length,3);
 assert.ok(html.indexOf('fp-video')<html.indexOf('id="introduction"'));
 for(let section=1;section<=lesson.sections.length;section++){
  const specs=diagrams.filter(d=>d.lesson===n&&d.section===section);
  assert.ok(specs.length,`Missing teaching figure: ${n}-${section}`);
  const body=html.match(new RegExp(`<section class="fp-section" id="s${section}">([\\s\\S]*?)</section>`))?.[1];
  for(const spec of specs){
   assert.ok(fs.existsSync(`assets/images/fp3/02/${spec.id}.png`));
   assert.ok(body.includes(`${spec.id}.png`));
  }
 }
}
assert.equal(5000*Math.min(70,60)+100000,400000);
assert.equal((600-400-50)/2,75);
assert.equal(100000/4+30000,55000);
assert.equal(3800-1500-1000-500,800);
assert.equal(4000-1600-1000-600-300,500);
console.log('FP3第2章：全6講義・全31項の図解配置、29画像・32配置、導入、18問、計算例を確認。');
