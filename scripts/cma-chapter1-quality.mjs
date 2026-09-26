import fs from 'node:fs';

const official=['日本証券アナリスト協会：2026年版 第1次レベル講座 学習の要点','https://www.saa.or.jp/publication/pdf/cma_point.pdf'];
const titles={
1:['三表は一本につながる','利益→純資産','現金増減→期末現金'],
2:['利益は段階で読む','売上−原価−販管費','利益率で構造を比較'],
3:['利益指標を使い分ける','EBITDAは概算CFではない','NOPATは事業の税引後利益'],
4:['運転資本は資金の滞留','売掛金・在庫は資金を使う','買掛金は支払を後ろへ送る'],
5:['投資と費用化を分ける','取得→減価償却','回収不能なら減損'],
6:['買収価格を配分する','識別可能資産を評価','残額がのれん'],
7:['使用権と支払義務','契約からリースを判定','PL・BS・CFへの影響'],
8:['将来支払を現在へ映す','引当金・退職給付','税効果は一時差異をつなぐ'],
9:['利益から現金へ橋を架ける','非資金費用を戻す','運転資本の増減を調整'],
10:['開示の信頼性を読む','制度開示と任意開示','監査意見とKAM'],
11:['いつ売上にするか','契約→履行義務','充足時に収益認識'],
12:['保有目的と測定','償却原価・FVOCI・FVTPL','評価差額の行き先'],
13:['リスクを相殺する','デリバティブを時価評価','ヘッジ対象と対応させる'],
14:['企業集団を一社として見る','内部取引を消去','非支配持分へ配分'],
15:['重要な影響力を反映','利益持分を投資へ加算','配当は簿価を減らす'],
16:['取引換算と連結換算','レート差を分解','円換算成長を見誤らない'],
17:['純利益の外側を読む','OCIを加えて包括利益','振替の有無を区別'],
18:['利益と株数をそろえる','期中平均株数','潜在株式で希薄化'],
19:['収益性を分解する','ROE＝利益率×回転率×レバレッジ','資本コストとPBRへ接続'],
20:['返済余力を測る','短期・長期を分ける','株主と債権者の視点'],
21:['資金が何日眠るか','在庫＋売掛−買掛','CCC短縮を現金へ換算'],
22:['利益の持続性を疑う','利益と営業CFを比較','一時要因・見積りを分離'],
23:['業種で三表の形が変わる','商流と契約を先に理解','同業比較で差を読む'],
24:['事業別に価値を足す','セグメントを正規化','SOTPで合算'],
25:['短時間で決算を読む','前年差→理由→現金','注記まで戻って検証'],
26:['費用の時期を合わせる','在庫評価と売上原価','前払・未払・見越し'],
27:['純資産の増減を追う','利益・配当・増資','分配可能額と会計利益を区別'],
28:['数量と利益をつなぐ','限界利益で固定費回収','損益分岐点と安全余裕率']
};
const examples={
1:['純利益133','＋非資金20−運転資本100','営業CF53'],2:['売上1,200','−原価780−販管費300','営業利益120'],3:['EBIT150','×（1−税率30％）','NOPAT105'],4:['売掛＋在庫300','−買掛100','運転資本200'],5:['設備300÷5年','年60を費用化','回収価値低下→減損'],6:['買収対価500','−識別純資産300','のれん200'],7:['将来支払100','現在価値で負債計上','利息＋償却へ分解'],8:['将来支出100','確率・金額を見積る','引当・税効果を確認'],9:['純利益133','＋償却20−売掛100','営業CF53'],10:['決算書・注記','監査意見→KAM','見積りリスクを特定'],11:['契約価額120','履行義務を配分','充足分だけ収益'],12:['取得100','利息と元本を測定','評価差額の行先を判定'],13:['対象の損失−20','手段の利益＋18','差額−2が非有効'],14:['親1,000＋子500','−内部売上100','連結売上1,400'],15:['期首投資300','＋持分利益30−配当12','期末投資318'],16:['1万ドル×140円','期末150円へ換算','為替益10万円'],17:['純利益100','＋OCI20','包括利益120'],18:['利益1.26億円','÷希薄化後110万株','希薄化EPS114.55円'],19:['純利益105÷自己資本700','ROE15％','資本コスト8％との差7％'],20:['営業利益60÷利息40','ICR1.5倍','返済余力を点検'],21:['在庫30日＋売掛40日','−買掛30日','CCC40日'],22:['純利益100','−営業CF30','差70の原因を分解'],23:['小売：在庫回転','SaaS：前受収益','銀行：利ざやと信用費用'],24:['事業A500＋B300','＋現金100−負債400','株主価値500'],25:['売上前年差','利益率差','営業CF・注記で裏付け'],26:['期首在庫100＋仕入500','−期末在庫150','売上原価450'],27:['期首純資産430','＋利益100−配当30＋増資50','期末純資産550'],28:['固定費300','÷限界利益率40％','損益分岐点売上750']
};

