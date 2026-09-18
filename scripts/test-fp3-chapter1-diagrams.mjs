import assert from 'node:assert/strict';
import fs from 'node:fs';
import { diagrams, pendingDiagramIds } from './fp3-chapter1-diagrams.mjs';
const ready=diagrams.filter(d=>!pendingDiagramIds.has(d.id));
assert.equal(ready.length,22);
for(let n=1;n<=8;n++){
 const html=fs.readFileSync(`fp3/01/0${n}/index.html`,'utf8');
 assert.equal((html.match(/id="introduction"/g)||[]).length,1);
 assert.ok(html.includes('この講義で学ぶこと'));
 assert.ok(!html.includes('planning-sheets-overview.png'));
 assert.ok(!html.includes('money-time-directions.png'));
 for(const d of ready.filter(d=>d.lesson===n)){
  assert.ok(fs.existsSync(`assets/images/fp3/01/${d.id}.png`));
  const section=html.match(new RegExp(`<section class="fp-section" id="s${d.section}">([\\s\\S]*?)</section>`))?.[1];
  assert.ok(section?.includes(`${d.id}.png`),`Wrong figure location: ${d.id}`);
 }
 for(const id of pendingDiagramIds)assert.ok(!html.includes(`${id}.png`));
}
const coefficientPage=fs.readFileSync('fp3/01/02/index.html','utf8');
assert.ok(coefficientPage.includes('年20万円 × 係数 ≈ 104.0808万円'));
assert.ok(coefficientPage.includes('年20万円 × 係数 ≈ 元金94.2692万円'));
assert.equal(Math.round(20*((1.02**5-1)/.02)*100)/100,104.08);
assert.equal(Math.round(20*((1-1.02**-5)/.02)*100)/100,94.27);
assert.ok(coefficientPage.includes('<th scope="col">負債・純資産</th>'));
assert.ok(coefficientPage.includes('<td>負債・純資産合計</td><td>3,500</td>'));
assert.ok(coefficientPage.includes('cashflow-and-balance-v2.png'));
console.log('FP3第1章：22教材図の配置、全8講義の導入、6係数の20万円例、BS左右の合計を確認。');
