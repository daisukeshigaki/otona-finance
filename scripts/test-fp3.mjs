import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {lectures as foundation} from './fp3-lesson-content.mjs';
import {riskLectures} from './fp3-risk-content.mjs';
import {investmentLectures} from './fp3-investment-content.mjs';
import {taxLectures} from './fp3-tax-content.mjs';
import {propertyLectures} from './fp3-property-content.mjs';
import {inheritanceLectures} from './fp3-inheritance-content.mjs';
import {reviewLectures} from './fp3-review-content.mjs';
const additions=[...taxLectures,...propertyLectures,...inheritanceLectures,...reviewLectures];
const lectures=[...foundation,...riskLectures,...investmentLectures,...additions];

const curriculum=JSON.parse(fs.readFileSync('assets/data/fp3-curriculum.json','utf8'));
const registry=JSON.parse(fs.readFileSync('backend/lessons.json','utf8'));
assert.equal(foundation.length,9);assert.equal(riskLectures.length,6);assert.equal(investmentLectures.length,7);assert.equal(lectures.length,45);
assert.deepEqual([taxLectures.length,propertyLectures.length,inheritanceLectures.length,reviewLectures.length],[7,6,6,4]);
assert.equal(curriculum.publishedLessons,45);
assert.equal(curriculum.chapters.reduce((n,ch)=>n+ch.count,0),45);
let questions=0,figures=0;
for(const d of lectures){
 const ch=curriculum.chapters[d.chapter],l=ch.lessons[d.number-1];
 assert.equal(l.status,'published');assert.equal(l.videoStatus,'planned');
 const html=fs.readFileSync(l.url.slice(1)+'index.html','utf8');
 assert.ok(html.includes(`<h1>${l.title}</h1>`));assert.equal(registry[l.url],l.title);
 assert.ok(html.indexOf('class="fp-video"')<html.indexOf('class="fp-section"'));
 assert.equal(d.questions.length,3);
 assert.equal((html.match(/<article class="fp-question">/g)||[]).length,3);
 assert.equal((html.match(/<details>/g)||[]).length,3);
 assert.equal((html.match(/data-lesson-comments/g)||[]).length,1);
 assert.ok(!/undefined|WordPress|wordpress|NaN/.test(html));
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size,'Duplicate IDs');
 for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const url=m[1];
  if(url.startsWith('#')){assert.ok(ids.includes(url.slice(1)),url);continue;}
  if(!url.startsWith('/'))continue;
  const path=url.split(/[?#]/)[0].slice(1);
  assert.ok(fs.existsSync(path+(url.split(/[?#]/)[0].endsWith('/')?'index.html':'')),url);
 }
 for(const q of d.questions){assert.ok(q.data.length>20);assert.ok(q.ask.length>5);assert.ok(q.answer.length>20);}
 questions+=d.questions.length;figures+=(html.match(/<figure>/g)||[]).length;
}
for(const ch of curriculum.chapters){
 const html=fs.readFileSync(`fp3/${String(ch.chapter).padStart(2,'0')}/index.html`,'utf8');
 for(const l of ch.lessons)assert.ok(html.includes(`href="${l.url}"`));
 assert.ok(!html.includes('undefined'));
}
// Independently verify the arithmetic used in the teaching examples and answers.
assert.equal(80100+(1000000-267000)*.01,87430);
assert.equal(85800+(1000000-286000)*.01,92940);
assert.equal(300000-87430,212570);
assert.equal(360000/30*2/3*7,56000);
assert.equal(10000*.6*7,42000);assert.equal(10000*.2*7,14000);
assert.equal(847300*360/480,635475);assert.equal(847300*120/480,211825);
assert.equal(300000*5.481/1000*240,394632);
assert.equal(1000000*(1-.004*24),904000);
assert.equal(800000*3/4,600000);
assert.equal(847300+243800*2,1334900);
assert.equal(800000+243800,1043800);
assert.equal((847300+243800*2)+(800000+243800),2378700);
assert.equal(847300+243800,1091100);
assert.equal(847300+243800*2+81300,1416200);
assert.equal(2000000*.192158,384316);
assert.equal((300-220)*25,2000);
const r=.02,n=5;
const annuityFuture=((1+r)**n-1)/r;
const annuityPresent=(1-(1+r)**-n)/r;
assert.ok(Math.abs(annuityFuture-5.204040)<.000001);
assert.ok(Math.abs(1/annuityFuture-.192158)<.000001);
assert.ok(Math.abs(annuityPresent-4.713460)<.000001);
assert.ok(Math.abs(1/annuityPresent-.212158)<.000001);
assert.equal(execFileSync(process.execPath,['scripts/generate-fp3.mjs'],{encoding:'utf8'}),'*** Begin Patch\n\n*** End Patch\n','Generated files must match authored source');
assert.equal(100000*.25+30000,55000);
assert.equal((600-400-50)*.5,75);
assert.equal(3800-3000,800);
assert.equal(4000-1600-1000-600-300,500);
assert.equal(5000*Math.min(70,60)+100000,400000);
assert.equal(3000*.3,900);assert.equal(3000*.5,1500);
assert.equal(90/120*100,75);
// Finance examples: independently calculate, including units and rounding.
const rounded2=x=>Math.round(x*100)/100;
assert.equal(rounded2((103/100-1)*100),3);
assert.equal(2000*(150-130),40000);
assert.equal(2000000*.01,20000);
assert.equal(20000*.20315,4063);
assert.equal(20000-4063,15937);
assert.equal(rounded2(100*1.02**2),104.04);
assert.equal(rounded2(2/98*100),2.04);
assert.equal(rounded2((2+(100-98)/5)/98*100),2.45);
assert.equal(rounded2((2+(99-98)/2)/98*100),2.55);
assert.equal(rounded2(102/1.03),99.03);
assert.equal(1200000000/8000000,150);
assert.equal(9600000000/8000000,1200);
assert.equal(2400/150,16);assert.equal(2400/1200,2);
assert.equal(72/2400*100,3);assert.equal(72/150*100,48);
assert.equal(12000*100000/10000,120000);
assert.equal(10300-500,9800);assert.equal(10000-9800,200);
assert.equal(500-200,300);
assert.equal(1020*139-1000*151,-9220);
assert.equal(.6*4+.4*1,2.8);
assert.equal(200000*.20315,40630);
assert.equal(200000-40630,159370);
assert.equal(rounded2((3+(100-102)/4)/102*100),2.45);
assert.equal(1800/120,15);assert.equal(1800/1500,1.2);
assert.equal(54/1800*100,3);assert.equal(54/120*100,45);
assert.equal(1020*145-151000,-3100);
assert.equal(rounded2(151000/1020),148.04);
for(const d of [...investmentLectures,...additions]){
 assert.ok(d.sections.length>=5);
 assert.ok(d.sections.reduce((n,s)=>n+(s.html.match(/<figure>/g)||[]).length,0)>=4);
}
// Remaining chapters: arithmetic independently checked in the same stated units.
assert.equal(700-(700*.1+110),520);
assert.equal((1500-(800+70*5))/2,175);
assert.equal((300-180-50)/2,35);
assert.equal(130-74,56);assert.equal(30-8-10,12);
assert.equal(20-150*.05,12.5);assert.equal(60000/4+20000,35000);
assert.equal(520-67-90-38-63,262);
assert.equal(2620000*.1-97500,164500);
assert.equal(Math.floor(164500*.021),3454);
assert.equal(Math.floor((167954-150000)/100)*100,17900);
assert.equal((2000*.03+6)*1.1,72.60000000000001);
assert.equal((4-3)/2*10,5);assert.equal((105-5)*.6,60);
assert.equal(100*Math.min(2,4*.4),160);
assert.equal(2000/2*.03,30);
assert.equal(18000000/6*.014+18000000/3*.003,60000);
assert.equal((4000-2500-100)*10000*.20315,2844100);
assert.equal((4000-2800-150)*10000*.20315,2133075);
assert.equal(24000000/6*.014+24000000/3*.003,80000);
assert.equal(6000*.5/2,1500);assert.equal(6000*.5*.25,750);
assert.equal((500-110)*.15-10,48.5);
assert.equal((3000-110-2500)*.2,78);
assert.equal(3000+600*3,4800);assert.equal(8000-4800,3200);
assert.equal(1600*.15-50+800*.1*2,350);
assert.equal(350*.25,87.5);assert.equal(2000-500*3,500);
assert.ok(Math.abs(5000*(1-.6*.3)-4100)<1e-9);
assert.equal(5000*.2+4000-4800,200);
assert.equal(600-300-120-24-60,96);
assert.equal(4000+1000-1600-1200-800,1400);
assert.equal(3630000*.2-427500,298500);
assert.equal(450/60,7.5);
for(const d of additions){
 const html=fs.readFileSync(`fp3/${String(d.chapter).padStart(2,'0')}/${String(d.number).padStart(2,'0')}/index.html`,'utf8');
 assert.ok(html.includes('更新・制度確認：2026年9月17日'));
 assert.ok(d.sections.map(s=>s.html.replace(/<[^>]+>/g,'')).join('').length>=1000,'New lectures must be substantive');
}
for(const path of ['index.html','fp3/index.html'])assert.ok(fs.readFileSync(path,'utf8').includes('第0〜7章の計45講義'));
console.log(`FP3級: ${lectures.length}講義、${questions}問、${figures}図表。リンク・動画枠・コメント・計算・再生成の整合性チェック完了。`);
