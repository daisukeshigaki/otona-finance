import assert from 'node:assert/strict';
import fs from 'node:fs';
import {diagrams} from './fp3-chapter3-diagrams.mjs';
import {investmentLectures} from './fp3-investment-content.mjs';
assert.equal(diagrams.length,35);
assert.equal(new Set(diagrams.map(x=>x.id)).size,35);
for(let n=1;n<=7;n++){
 const html=fs.readFileSync(`fp3/03/0${n}/index.html`,'utf8');
 const lesson=investmentLectures.find(x=>x.number===n);
 assert.equal((html.match(/id="introduction"/g)||[]).length,1);
 assert.ok(html.includes('この講義で学ぶこと'));
 assert.equal(lesson.questions.length,3);
 assert.ok(html.indexOf('fp-video')<html.indexOf('id="introduction"'));
 for(let i=1;i<=lesson.sections.length;i++){
  const specs=diagrams.filter(x=>x.lesson===n&&x.section===i);
  assert.ok(specs.length,`図がない項：${n}-${i}`);
  const section=html.match(new RegExp(`<section class="fp-section" id="s${i}">([\\s\\S]*?)</section>`))?.[1];
  assert.ok(section?.startsWith('<h2>'));
  for(const d of specs){assert.ok(fs.existsSync(`assets/images/fp3/03/${d.id}.png`));assert.ok(section.includes(`${d.id}.png`));}
 }
}
assert.equal(1300-1000,300);
assert.equal(Math.round(20000*(1-0.20315)),15937);
assert.equal((1.02/1.03-1).toFixed(4),'-0.0097');
assert.equal(((2+2/5)/98*100).toFixed(2),'2.45');
assert.equal(((2+1/2)/98*100).toFixed(2),'2.55');
assert.equal(1200000000/8000000,150);
assert.equal(9600000000/8000000,1200);
assert.equal(2400/150,16);
assert.equal(72/150*100,48);
assert.equal(1020*139-151000,-9220);
assert.equal((151000/1020).toFixed(2),'148.04');
assert.equal(200000*0.20315,40630);
console.log('FP3第3章：全7講義・35項の解説図、35画像、導入、21問と計算例を確認。');
