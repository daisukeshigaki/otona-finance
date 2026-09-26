import fs from 'node:fs';

const pages=['00','01','02','03','04'];
for(const id of pages){
 const path=`cma/00/${id}/index.html`;
 let html=fs.readFileSync(path,'utf8');
 const figure=`<figure class="foundation-goal"><img src="/assets/images/cma/00/goals/cma-00-${id}-goal.svg" alt="この講義で身につくこと" loading="eager"><figcaption>この講義で身につくこと</figcaption></figure>`;
 html=html.replace(new RegExp(`<figure class="foundation-goal"><img src="/assets/images/cma/00/goals/cma-00-${id}-goal\\.svg"[\\s\\S]*?</figure>`),'');
 html=html.replace('<section id="video">',figure+'<section id="video">');
 if(id==='00'&&!html.includes('こんな人におすすめ'))html=html.replace('<section id="s1"><h2>1. CMAで何を学ぶ？</h2>','<section class="foundation-audience" aria-labelledby="recommended"><h2 id="recommended">こんな人におすすめ</h2><div class="cma-flow"><div><strong>企業の数字を読めるようになりたい</strong><br>決算書を眺めるだけでなく、利益・現金・価値をつなげたい人。</div><div><strong>運用・金融の仕事へ進みたい</strong><br>証券、銀行、運用、IR、経営企画で共通言語を身につけたい人。</div><div><strong>資格取得まで道筋を作りたい</strong><br>試験制度、全体範囲、学習時間を知ってから始めたい人。</div></div><p class="note">投資経験や会計知識がなくても始められます。0章で全体像をつかみ、分からない用語は第1章以降で順番に学びます。</p></section><section id="s1"><h2>1. CMAで何を学ぶ？</h2>');
 fs.writeFileSync(path,html);
}
