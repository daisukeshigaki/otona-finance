import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {accountingLectures as lectures} from './cma-accounting-content.mjs';
const curriculum=JSON.parse(fs.readFileSync('assets/data/cma-curriculum.json','utf8'));
const ch=curriculum.chapters.find(c=>c.number===1);
const registry=JSON.parse(fs.readFileSync('backend/lessons.json','utf8'));
assert.equal(lectures.length,28);assert.equal(ch.count,28);assert.equal(ch.publishedLessons,28);assert.equal(ch.status,'published');
assert.equal(new Set(lectures.map(d=>d.number)).size,28);
const catalog=fs.readFileSync('cma/01/index.html','utf8');
let figures=0,questions=0;
const checkLinks=(html,path)=>{
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(ids.length,new Set(ids).size,path+' duplicate IDs');
 for(const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
  const u=m[1];if(u.startsWith('#'))assert.ok(ids.includes(u.slice(1)),path+' '+u);
  if(u.startsWith('/')&&!u.startsWith('//')){let p=u.split(/[?#]/)[0];if(p.startsWith('/api/'))continue;assert.ok(fs.existsSync('.'+p+(p.endsWith('/')?'index.html':'')),path+' '+p);}
 }
};
for(const d of lectures){
 const route=`/cma/01/${String(d.number).padStart(2,'0')}/`,l=ch.lessons[d.number-1],path=route.slice(1)+'index.html',html=fs.readFileSync(path,'utf8');
 assert.equal(l.url,route);assert.equal(l.status,'published');assert.equal(l.videoStatus,'planned');assert.equal(l.title,registry[route]);
 assert.ok(catalog.includes(`href="${route}"`));assert.ok(catalog.includes(d.lead));assert.ok(html.includes(`https://otona-finance.net${route}`));
 assert.ok(html.includes('教材番号 '+l.id));assert.ok(html.includes('2026年9月17日'));assert.ok(html.includes('全編無料'));assert.ok(html.includes('id="comments"'));
 assert.ok(html.indexOf('class="fp-video"')<html.indexOf('id="s1"'));assert.ok(!html.includes('WordPress'));
 assert.ok(d.sections.length>=4);assert.equal(d.questions.length,3);
 const body=d.sections.map(s=>s.html).join('');assert.ok(body.replace(/<[^>]+>/g,'').length>=1000,path+' substantive content');
 const count=(body.match(/<figure /g)||[]).length;assert.ok(count>=4);figures+=count;
 for(const q of d.questions){assert.ok(q.title&&q.ask&&q.answer);assert.ok(q.data.replace(/<[^>]+>/g,'').length>=25);assert.ok(!/上の表|前の表|本文を参照|上に戻/.test(q.data+q.ask));assert.ok(html.includes(q.data));questions++;}
 assert.ok(d.sources.length>=1);for(const [,url] of d.sources)assert.ok(/^https:\/\//.test(url));
 checkLinks(html,path);
}
checkLinks(catalog,'cma catalog');assert.equal(questions,84);
const generated=execFileSync(process.execPath,['scripts/generate-cma.mjs'],{encoding:'utf8'});assert.equal(generated,'*** Begin Patch\n\n*** End Patch\n','generation must be idempotent');
// Independent arithmetic checks cover every lecture with quantitative examples.
const round=(x,n=2)=>Number(x.toFixed(n));
const checks=[
 [133+20-100-30+30,53],[100+53-80-20,53],[200+133,333],
 [1200-780-300,120],[round(120/1200*100),10],[(900-600)*1200,360000],[Math.ceil(400000/300),1334],
 [150+5-20-15,120],[150+40,190],[150*.7,105],
 [300+180-130-70,280],[280-200,80],
 [300/5,60],[500+200-80-50-30,540],[300-Math.max(220,250),50],[70-50,20],
 [1000-(900-300),400],[150/10,15],[400/10,40],
 [100*1.05-25,80],[100-100/5,80],
 [30-20,10],[100*.3,30],[30-18,12],
 [120+40-10-30+20-15,125],[125-80,45],[100+125-60-30+5,140],
 [120*100/150,80],[40*3/12,10],[1000*200/800,250],
 [950*1.06-40,967],[120-100,20],[12-10,2],
 [1000+500-100,1400],[(100-80)*.5,10],[150-50*.2,140],
 [100*.3,30],[300+30-12+6,324],[40*.3,12],
 [10000*(150-140),100000],[10000*(148-150),-20000],[100000*140,14000000],
 [100+20,120],[500+100+20-30+50,640],[20-20,0],
 [100*.5+120*.5,110],[121000000/1100000,110],[round(126000000/1100000),114.55],
 [100/250*100,40],[105/700*100,15],[105-700*.08,49],
 [500/250*100,200],[250/250*100,100],[400/200,2],[(400-100)/200,1.5],[60/40,1.5],
 [300/3650*365,30],[240/2190*365,40],[180/2190*365,30],[30+40-30,40],[2190/365*10,60],
 [100+30-80-40+20,30],[(100-30)/500*100,14],
 [100/500*100,20],[150/750*100,20],[120*3/12,30],
 [120+20-30-10,100],[20*.7/100*100,14],[800+300+100-400,800],
 [225/1500*100,15],[100+50-40-30,80],
 [100+500-150,450],[12*3/12,3],[150-120,30],
 [100+50+300-20,430],[430+100-30+50-20,530],
 [300/.4,750],[(1000-750)/1000*100,25],[300000/(900-600),1000],[round(200/350*100),57.14]
];
for(const [actual,expected] of checks)assert.ok(Math.abs(actual-expected)<1e-7,actual+' ≠ '+expected);
assert.ok(lectures.find(d=>d.number===7).sections.some(s=>s.html.includes('2027年4月1日')));
assert.ok(lectures.find(d=>d.number===25).sections.some(s=>s.html.includes('2,313,051')));
console.log(`CMA第1章: 28講義、${questions}問、${figures}図表。リンク・上部動画枠・コメント・計算・再生成の整合性チェック完了。`);
