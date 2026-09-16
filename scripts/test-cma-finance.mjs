import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {corporateLectures} from './cma-corporate-content.mjs';
import {equityLectures} from './cma-equity-content.mjs';
const data=JSON.parse(fs.readFileSync('assets/data/cma-curriculum.json','utf8'));
const registry=JSON.parse(fs.readFileSync('backend/lessons.json','utf8'));
const groups=[[2,23,corporateLectures],[3,28,equityLectures]];
const round=(x,n=2)=>Number(x.toFixed(n));
let figures=0,questions=0;
const routes=[];
for(const [number,count,lessons] of groups){
 const ch=data.chapters.find(c=>c.number===number),prefix='/cma/'+String(number).padStart(2,'0')+'/';
 assert.equal(ch.count,count);assert.equal(lessons.length,count);assert.equal(ch.status,'published');assert.equal(ch.publishedLessons,count);
 assert.deepEqual(lessons.map(d=>d.number),Array.from({length:count},(_,i)=>i+1));
 const catalog=fs.readFileSync('.'+prefix+'index.html','utf8');assert.ok(!catalog.includes('pending-lesson'));assert.ok(!catalog.includes('記事準備中'));
 for(const d of lessons){
  const l=ch.lessons[d.number-1],route=prefix+String(d.number).padStart(2,'0')+'/',path='.'+route+'index.html';routes.push(route);
  const html=fs.readFileSync(path,'utf8');assert.equal(l.url,route);assert.equal(l.status,'published');assert.equal(l.videoStatus,'planned');assert.equal(registry[route],l.title);
  assert.ok(catalog.includes('href="'+route+'"'));assert.ok(catalog.includes(d.lead));assert.ok(html.includes('https://otona-finance.net'+route));
  assert.ok(html.includes('CMA · 第'+number+'章'));assert.ok(html.includes('教材番号 '+l.id));assert.ok(html.includes('全編無料'));assert.ok(html.includes('id="comments"'));
  assert.ok(html.indexOf('class="fp-video"')<html.indexOf('id="s1"'));assert.ok(!html.includes('WordPress'));assert.ok(!html.includes('undefined'));
  assert.ok(d.sections.length>=4);assert.equal(d.questions.length,3);const body=d.sections.map(s=>s.html).join('');
  assert.ok(body.replace(/<[^>]+>/g,'').length>=1000,path+' substantive body');const figs=(body.match(/<figure /g)||[]).length;assert.ok(figs>=4);figures+=figs;
  for(const q of d.questions){assert.ok(q.title&&q.data&&q.ask&&q.answer);assert.ok(q.data.replace(/<[^>]+>/g,'').length>=25);assert.ok(!/上の表|前の表|本文を参照|上に戻/.test(q.data+q.ask));assert.ok(html.includes(q.data));questions++;}
  assert.ok(d.sources.length>0);for(const [,url] of d.sources)assert.ok(url.startsWith('https://'));
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
  for(const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){const u=m[1];if(u.startsWith('#'))assert.ok(ids.includes(u.slice(1)),path+' '+u);if(u.startsWith('/')&&!u.startsWith('//')&&!u.startsWith('/api/')){const p=u.split(/[?#]/)[0];assert.ok(fs.existsSync('.'+p+(p.endsWith('/')?'index.html':'')),path+' '+p);}}
 }
}
assert.equal(questions,153);assert.equal(routes.length,51);
const nav=[['/cma/01/28/','/cma/02/01/'],['/cma/02/23/','/cma/03/01/'],['/cma/03/01/','/cma/02/23/'],['/cma/03/28/','/cma/04/']];
for(const [route,target] of nav)assert.ok(fs.readFileSync('.'+route+'index.html','utf8').includes('href="'+target+'"'));
assert.ok(fs.readFileSync('index.html','utf8').includes('第0〜3章・計84講義を公開中。'));
assert.ok(fs.readFileSync('cma/index.html','utf8').includes('第1〜3章の79講義'));
assert.equal(execFileSync(process.execPath,['scripts/generate-cma.mjs'],{encoding:'utf8'}),'*** Begin Patch\n\n*** End Patch\n');
// Independent numerical checks, tagged by lecture. No values read from rendered answer strings.
const checks={
 '2-01':[[100*1.1**2,121],[121/1.1**2,100],[round((1.1/1.02-1)*100),7.84]],
 '2-02':[[round(10/1.1+10/1.1**2+10/1.1**3),24.87],[10/.08,125],[10*1.02/.08,127.5]],
 '2-03':[[-100+121/1.1,10],[round((121/100-1)*100),21],[round(-1000+1300/1.1),181.82],[-100+230/1.1-132/1.1**2,0],[-100+230/1.2-132/1.2**2,0]],
 '2-04':[[-100-30-25,-155],[40-10,30],[-(10+20-5),-25]],
 '2-05':[[20*.5-10*.5,5],[Math.sqrt(.5*.15**2+.5*(-.15)**2)*100,15],[.5*20+.5*(-10),5]],
 '2-06':[[2+1.2*5,8],[7-2,5],[10-8,2]],
 '2-07':[[1.35/(1+.7*.5),1],[1*(1+.7*1),1.7],[2+1.7*5,10.5]],
 '2-08':[[4*.7,2.8],[10*.6+4*.7*.4,7.12],[round(100/1.0712),93.35]],
 '2-09':[[100-1000*.08,20],[6/.08-100,-25],[round(106/1100*100),9.64],[106-1100*.08,18]],
 '2-10':[[8+(8-4)*1,12],[12*.5+4*.5,8],[round(200/300*100),66.67]],
 '2-11':[[100*.04*.3,1.2],[500+30-5,525],[500+60-50,510]],
 '2-12':[[Math.max(110-100,0),10],[.5*Math.max(180-100,0)+.5*0,40],[.5*180,90]],
 '2-13':[[100/125*100,80],[1000000/1000,1000],[1000*1200,1200000]],
 '2-14':[[1000-100,900],[10000000000/100000,100000],[(30+20)/100*100,50],[(640-500)/500*100,28]],
 '2-15':[[100-30-20,50],[.5*.12*100,6],[.6*.15*100,9]],
 '2-16':[[50-10-(230-200),10],[200+50-10,240],[20-250*.09,-2.5]],
 '2-17':[[.5*200+.5*60-120,10],[.5*Math.max(200-120,0)+.5*Math.max(60-120,0),40],[40-5-10,25]],
 '2-18':[[100-20-10,70],[40+30,70],[12+8,20],[70-50,20]],
 '2-19':[[15/(3+7),1.5],[15-10-2,3],[12/10,1.2]],
 '2-20':[[300/1000*100,30]],
 '2-21':[[20/100*100,20],[30/300*100,10],[30-300*.12,-6]],
 '2-22':[[120/100,1.2],[2+20/40,2.5],[15-100*.08,7],[10/50*100,20]],
 '2-23':[[(100-60)/(100-60-20),2],[90-54-20-5,11],[10+30-25-10-8,-3],[round(622/2859*100),21.76]],
 '3-01':[[Math.max(300-220-50,0),30],[Math.max(240-220-50,0),0],[180/900*100,20]],
 '3-02':[[100000*1000-2000000,98000000],[1200*100,120000]],
 '3-03':[[.8*10,8],[round(1000/1100*10),9.09],[round((1.05*1.1-1)*100),15.5]],
 '3-04':[[100*.1,10],[round(10/30*100),33.33],[20000-3000-1000,16000]],
 '3-05':[[(1000*100+1010*100)/200,1005],[1000-990,10],[(990+1000)/2,995]],
 '3-06':[[100*1.1*100*.95,10450],[-(20+10-5),-25],[round(1729/8676*100),19.93],[round(3453/18340*100),18.83]],
 '3-07':[[.15*2*100,30],[.20*.5*100,10],[100-70-5,25]],
 '3-08':[[100000*1000,100000000],[.8-.1,.7],[110/125,.88]],
 '3-09':[[1000+400-100,1300],[1500+100-400,1200],[500*200000000,100000000000]],
 '3-10':[[1000/50,20],[1000/500,2],[1300/200,6.5],[1000/100,10],[1000/50,20]],
 '3-11':[[(40+1040)/1.08,1000],[50/.1,500]],
 '3-12':[[40*1.02,40.8],[40.8/.06,680],[40.8/680*100+2,8]],
 '3-13':[[48.4*1.02/.06,822.8],[round(822.8/1.08**3),653.17],[(680*.08-40)/720*100,2],[round(40/1.08+44/1.08**2+(48.4+822.8)/1.08**3),766.35]],
 '3-14':[[.6*.12*100,7.2],[.05*1.2*2*100,12],[.03/.1*100,30]],
 '3-15':[[1300-100/.1,300],[60/(.1-.4*.15),1500],[60/.08-1000,-250]],
 '3-16':[[100*.7+20-40-10,40],[63+20-40-10+15-5,43],[40-10*.7+10,43]],
 '3-17':[[1100*.12*.7,92.4],[1100*.15-1000*.15,15],[92.4+30-50-15,57.4],[39700-30651,9049],[7100-5927,1173],[round(5927/30651*100),19.34],[round(7100/39700*100),17.88]],
 '3-18':[[120*1.02/.08,1530],[round(1530/1.1**3),1149.51],[.03/.1*100,30],[round(100/1.1+110/1.1**2+(120+1530)/1.1**3),1421.49]],
 '3-19':[[120-1000*.08,40],[round(1000+40/1.08),1037.04],[round((.12-.02)/(.08-.02)),1.67]],
 '3-20':[[12*50,600],[100*7+50-200,550],[(10+12+20)/3,14]],
 '3-21':[[1120/((20+80+140)/3),14],[420-300-20,100],[1000*.1,100],[1000*.02,20]],
 '3-22':[[.018/.015,1.2],[2+1.2*6,9.2],[round(100/1.092),91.58]],
 '3-23':[[9-1.5,7.5],[7.5-8,-.5]],
 '3-24':[[10-2-5-2,1],[8-1-7.5,-.5],[500000/1000,500],[500000/500,1000]],
 '3-25':[[10000/5,2000],[10000*.1,1000]],
 '3-26':[[(1000*100+1010*300)/400,1007.5],[80*10+20*20+100,1300],[2*Math.abs(999-995),8]],
 '3-27':[[150*.7+30-50-10,75],[75/.1+50-200,600],[75/.12+50-200,475],[60/.1+50-200,450],[75/1.1+(75+750)/1.1**2,750]],
 '3-28':[[120-100,20]]
};
assert.equal(Object.keys(checks).length,51);
for(const [id,rows] of Object.entries(checks))for(const [actual,expected] of rows)assert.ok(Math.abs(actual-expected)<1e-7,id+': '+actual+' ≠ '+expected);
console.log(`CMA第2・3章：51講義・${figures}図表・${questions}問。本文量、条件、計算、内部リンク、章またぎ、上部動画枠、コメント、再生成の整合性チェック完了。`);
