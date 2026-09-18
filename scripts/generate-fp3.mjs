import fs from 'node:fs';
import { lectures as foundation } from './fp3-lesson-content.mjs';
import { riskLectures } from './fp3-risk-content.mjs';
import { investmentLectures } from './fp3-investment-content.mjs';
import { taxLectures } from './fp3-tax-content.mjs';
import { propertyLectures } from './fp3-property-content.mjs';
import { inheritanceLectures } from './fp3-inheritance-content.mjs';
import { reviewLectures } from './fp3-review-content.mjs';
import { diagrams, pendingDiagramIds } from './fp3-chapter1-diagrams.mjs';
import { lessonIntroductions } from './fp3-chapter1-introductions.mjs';
import { diagrams as chapter2Diagrams } from './fp3-chapter2-diagrams.mjs';
import { lessonIntroductions as chapter2Introductions } from './fp3-chapter2-introductions.mjs';
import { diagrams as chapter3Diagrams } from './fp3-chapter3-diagrams.mjs';
import { lessonIntroductions as chapter3Introductions } from './fp3-chapter3-introductions.mjs';
import { reviseOrientation } from './fp3-orientation.mjs';
import { addExamQuestions } from './fp3-exam-level-questions.mjs';
const lectures=[...foundation,...riskLectures,...investmentLectures,...taxLectures,...propertyLectures,...inheritanceLectures,...reviewLectures];
reviseOrientation(lectures);
addExamQuestions(lectures);

lectures.sort((a,b)=>a.chapter-b.chapter||a.number-b.number);