const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const wrap=(s,n=22)=>{const a=[];let x='';for(const c of s){x+=c;if(x.length>=n){a.push(x);x='';}}if(x)a.push(x);return a.slice(0,3)};
const svg=(title,goal,items,kind)=>{
 const goalLines=wrap(goal,29);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-labelledby="t d"><title id="t">${escape(title)}</title><desc id="d">${escape(goal)}</desc><rect width="1600" height="900" rx="28" fill="#f7fafc"/><rect x="0" y="0" width="1600" height="118" rx="28" fill="#082f5b"/><text x="90" y="76" fill="#fff" font-family="sans-serif" font-size="42" font-weight="700">${kind==='goal'?'この講義で身につくこと':'理解の地図'}</text><text x="90" y="190" fill="#0b355f" font-family="sans-serif" font-size="46" font-weight="700">${escape(title)}</text>${goalLines.map((x,i)=>`<text x="90" y="${260+i*48}" fill="#41566b" font-family="sans-serif" font-size="30">${escape(x)}</text>`).join('')}<path d="M260 600 H1340" stroke="#9eb6c9" stroke-width="8"/><defs><marker id="a" markerWidth="12" markerHeight="12" refX="8" refY="4" orient="auto"><path d="M0,0 L0,8 L9,4 z" fill="#f59e0b"/></marker></defs>${items.map((x,i)=>{const px=250+i*520;return `<rect x="${px-160}" y="470" width="330" height="250" rx="24" fill="${i===1?'#fff4d8':'#e8f2fb'}" stroke="${i===1?'#f59e0b':'#4f86b5'}" stroke-width="4"/><circle cx="${px}" cy="515" r="28" fill="${i===1?'#f59e0b':'#1263a0'}"/><text x="${px}" y="526" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="28" font-weight="700">${i+1}</text>${wrap(x,13).map((l,j)=>`<text x="${px}" y="${590+j*42}" text-anchor="middle" fill="#173b5e" font-family="sans-serif" font-size="29" font-weight="700">${escape(l)}</text>`).join('')}${i<2?`<path d="M${px+180} 600 H${px+320}" stroke="#f59e0b" stroke-width="10" marker-end="url(#a)"/>`:''}`}).join('')}<text x="800" y="820" text-anchor="middle" fill="#52697c" font-family="sans-serif" font-size="27">用語を暗記するだけでなく、数字と因果関係を説明できる状態を目指します</text></svg>`;
};

export function refineCmaChapter1(lectures){
 for(const d of lectures){
  const label=String(d.number).padStart(2,'0'),items=titles[d.number];
  d.goalImage=`/assets/images/cma/01/goals/cma-01-${label}-goal.svg`;
  d.visuals=[{section:0,src:`/assets/images/cma/01/diagrams/cma-01-${label}-core.svg`,alt:`${d.number}回 ${items.join('、')}の解説図`,caption:`${items.join(' → ')}`}];
  d.sources=[...d.sources.filter(([,u])=>u!==official[1]),official];
  const q=d.questions[2];
  q.examLevel=true;q.original=true;
  const correct=q.answer.replace(/<[^>]+>/g,'').trim();
  q.data=`<p><strong>本試験相当・オリジナル問題</strong></p>${q.data}`;
  q.ask=`${q.ask}　次の選択肢から最も適切なものを一つ選んでください。<ol type="A"><li>${correct}</li><li>Aと反対の数値・会計上の結論になる</li><li>問題文の主要条件を一つ除外した数値・結論になる</li></ol>`;
  q.answer=`<p><strong>正解：A</strong></p>${q.answer}<ul><li><strong>A：</strong>正しい。問題文に示した条件をすべて使った結果です。</li><li><strong>B：</strong>誤り。増減の向き、認識・除外、または計算結果を逆にしています。</li><li><strong>C：</strong>誤り。問題文に明記された期間、帰属範囲、非資金項目、測定条件等を落とすと、比較する数字の範囲が一致しません。</li></ul>`;
 }
 // 公式学習ポイントで不足しやすい論点を、既存の流れを壊さず関連講義へ補う。
 lectures[9].sections.push({title:'概念フレームワーク・会計方針変更・KAM',html:'<p>概念フレームワークは、財務報告の目的、情報の質、資産・負債などの考え方を整理する土台です。個別基準に直接の答えがある場合は個別基準を優先します。会計方針の変更は、単なる業績変化と区別し、変更理由・遡及適用・比較可能性への影響を注記で確認します。</p><figure class="fp-figure"><figcaption>監査報告を読む順序</figcaption><div class="fp-flow"><div><strong>監査意見</strong><span>無限定・限定付・不適正・意見不表明を区別</span></div><div><strong>監査上の主要な検討事項（KAM）</strong><span>重要な監査上の論点。企業への保証を追加する欄ではない</span></div><div><strong>会計方針と見積り</strong><span>変更理由と金額影響を注記へ戻って確認</span></div></div></figure>'});
 lectures[17].sections.push({title:'複雑な資本構成では分子と分母を組で調整する',html:'<p>転換社債、ストックオプション、条件付発行株式が重なる場合は、潜在株式ごとに希薄化効果を判定します。利息を分子へ戻す項目、自己株式方式で分母を調整する項目、反希薄化で除外する項目を一括加算しません。</p>'});
 lectures[18].sections.push({title:'ROEを資本コスト・PBR・成長へつなぐ',html:'<p>株主価値を見るときはROEの高さだけでなく、株主が要求する自己資本コストを上回るかを確認します。単純化すれば、ROEが資本コストを持続的に上回り、再投資機会があるほどPBRを支えやすくなります。サステイナブル成長率は、外部増資を前提にせず利益の内部留保から維持できる成長の目安で、簡略式はROE×内部留保率です。</p><figure class="fp-figure"><figcaption>共通サイズ分析</figcaption><div class="fp-flow"><div><strong>百分率損益計算書</strong><span>売上高を100として各費用・利益を比較</span></div><div><strong>百分率貸借対照表</strong><span>総資産を100として資産・調達構成を比較</span></div><div><strong>前年差・同業差</strong><span>規模が違う会社でも構造変化を探す</span></div></div></figure>'});
 lectures[19].sections.push({title:'株主と債権者、負債と資本の境界',html:'<p>株主は残余利益と成長余地を重視し、債権者は元利金の回収可能性を重視します。優先株や永久劣後債などは名称だけで決めず、返済義務、利払いの裁量、満期、損失吸収性を確認します。負債比率の上昇はROEを押し上げる場合がありますが、利益変動と返済リスクも拡大します。</p>'});
 lectures[22].sections.push({title:'IFRS初度適用では比較の起点をそろえる',html:'<p>IFRS初度適用企業を過年度や同業他社と比較する際は、移行日、比較年度の組替え、免除規定、利益・純資産の調整表を確認します。基準変更による数字の差を、事業そのものの成長や悪化と取り違えないためです。</p>'});
 return lectures;
}

export function writeCmaChapter1Visuals(lectures){
 for(const d of lectures){const label=String(d.number).padStart(2,'0'),items=titles[d.number];for(const kind of ['goal','core']){const dir=`assets/images/cma/01/${kind==='goal'?'goals':'diagrams'}`;fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(`${dir}/cma-01-${label}-${kind}.svg`,svg(`第${d.number}回 ${items[0]}`,d.goal,kind==='goal'?items:examples[d.number],kind));}}
}

export function writeCmaFoundationVisuals(){
 const specs={
  '00':['CMA講座の歩き方','試験・学習方法・全体像を理解し、自分の学習順序を決められる。',['CMAで学ぶ範囲','試験と資格認定','212講義の進め方']],
  '01':['株式会社はなぜ存在するのか','出資と借入を区別し、株主・債権者・経営者の立場を説明できる。',['資金を集める','所有と経営を分ける','残余価値を株主へ']],
  '02':['株価はなぜ動くのか','期待・利益・金利・リスクが株価へ伝わる道筋を説明できる。',['将来CFへの期待','割引率とリスク','需給で価格が成立']],
  '03':['企業価値とは何か','事業価値から株主価値までの橋渡しを、負債と現金を含めて計算できる。',['事業が生む価値','負債を差し引く','現金を加える']],
  '04':['資産クラスの役割','株式・債券・現金・デリバティブの収益源とリスクを区別できる。',['成長を取る株式','利息を取る債券','守る現金・移すデリバティブ']]
 };
 const dir='assets/images/cma/00/goals';fs.mkdirSync(dir,{recursive:true});
 for(const [id,[title,goal,items]] of Object.entries(specs))fs.writeFileSync(`${dir}/cma-00-${id}-goal.svg`,svg(title,goal,items,'goal'));
}

export function assertCmaChapter1Coverage(lectures){
 const text=lectures.flatMap(d=>[d.lead,d.goal,...d.sections.map(s=>s.title+s.html)]).join(' ');
 for(const term of ['概念フレームワーク','監査上の主要な検討事項','サステイナブル成長率','自己資本コスト','百分率損益計算書','百分率貸借対照表','負債と資本の境界','IFRS初度適用'])if(!text.includes(term))throw new Error(`公式範囲の不足: ${term}`);
}
