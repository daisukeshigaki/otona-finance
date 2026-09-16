import {p,table,s,q} from './cma-accounting-content.mjs';
export {p,table,s,q};
export const cfa=(slug,name)=>['CFA Institute：'+name,'https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/'+slug];
export const law=['e-Gov：会社法','https://laws.e-gov.go.jp/law/417AC0000000086'];
export const fiea=['e-Gov：金融商品取引法','https://laws.e-gov.go.jp/law/323AC0000000025'];
export const jpx=['日本取引所グループ：内国株の売買制度','https://www.jpx.co.jp/equities/trading/index.html'];
export const gov=['日本取引所グループ：コーポレートガバナンス・コード','https://www.jpx.co.jp/equities/listing/cg/'];
export function section(title,text,rows,after){return s(title,p(text)+table(title+' — 条件と読み方',['項目','条件・数値','読み方'],rows)+p(after));}
export function question(title,conditions,ask,answer){return q(title,p(conditions),ask,answer);}