// Emit an apply_patch document; generation never writes the user's files itself.
const changes=[];
function patch(path,next){if(process.argv[2]&&path!==process.argv[2])return;const old=fs.existsSync(path)?fs.readFileSync(path,'utf8'):null;if(old!==null&&old.trimEnd()===next.trimEnd())return;if(old===null){changes.push(`*** Add File: ${path}\n${next.trimEnd().split('\n').map(l=>'+'+l).join('\n')}`);}else{changes.push(`*** Update File: ${path}\n@@\n${old.trimEnd().split('\n').map(l=>'-'+l).join('\n')}\n${next.trimEnd().split('\n').map(l=>'+'+l).join('\n')}`);}}
const curriculum=JSON.parse(fs.readFileSync('assets/data/fp3-curriculum.json','utf8'));
const base=fs.readFileSync('fp3/00/index.html','utf8');
const header=base.match(/<header[\s\S]*?<\/header>/)[0];
const comment=fs.readFileSync('beginner/03/index.html','utf8').match(/<section id="comments"[\s\S]*?<\/section>/)[0];
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const registry=JSON.parse(fs.readFileSync('backend/lessons.json','utf8'));
for(let i=0;i<lectures.length;i++){
 const d=lectures[i],chapter=curriculum.chapters[d.chapter],lesson=chapter.lessons[d.number-1];
 const route=`/fp3/${String(d.chapter).padStart(2,'0')}/${String(d.number).padStart(2,'0')}/`;
 d.route=route;lesson.status='published';lesson.url=route;lesson.videoStatus='planned';
 registry[route]=lesson.title;
}
for(let i=0;i<lectures.length;i++){
 const d=lectures[i],ch=curriculum.chapters[d.chapter],lesson=ch.lessons[d.number-1];
 const confirmed=d.chapter===2||d.chapter===3?'2026年9月18日':d.updated||'2026年9月16日';
 const previous=lectures[i-1],next=lectures[i+1];
 const upcoming=curriculum.chapters[d.chapter+1];
 const nav=`<nav class="fp-next" aria-label="講義ナビゲーション">${previous?`<a href="${previous.route}"><small>← 前の講義</small>${curriculum.chapters[previous.chapter].lessons[previous.number-1].title}</a>`:`<a href="/fp3/"><small>← 講座の全体像</small>FP3級の章一覧</a>`}${next?`<a href="${next.route}"><small>次の講義 →</small>${curriculum.chapters[next.chapter].lessons[next.number-1].title}</a>`:upcoming?`<a href="/fp3/${String(upcoming.chapter).padStart(2,'0')}/"><small>次の章のメニュー →</small>第${upcoming.chapter}章 ${upcoming.title}（講義準備中）</a>`:`<a href="/fp3/">FP3級の章一覧へ</a>`}</nav>`;
 const pedagogy=d.chapter===1?lessonIntroductions[d.number]:d.chapter===2?chapter2Introductions[d.number]:d.chapter===3?chapter3Introductions[d.number]:null;
 const goalId='goal-'+String(d.chapter).padStart(2,'0')+'-'+String(d.number).padStart(2,'0');
 const goalImage='/assets/images/fp3/goals/'+goalId+'.png';
 const goalFigure=`<figure class="fp-learning-visual fp-goal-visual"><a href="${goalImage}" target="_blank" rel="noopener" aria-label="この講義で身につくことの図を拡大"><img src="${goalImage}" alt="この講義で身につくこと：${esc(d.goal)}" width="1672" height="941" fetchpriority="high"></a><figcaption>この講義で身につくこと <a href="${goalImage}" target="_blank" rel="noopener">図を拡大</a></figcaption></figure>`;
 const visualSpecs=d.chapter===1?diagrams.filter(x=>!pendingDiagramIds.has(x.id)):d.chapter===2?chapter2Diagrams:d.chapter===3?chapter3Diagrams:[];
 const imageDirectory=String(d.chapter).padStart(2,'0');
 const intro=pedagogy?`<section class="fp-section fp-chapter-intro" id="introduction"><h2>はじめに：この回で扱う場面</h2>${pedagogy.intro}</section>`:'';
 const sections=d.sections.map((s,n)=>{
  const figures=visualSpecs.filter(x=>x.lesson===d.number&&x.section===n+1).map(x=>`<figure class="fp-learning-visual"><a href="/assets/images/fp3/${imageDirectory}/${x.id}.png" target="_blank" rel="noopener" aria-label="図を拡大して見る"><img src="/assets/images/fp3/${imageDirectory}/${x.id}.png" alt="${esc(x.caption)}" loading="lazy" width="1672" height="941"></a><figcaption>${x.caption} <a href="/assets/images/fp3/${imageDirectory}/${x.id}.png" target="_blank" rel="noopener">図を拡大</a></figcaption></figure>`).join('');
  const anchor=d.chapter===1&&d.number===2&&n===2?s.html.indexOf('<figure>'):-1;
  const body=anchor>=0?s.html.slice(0,anchor)+figures+s.html.slice(anchor):s.html+figures;
  return `<section class="fp-section" id="s${n+1}"><h2>${n+1}. ${s.title}</h2>${body}</section>`;
 }).join('\n');
 const existing=fs.existsSync(d.route.slice(1)+'index.html')?fs.readFileSync(d.route.slice(1)+'index.html','utf8'):'';
 const cssVersion='20260919-learning-goals';
 const jsVersion=d.chapter===1?'20260918-labelled-figures':existing.match(/community\.js\?v=([^" ]+)/)?.[1]||'20260916';
 const html=`<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(lesson.title)}｜FP3級 ${lesson.code}｜おとなのファイナンス</title><meta name="description" content="${esc(d.lead)}"><link rel="canonical" href="https://otona-finance.net${d.route}"><link rel="icon" href="/assets/images/brand/logo-mark.png"><link rel="stylesheet" href="/assets/css/site.css"><link rel="stylesheet" href="/assets/css/brand.css"><link rel="stylesheet" href="/assets/css/free-banner.css?v=20260916"><link rel="stylesheet" href="/assets/css/fp3-lesson.css?v=${cssVersion}"><link rel="stylesheet" href="/assets/css/community.css?v=20260916"><script defer src="/assets/js/community.js?v=${jsVersion}"></script></head><body>
${header}
<main class="fp-lesson"><nav class="fp-breadcrumb" aria-label="パンくず"><a href="/">ホーム</a> / <a href="/fp3/">FP3級</a> / <a href="/fp3/${String(d.chapter).padStart(2,'0')}/">第${d.chapter}章 ${ch.title}</a> / ${lesson.code}</nav>
<div class="fp-hero"><p class="label">FP3級 · 第${d.chapter}章 / 第${d.number}回 <span class="fp-free">全編無料</span></p><h1>${lesson.title}</h1><p class="lead">${pedagogy?.lead||d.lead}</p><p class="fp-meta">教材番号 ${lesson.code} · 更新・制度確認：${confirmed} · 動画：約10分を予定（未収録）</p><div class="fp-note">${pedagogy?`<strong>この講義で学ぶこと</strong><ul class="fp-learning-points">${pedagogy.points.map(x=>`<li>${x}</li>`).join('')}</ul>`:`<strong>この講義のゴール</strong><p>${d.goal}</p>`}</div></div>
${goalFigure}
<section class="fp-video" aria-label="講義動画"><h2>動画埋め込み枠</h2><p>動画は撮影・公開後にここへ追加します。先に下の記事と練習問題で学べます。</p></section>
${intro?intro+'\n':''}<nav class="fp-toc" aria-label="この講義の目次"><strong>この講義で学ぶこと</strong><ol>${pedagogy?'<li><a href="#introduction">はじめに</a></li>':''}${d.sections.map((s,n)=>`<li><a href="#s${n+1}">${s.title}</a></li>`).join('')}<li><a href="#practice">練習問題</a></li><li><a href="#recap">まとめ</a></li></ol></nav>
${sections}
<section class="fp-section" id="practice"><h2>練習問題</h2><p>問題に必要な条件・数値は、各問の中にすべて記載しています。計算問題は電卓を使って構いません。いずれも本サイトのオリジナル問題です。</p>${d.questions.map((q,n)=>`<article class="fp-question"><h3>問${n+1}：${q.title}</h3>${q.data}<p>${q.ask}</p><details><summary>答えと考え方を見る</summary><div class="fp-answer">${q.answer}</div></details></article>`).join('')}</section>
<section class="fp-section" id="recap"><h2>この講義のまとめ</h2><ul>${d.recap.map(s=>`<li>${s}</li>`).join('')}</ul></section>
<section class="fp-section fp-sources" id="sources"><h2>出典・制度の確認先</h2><p>確認日：${confirmed}。2026年10月の日本FP協会CBT試験の法令基準日は2026年4月1日です。実生活の現行制度と試験の基準時点が異なる箇所は、本文で分けて示しています。</p><ul>${d.sources.map(([name,url])=>`<li><a href="${url}" target="_blank" rel="noopener">${name}</a></li>`).join('')}<li><a href="https://www.jafp.or.jp/exam/schedule/" target="_blank" rel="noopener">日本FP協会：試験日程・法令基準日</a></li></ul></section>
${comment}
${nav}<p class="fp-disclaimer">本サイトは独自の学習教材であり、日本FP協会・金融財政事情研究会の公式教材ではありません。世帯・人物・計算用の金額は、特記のない限り架空の例です。給付には個別の要件・申請があり、個別の税務・法律・投資助言を行うものではありません。適用制度は加入先・公的機関の最新案内で確認してください。</p></main><footer><strong>おとなのファイナンス</strong><span>暮らしのお金を、基礎から。</span><small><a href="/contact/">お問い合わせ</a> · <a href="/privacy/">投稿・個人情報の扱い</a></small></footer></body></html>
`;
 patch(d.route.slice(1)+'index.html',html);
}
for(const ch of curriculum.chapters.filter(c=>c.lessons.every(l=>l.status==='published'))){
 const path=`fp3/${String(ch.chapter).padStart(2,'0')}/index.html`;
 let html=fs.readFileSync(path,'utf8');
 html=html.replace(/<ol class="article-list">[\s\S]*?<\/ol>/,`<ol class="article-list">${ch.lessons.map((l,n)=>`<li><a href="${l.url}"><div class="article-copy"><span class="article-title">第${n+1}回：${l.title}</span><p>${l.description}<span class="lesson-code">教材番号 ${l.code}</span></p></div><span class="read-arrow" aria-hidden="true">→</span></a></li>`).join('')}</ol>`);
 html=html.replace(/現在はメニューのみ公開しています。記事が完成した講義からリンクを追加します。/,'この章の全講義の記事・図解・練習問題を公開しました。動画は未収録で、撮影後に追加します。');patch(path,html);
}
curriculum.status='in-progress';curriculum.updated='2026-09-17';curriculum.publishedLessons=lectures.length;
patch('assets/data/fp3-curriculum.json',JSON.stringify(curriculum,null,2)+'\n');
patch('backend/lessons.json',JSON.stringify(registry,null,2)+'\n');
const published=`第0〜${Math.max(...lectures.map(d=>d.chapter))}章の計${lectures.length}講義`;
const publishedPattern=/第0(?:章・第1章(?:の)?|〜\d章の)計\d+講義/g;
let top=fs.readFileSync('fp3/index.html','utf8').replaceAll(publishedPattern,published);
if(lectures.length===curriculum.totalLessons)top=top.replaceAll('全8章・45講義の制作計画','全8章・45講義の学習講座').replaceAll('を中心に制作する予定です','を中心に構成しています');
patch('fp3/index.html',top);
patch('index.html',fs.readFileSync('index.html','utf8').replaceAll(publishedPattern,published));
process.stdout.write('*** Begin Patch\n'+changes.join('\n')+'\n*** End Patch\n');
