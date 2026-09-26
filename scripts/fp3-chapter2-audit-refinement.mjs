import {p,table,flow,formula,example,note,cite} from './fp3-lesson-content.mjs';

const officialQuestions='https://www.jafp.or.jp/exam/mohan/';
const officialScope='https://www.jafp.or.jp/exam/subjects_03/';
const fsaSmall='https://www.fsa.go.jp/ordinary/syougaku/index.html';
const lifeProtection='https://www.seihohogo.jp/qa/qa12.html';
const lifeReserve='https://www.seihohogo.jp/qa/qa14.html';
const lifeContinuation='https://www.jili.or.jp/knows_learns/basic/continuance/97.html';
const lifeLoan='https://www.jili.or.jp/knows_learns/basic/continuance/93.html';
const zaikei='https://www.jili.or.jp/knows_learns/kind/others/9189.html';
const car='https://www.sonpo.or.jp/insurance/car/';
const water='https://www.sonpo.or.jp/insurance/shizen/';
const jibai='https://www.sonpo.or.jp/insurance/jibai/index.html';
const nonlifeProtection='https://www.sonpohogo.or.jp/qa/1/qa2.html';
const deathTax='https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1750.htm';
const deathExemption='https://www.nta.go.jp/taxes/shiraberu/taxanswer/sozoku/4114.htm';
const annuityTax='https://www.nta.go.jp/taxes/shiraberu/taxanswer/sozoku/4123.htm';
const quakeDeduction='https://www.nta.go.jp/taxes/shiraberu/shinkoku/tebiki/2025/03/order3/3-3_13.htm';
const benefitTax='https://www.nta.go.jp/about/organization/tokyo/bunshokaito/souzoku/130313/01.htm';
const businessDamage='https://www.nta.go.jp/law/joho-zeikaishaku/shotoku/shinkoku/110427/pdf/02.pdf';

const byId=(lectures,id)=>{
 const [chapter,number]=id.split('-').map(Number);
 const lecture=lectures.find(x=>x.chapter===chapter&&x.number===number);
 if(!lecture)throw new Error(`Missing FP3 lecture ${id}`);
 return lecture;
};
const addSource=(lecture,name,url)=>{if(!lecture.sources.some(x=>x[1]===url))lecture.sources.push([name,url]);};
const visual=(file,alt,caption)=>`<figure class="fp-learning-visual"><a href="/assets/images/fp3/02/${file}" target="_blank" rel="noopener" aria-label="${alt}を拡大"><img src="/assets/images/fp3/02/${file}" alt="${alt}" loading="lazy" width="1600" height="900"></a><figcaption>${caption} <a href="/assets/images/fp3/02/${file}" target="_blank" rel="noopener">図を拡大</a></figcaption></figure>`;

export const chapter2RequiredTerms=[
 ['2-1','社会保険'],['2-1','民間保険'],['2-1','少額短期保険'],['2-1','公的セーフティネット'],
 ['2-2','払済保険'],['2-2','延長（定期）保険'],['2-2','解約返戻金の一定範囲'],['2-2','剰余金'],['2-2','団体保険'],['2-2','財形'],
 ['2-3','余命6か月'],['2-3','所得補償保険'],
 ['2-4','洪水'],['2-4','損害保険契約者保護機構'],['2-4','施設所有（管理）者賠償責任保険'],['2-4','請負業者賠償責任保険'],
 ['2-5','500万円×法定相続人の数'],['2-5','入院給付金'],['2-5','地震保険料控除'],['2-5','年金受給権'],['2-5','事業用固定資産'],
 ['2-6','契約の条件から対象となる給付を選ぶ']
];

