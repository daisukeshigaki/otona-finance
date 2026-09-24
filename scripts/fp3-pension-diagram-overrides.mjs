import fs from 'node:fs';
const prompts=JSON.parse(fs.readFileSync(new URL('./fp3-pension-clarity-images.json',import.meta.url),'utf8'));
const placement={
 'employee-pension-formula':[5,4,'平均標準報酬額、5.481／1,000、加入月数を言葉に直し、計算結果が年金総額ではなく報酬比例部分だと確認します。'],
 'pension-start-age':[5,5,'老齢年金は原則65歳開始です。繰上げ・繰下げは対象年金の年額を変え、その増減率が原則として生涯続きます。'],
 'survivor-pension-current-2026':[6,3,'2026年時点の子のない配偶者について、妻と夫の年齢条件を分け、2028年施行予定の改正と混同しないようにします。'],
 'db-dc-money-flow':[6,4,'DBは給付の算定方法側、DCは拠出側を定めます。企業型DCとiDeCoの掛金・運用・受取も並べて確認します。'],
 'ideco-limits-2026':[6,5,'2026年9月時点のiDeCo上限を働き方ごとに分け、12月施行予定の上限と試験基準日を混ぜないようにします。']
};
export const replacedPensionDiagramIds=new Set(['employee-pension-formula','pension-start-age','survivor-pension-family','db-dc-money-flow']);
export const pensionDiagrams=prompts.map(x=>{
 const [lesson,section,caption]=placement[x.id];
 return {...x,lesson,section,caption};
});
