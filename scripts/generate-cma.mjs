import fs from 'node:fs';
import {accountingLectures} from './cma-accounting-content.mjs';
import {refineCmaChapter1,writeCmaChapter1Visuals,writeCmaFoundationVisuals} from './cma-chapter1-quality.mjs';
import {corporateLectures} from './cma-corporate-content.mjs';
import {equityLectures} from './cma-equity-content.mjs';
import {bondLectures,derivativeLectures,portfolioLectures,economicsLectures} from './cma-advanced-content.mjs';
import {refineEconomicsFirstFive} from './cma-economics-refinement.mjs';
refineCmaChapter1(accountingLectures);
writeCmaChapter1Visuals(accountingLectures);
writeCmaFoundationVisuals();
refineEconomicsFirstFive(economicsLectures);
const groups=[[1,accountingLectures],[2,corporateLectures],[3,equityLectures],[4,bondLectures],[5,derivativeLectures],[6,portfolioLectures],[7,economicsLectures]];
const lectures=groups.flatMap(([chapter,items])=>items.map(d=>({...d,chapter})));
const changes=[];
function patch(path,next){if(process.argv[2]&&path!==process.argv[2])return;const old=fs.existsSync(path)?fs.readFileSync(path,'utf8'):null;if(old?.trimEnd()===next.trimEnd())return;changes.push(old===null?`*** Add File: ${path}\n${next.trimEnd().split('\n').map(l=>'+'+l).join('\n')}`:`*** Update File: ${path}\n@@\n${old.trimEnd().split('\n').map(l=>'-'+l).join('\n')}\n${next.trimEnd().split('\n').map(l=>'+'+l).join('\n')}`);}
const curriculum=JSON.parse(fs.readFileSync('assets/data/cma-curriculum.json','utf8'));
const header=fs.readFileSync('cma/01/index.html','utf8').match(/<header[\s\S]*?<\/header>/)[0];
const comment=fs.readFileSync('beginner/03/index.html','utf8').match(/<section id="comments"[\s\S]*?<\/section>/)[0];
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const registry=JSON.parse(fs.readFileSync('backend/lessons.json','utf8'));
lectures.sort((a,b)=>a.chapter-b.chapter||a.number-b.number);
for(const d of lectures){const chapter=curriculum.chapters.find(c=>c.number===d.chapter),l=chapter.lessons[d.number-1];d.route=`/cma/${String(d.chapter).padStart(2,'0')}/${String(d.number).padStart(2,'0')}/`;l.status='published';l.url=d.route;l.videoStatus='planned';l.description=d.lead;registry[d.route]=l.title;}
for(let i=0;i<lectures.length;i++){
 const d=lectures[i],chapter=curriculum.chapters.find(c=>c.number===d.chapter),l=chapter.lessons[d.number-1],prev=lectures[i-1],next=lectures[i+1];
 const nav=`<nav class="fp-next" aria-label="講義ナビゲーション">${prev?`<a href="${prev.route}"><small>← 前の講義</small>${esc(curriculum.chapters.find(c=>c.number===prev.chapter).lessons[prev.number-1].title)}</a>`:'<a href="/cma/00/04/"><small>← 第0章の最後へ</small>株式・債券・現金・デリバティブ</a>'}${next?`<a href="${next.route}"><small>次の講義 →</small>${esc(curriculum.chapters.find(c=>c.number===next.chapter).lessons[next.number-1].title)}</a>`:`<a href="/cma/${String(d.chapter+1).padStart(2,'0')}/"><small>次の章のメニュー →</small>第${d.chapter+1}章 ${curriculum.chapters.find(c=>c.number===d.chapter+1).title}（記事準備中）</a>`}</nav>`;
 const sections=d.sections.map((s,n)=>`<section class="fp-section" id="s${n+1}"><h2>${n+1}. ${s.title}</h2>${s.html}${(d.visuals||[]).filter(v=>v.section===n).map(v=>`<figure class="fp-learning-visual fp-concept-visual"><img src="${v.src}" alt="${esc(v.alt)}" loading="lazy"><figcaption>${esc(v.caption)}</figcaption></figure>`).join('')}</section>`).join('\n');
 const html=`<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(l.title)}｜CMA ${l.id}｜おとなのファイナンス</title><meta name="description" content="${esc(d.lead)}"><link rel="canonical" href="https://otona-finance.net${d.route}"><link rel="icon" href="/assets/images/brand/logo-mark.png"><link rel="stylesheet" href="/assets/css/site.css"><link rel="stylesheet" href="/assets/css/brand.css"><link rel="stylesheet" href="/assets/css/free-banner.css?v=20260916"><link rel="stylesheet" href="/assets/css/fp3-lesson.css?v=20260916"><link rel="stylesheet" href="/assets/css/community.css?v=20260916"><script defer src="/assets/js/community.js?v=20260916"></script></head><body>
${header}
<main class="fp-lesson cma-lesson"><nav class="fp-breadcrumb" aria-label="パンくず"><a href="/">ホーム</a> / <a href="/cma/">CMA</a> / <a href="/cma/${String(d.chapter).padStart(2,'0')}/">第${d.chapter}章 ${esc(chapter.title)}</a> / ${l.id}</nav>
<div class="fp-hero"><p class="label">CMA · 第${d.chapter}章 / 第${d.number}回 <span class="fp-free">全編無料</span></p><h1>${esc(l.title)}</h1><p class="lead">${d.lead}</p><p class="fp-meta">教材番号 ${l.id} · ${l.level} · 更新・基準確認：${d.chapter===1?'2026年9月26日':'2026年9月17日'} · 動画：約10分を予定（未収録）</p><div class="fp-note"><strong>この講義のゴール</strong><p>${d.goal}</p></div></div>${d.goalImage?`\n<figure class="fp-learning-visual fp-goal-visual"><img src="${d.goalImage}" alt="${esc(d.goal)}" loading="eager"><figcaption>この講義で身につくこと</figcaption></figure>`:''}
<section class="fp-video" aria-label="講義動画"><h2>動画埋め込み枠</h2><p>動画は撮影・公開後にここへ追加します。先に記事と練習問題で学べます。</p></section>
<nav class="fp-toc" aria-label="この講義の目次"><strong>この講義で学ぶこと</strong><ol>${d.sections.map((s,n)=>`<li><a href="#s${n+1}">${s.title}</a></li>`).join('')}<li><a href="#practice">練習問題</a></li><li><a href="#recap">まとめ</a></li></ol></nav>
${sections}
<section class="fp-section" id="practice"><h2>練習問題</h2><p>必要な条件・数値・計算式は各問に記載しています。計算問題は電卓を使って構いません。本サイト独自の問題で、公式試験問題ではありません。</p>${d.questions.map((q,n)=>`<article class="fp-question"><h3>問${n+1}：${q.title}</h3>${q.data}<p>${q.ask}</p><details><summary>答えと考え方を見る</summary><div class="fp-answer">${q.answer}</div></details></article>`).join('')}</section>
<section class="fp-section" id="recap"><h2>この講義のまとめ</h2><ul>${(d.recap||d.sections.map(x=>x.title)).map(x=>`<li>${x}</li>`).join('')}</ul></section>
<section class="fp-section fp-sources" id="sources"><h2>${d.chapter===1?'出典・会計基準の確認先':'出典・制度・モデルの確認先'}</h2><p>確認日：${d.chapter===1?'2026年9月26日':'2026年9月17日'}。${d.chapter===1?'日本基準とIFRSは、共通する基本構造と異なる取扱いを分けて説明しています。分析指標の定義は本文・各問の条件に従ってください。':'公式制度・モデルの確認先です。本文の数値は、実在企業の資料を明記した箇所以外は架空の計算仮定です。予測値は保証ではなく、指標の定義は各問の条件に従います。'}</p><ul>${d.sources.map(([name,url])=>`<li><a href="${url}" target="_blank" rel="noopener">${name}</a></li>`).join('')}<li><a href="https://www.saa.or.jp/cma_program/cma1/kouza/" target="_blank" rel="noopener">日本証券アナリスト協会：第1次レベル講座の公式案内</a></li></ul></section>
${comment}
${nav}<p class="fp-disclaimer">独自の学習教材であり、日本証券アナリスト協会の公式教材ではありません。企業名・実績資料を明記した箇所以外の会社・人物・金額は架空の計算例です。税率等は計算用の仮定で、個別の会計・税務・法律・投資助言ではありません。実務処理は適用基準と契約・事実関係を確認してください。</p></main><footer><strong>おとなのファイナンス</strong><span>会計・企業分析・投資を基礎から。</span><small><a href="/contact/">お問い合わせ</a> · <a href="/privacy/">投稿・個人情報の扱い</a></small></footer></body></html>
`;
 patch(d.route.slice(1)+'index.html',html);
}
for(const [chapterNumber,items] of groups){
 const chapter=curriculum.chapters.find(c=>c.number===chapterNumber),path='cma/'+String(chapterNumber).padStart(2,'0')+'/index.html';
 let catalog=fs.readFileSync(path,'utf8').replace(/<ol class="article-list">[\s\S]*?<\/ol>/,'<ol class="article-list">'+chapter.lessons.map((l,n)=>'<li><a href="'+l.url+'"><div class="article-copy"><span class="article-title">第'+(n+1)+'回：'+esc(l.title)+'</span><p>'+l.description+'<span class="lesson-code">教材番号 '+l.id+'</span></p></div><span class="read-arrow" aria-hidden="true">→</span></a></li>').join('')+'</ol>');
 catalog=catalog.replaceAll('この章で扱う講義の一覧です。記事は準備できたものから順次公開します。','全'+chapter.count+'講義の記事・図表・練習問題を公開しました。動画は撮影後に追加します。');
 patch(path,catalog);chapter.status='published';chapter.publishedLessons=items.length;
}
const total=5+lectures.length,description='第0章の導入＋4講義と、第1〜'+groups.at(-1)[0]+'章の'+lectures.length+'講義を公開しています。';
let top=fs.readFileSync('cma/index.html','utf8').replace(/第0章の導入＋4講義(?:と、第[^。]*講義)?を公開しています。/g,description);
for(const [number] of groups){const chapter=curriculum.chapters.find(c=>c.number===number),code=String(number).padStart(2,'0');top=top.replace(new RegExp('(<a href="/cma/'+code+'/">[\\s\\S]*?<p>)[\\s\\S]*?(</p>)'),'$1全'+chapter.count+'講義を公開中。図表・具体例・練習問題で学ぶ。$2');}
patch('cma/index.html',top);
curriculum.updated='2026-09-17';
patch('assets/data/cma-curriculum.json',JSON.stringify(curriculum,null,2)+'\n');
patch('backend/lessons.json',JSON.stringify(registry,null,2)+'\n');
patch('index.html',fs.readFileSync('index.html','utf8').replace(/第0章＋第[^。]*・計\d+講義を公開中。/,'第0〜'+groups.at(-1)[0]+'章・計'+total+'講義を公開中。').replace(/第0〜\d+章・計\d+講義を公開中。/,'第0〜'+groups.at(-1)[0]+'章・計'+total+'講義を公開中。'));
process.stdout.write('*** Begin Patch\n'+changes.join('\n')+'\n*** End Patch\n');