export function refineChapter2Audit(lectures){
 const l1=byId(lectures,'2-1'),l2=byId(lectures,'2-2'),l3=byId(lectures,'2-3');
 const l4=byId(lectures,'2-4'),l5=byId(lectures,'2-5'),l6=byId(lectures,'2-6');

 l1.sections.splice(1,0,{
  title:'保険制度の地図：公的保障・民間保険・共済を分ける',
  html:p('保険を学ぶ前に、運営主体と加入の仕方を分けます。国の社会保障制度である社会保険と、契約により保障を上乗せする民間保険は役割が違います。共済や少額短期保険も、名前だけで一般の保険会社と同じ保護があると判断しません。')
   +table('保険制度を見分ける入口',['仕組み','誰が運営・引受けるか','加入・保障の特徴','破綻時等の確認'],[
    ['社会保険','国・地方公共団体や公的な保険者','法律に基づき、医療・年金・介護・雇用・労災などを保障','民間契約とは別の制度'],
    ['民間の生命・損害保険','金融庁の免許を受けた保険会社','契約者が商品・保障額等を選び、約款の条件で給付','生命・損害それぞれの契約者保護機構'],
    ['共済','農協・生協等の根拠法を持つ団体など','原則として組合員等を対象に保障','根拠法・運営団体ごとに確認'],
    ['少額短期保険','財務局の登録を受けた少額短期保険業者','少額・短期。生命・医療は原則1年、損害は2年。1被保険者の総額は原則1,000万円以下','保険契約者保護機構の公的セーフティネット対象外']
   ],'少額短期保険には商品区分ごとの上限もある。少額短期保険業者には保証金の供託制度がある')
   +visual('insurance-system-map-2026.svg','社会保険・民間保険・共済・少額短期保険の位置関係を示す図','加入の根拠と破綻時の保護まで分けると、似た名称を混同しません。')
   +cite('金融庁：少額短期保険業制度',fsaSmall)
 });
 const lawSection=l1.sections.find(s=>s.title.includes('保険契約を守る基本ルール'));
 if(lawSection)lawSection.html+=p('保険会社の募集人・代理店は保険会社の商品を募集します。保険仲立人は、保険会社から独立して契約者側の委託を受けて契約締結を媒介します。誰の立場で契約を仲介するかを区別します。');
 addSource(l1,'日本FP協会：3級試験範囲',officialScope);addSource(l1,'日本FP協会：公開試験問題',officialQuestions);addSource(l1,'金融庁：少額短期保険業制度',fsaSmall);

 const changeSection=l2.sections[3];
 changeSection.html+=p('保険料の負担を止めて契約を残す方法は、次の2つを正確に区別します。')
  +table('払済保険と延長（定期）保険',['変更方法','保障額','保険期間','特約'],[
   ['払済保険','解約返戻金を一時払保険料に充てるため、元契約より小さくなる','元の保険期間を維持','原則消滅'],
   ['延長（定期）保険','元の死亡保険金額を維持','解約返戻金で買える定期保険へ変えるため、元より短くなることがある','原則消滅']
  ],'利用可否・取扱いは契約による。どちらも以後の保険料払込みを中止する')
  +p('契約者貸付は死亡保険金額ではなく、<strong>解約返戻金の一定範囲</strong>で借りる制度です。利息が付き、未返済の元利金は満期保険金・死亡保険金等から差し引かれます。元利金が解約返戻金を超え、所定の払込みをしないと契約が失効する場合もあります。')
  +cite('生命保険文化センター：払済・延長保険',lifeContinuation)+cite('生命保険文化センター：契約者貸付',lifeLoan);
 l2.sections.push({
  title:'配当・団体保険・財形保険は「誰の制度か」を読む',
  html:p('生命保険には個人が単独で結ぶ契約以外もあります。試験では、会社・団体を通じる仕組みと、保険会社の剰余金を分配する仕組みを区別します。')
   +table('個人契約以外の代表論点',['論点','仕組み','注意点'],[
    ['剰余金・契約者配当','予定した死亡率・利率・事業費率と実績との差などから剰余が生じた場合、契約内容に応じて配当','配当がない無配当保険もあり、金額は保証されない'],
    ['団体保険','企業・団体を契約者とし、所属員等を被保険者とする仕組み','退職等で団体から外れた後の扱いを確認'],
    ['財形貯蓄積立保険','勤務先の制度を通じ、給与等から積み立てる','一般財形は使途自由だが税制優遇なし'],
    ['財形住宅・財形年金積立保険','住宅取得または老後資金を目的に積み立てる','要件を満たすと両制度合計で元利合計550万円まで利子等非課税']
   ])
   +p('個人年金保険の終身年金は生存中ずっと支払うため、他の条件が同じなら、平均余命が長い女性の保険料が男性より高くなるのが一般的です。確定年金は生死にかかわらず確定期間分を支払うので、「本人が生存中だけ」という説明は誤りです。')
   +visual('policy-change-and-annuity.svg','払済保険・延長保険と確定年金・終身年金の違いを示す図','契約変更は保障額と期間、個人年金は生存条件と保証期間を見ます。')
   +cite('生命保険文化センター：財形住宅貯蓄積立保険',zaikei)
 });
 addSource(l2,'生命保険文化センター：払済・延長保険',lifeContinuation);addSource(l2,'生命保険文化センター：契約者貸付',lifeLoan);addSource(l2,'生命保険文化センター：財形保険',zaikei);addSource(l2,'日本FP協会：公開試験問題',officialQuestions);

 l3.sections.push({
  title:'生前給付・所得補償は「何が起きたら誰へ払うか」を読む',
  html:p('第三分野には、入院日数だけでなく、余命、就業不能、特定疾病などを支払条件にする商品・特約があります。名前が似ていても、死亡した遺族へ払う収入保障保険とは別です。')
   +table('第三分野で混同しやすい保障',['保障','主な支払事由','受取る人・注意'],[
    ['リビング・ニーズ特約','被保険者の余命が6か月以内と判断されたとき','所定範囲の死亡保険金を被保険者が生前に受取。余命6か月は医師の診断等を基に保険会社が判断'],
    ['所得補償保険','病気・けがで働けず、所得が減少したとき','被保険者本人の所得を補う。死亡した遺族の生活費を補う収入保障保険とは別'],
    ['特定疾病保障保険・特約','がん・急性心筋梗塞・脳卒中など、約款所定の状態','病名だけで直ちに支給とは限らず、診断・治療・状態の条件を確認']
   ])
   +note('リビング・ニーズ特約で生前給付を受けると、その分だけ死亡時に残る死亡保険金は減ります。全額を先に受け取って、同額を死亡時にも受け取る制度ではありません。')
 });
 addSource(l3,'日本FP協会：公開試験問題',officialQuestions);addSource(l3,'国税庁：所得補償保険の保険金','https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1760.htm');

 l4.sections.push({
  title:'水災・傷害・事業賠償は、原因と損害を組み合わせる',
  html:p('損害保険は「火災保険だから火事だけ」「車両保険だから衝突だけ」とは限りません。原因と補償対象を組み合わせて読みます。')
   +table('直近の公開問題で問われた区別',['場面','基本的な扱い','確認点'],[
    ['住宅が地震で倒壊・地震火災','通常の火災保険だけでは対象外','地震保険を火災保険へ付帯しているか'],
    ['住宅が洪水・床上浸水','火災保険の水災補償があれば対象となり得る','水災補償の有無、免責、損害基準'],
    ['車が台風・洪水で水没','一般的な車両保険では対象となり得る','補償範囲を限定した契約か確認'],
    ['普通傷害保険','急激・偶然・外来の事故によるけが','一般に年齢・性別ではなく、職業・職種の危険度等で保険料を区分'],
    ['国内旅行傷害保険','国内旅行中の所定のけが等','一般に細菌性食中毒も対象。普通傷害保険との違い']
   ])
   +table('事業の賠償責任保険',['事故','選ぶ保険','対象となる損害'],[
    ['販売した弁当で客が食中毒','生産物賠償責任保険（PL保険）','引き渡した製品等が原因の対人・対物賠償'],
    ['店舗の床が濡れ、客が転倒','施設所有（管理）者賠償責任保険','施設の所有・使用・管理に起因する賠償'],
    ['工事中に資材を落とし、通行人へけが','請負業者賠償責任保険','請負作業の遂行に起因する賠償']
   ])
   +cite('日本損害保険協会：風水雪災の補償',water)+cite('日本損害保険協会：自動車保険',car)
 });
 l4.sections.push({
  title:'損害保険会社の破綻時は、保険種類で補償割合が違う',
  html:p('損害保険会社が破綻した場合、損害保険契約者保護機構が補償します。ただし、すべての契約が一律90％ではありません。試験では保険種類ごとの扱いを読みます。')
   +table('代表的な補償割合',['契約','破綻時の基本的な補償','理由・注意'],[
    ['自賠責保険・地震保険','100％','社会政策性の高い契約として全額補償'],
    ['個人・小規模法人等の自動車保険、火災保険など','破綻後3か月は100％、その後は80％が基本','商品・契約者区分等により扱いが異なる'],
    ['生命保険会社の対象契約','高予定利率契約等を除き、破綻時の責任準備金等の90％まで','死亡保険金や払込保険料の90％を保証する意味ではない']
   ])
   +p('自賠責保険は被害者救済を目的とするため、引受会社が破綻しても保険金・返還金等が全額補償されます。生命保険の責任準備金は、将来の保険金等の支払いに備えて積み立てる金額で、払込保険料総額そのものではありません。')
   +cite('損害保険契約者保護機構：保険種類別の補償',nonlifeProtection)+cite('日本損害保険協会：自賠責保険',jibai)+cite('生命保険契約者保護機構：補償内容',lifeProtection)+cite('生命保険契約者保護機構：責任準備金',lifeReserve)
 });
 addSource(l4,'日本損害保険協会：風水雪災の補償',water);addSource(l4,'日本損害保険協会：自動車保険',car);addSource(l4,'日本損害保険協会：自賠責保険',jibai);addSource(l4,'損害保険契約者保護機構：保険種類別の補償',nonlifeProtection);addSource(l4,'生命保険契約者保護機構：補償内容',lifeProtection);addSource(l4,'日本FP協会：公開試験問題',officialQuestions);

 l5.sections.push({
  title:'非課税でも、控除・相続・損失計算は別に確認する',
  html:p('「保険金は非課税」とだけ覚えると誤ります。何を原因として誰が受け取り、何の損失を補うお金かで扱いを分けます。')
   +table('保険と税の追加論点',['受取・支払','基本的な扱い','次に確認すること'],[
    ['本人等が受ける入院給付金・手術給付金','身体の傷害・疾病に基因する所定の給付は所得税非課税','医療費控除では、給付の対象となった医療費から補てん額を差し引く'],
    ['被相続人負担の死亡保険金を相続人が受取','相続税。非課税限度額は500万円×法定相続人の数','相続人以外が受け取る部分にこの非課税枠はない'],
    ['地震保険料','所得税の地震保険料控除は年間支払額の全額、最高5万円','旧長期損害保険料との選択・合計上限を確認'],
    ['事業用固定資産の損害を補う火災保険金','所得税は原則非課税','事業所得の損失額を計算するとき、損失から保険金を差し引く'],
    ['休業利益・必要経費を補てんする保険金等','事業の収入や必要経費を補う性質なら事業所得の総収入金額となる場合','資産損害そのものの補てんと区別']
   ])
   +example('死亡保険金の非課税枠',formula('法定相続人が3人<br>500万円×3人＝1,500万円')+p('被相続人が保険料を負担し、相続人が受け取る死亡保険金の合計が3,000万円なら、非課税限度額1,500万円を超える1,500万円が相続税の課税価格計算へ入ります。税額そのものが1,500万円という意味ではありません。'))
   +visual('insurance-tax-map-2026.svg','入院給付金・死亡保険金・地震保険料・事業用資産保険金の税務を示す図','「払う時」「受け取る時」「損失を計算する時」を分けて判断します。')
   +cite('国税庁：死亡保険金の非課税限度額',deathExemption)+cite('国税庁：地震保険料控除',quakeDeduction)+cite('国税庁：身体の傷害に基因する給付金',benefitTax)+cite('国税庁：事業用固定資産の保険金',businessDamage)
 });
 l5.sections.push({
  title:'個人年金は「年金受給権を取得した時」と毎年の受取を分ける',
  html:p('保証期間付終身年金では、被保険者が保証期間内に亡くなっても、残りの保証期間分を遺族が受け取ります。税金は、残りの年金を受け取る権利を取得した時点と、その後毎年受け取る時点を分けます。')
   +example('父の保証期間付終身年金を子が引き継ぐ',p('保険料負担者・被保険者・年金受取人が父で、保証期間内に父が死亡し、子が残りの年金を受け取る権利を取得した場合、その年金受給権は相続税の対象です。その後に受け取る年金には、相続税との二重課税を調整するため、非課税部分と課税部分を分ける仕組みがあります。FP3級ではまず「父から権利を引き継ぐ時点は相続税」と判定できるようにします。'))
   +cite('国税庁：相続税の対象となる年金受給権',annuityTax)
 });
 addSource(l5,'国税庁：死亡保険金の非課税限度額',deathExemption);addSource(l5,'国税庁：地震保険料控除',quakeDeduction);addSource(l5,'国税庁：身体の傷害に基因する給付金',benefitTax);addSource(l5,'国税庁：事業用固定資産の保険金',businessDamage);addSource(l5,'国税庁：年金受給権',annuityTax);addSource(l5,'日本FP協会：公開試験問題',officialQuestions);
 l5.questions[0]={
  title:'本試験レベル：死亡保険金の非課税限度額',
  data:p('夫が保険料を全額負担し、夫の死亡により、相続人である妻と子2人が死亡保険金を合計3,000万円受け取りました。法定相続人はこの3人で、全員が相続人として受け取ります。ほかの調整はありません。'),
  ask:'死亡保険金の非課税限度額と、相続税の課税価格計算へ入る金額を求めてください。',
  answer:p('非課税限度額は500万円×法定相続人3人＝1,500万円。3,000万円−1,500万円＝1,500万円が課税価格計算へ入ります。これは相続税額そのものではありません。')
 };

 l6.sections.push({
  title:'公開問題型の証券読解は、足し算の前に対象条件を消し込む',
  html:p('実技試験では、証券に多くの保険金・給付金が並びます。最初から全部を足すのではなく、事故原因・入院開始日・対象日数・手術倍率・特約の有効期間を確認し、支払事由を満たす項目だけを残します。')
   +flow('証券読解の4段階',[
    ['1｜事故・病気','死亡原因、診断、入院、手術を時系列にする'],
    ['2｜契約条件','保障期間、待ち期間、免責、1入院限度を確認'],
    ['3｜対象を選ぶ','主契約・特約から、条件を満たす給付だけを残す'],
    ['4｜金額を計算','日額×対象日数、手術倍率、死亡給付等を計算して合計']
   ])
   +note('交通事故で死亡しても「災害割増」が必ず付くとは限らず、特約が有効か、約款上の不慮の事故かを確認します。がん診断後に別原因で死亡する問題では、診断給付・入院・手術・死亡給付をそれぞれの条件で判定します。契約の条件から対象となる給付を選ぶことが先です。')
 });
 addSource(l6,'日本FP協会：公開試験問題',officialQuestions);

 for(const lecture of [l1,l2,l3,l4,l5,l6])addSource(lecture,'日本FP協会：3級試験範囲',officialScope);
}

export function assertChapter2Audit(lectures){
 for(const [id,term] of chapter2RequiredTerms){
  const lecture=byId(lectures,id);
  const corpus=JSON.stringify(lecture);
  if(!corpus.includes(term))throw new Error(`Chapter 2 audit coverage missing: ${id} ${term}`);
 }
}
