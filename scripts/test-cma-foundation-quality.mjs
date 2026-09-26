import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

for(const id of ['00','01','02','03','04']){
 const path=`cma/00/${id}/index.html`,html=fs.readFileSync(path,'utf8');
 const image=`/assets/images/cma/00/goals/cma-00-${id}-goal.svg`;
 assert.ok(html.includes(image),`${path}: opening goal image`);
 assert.ok(fs.existsSync('.'+image),`${path}: goal asset`);
 assert.ok(html.indexOf('foundation-goal')<html.indexOf('id="video"'),`${path}: goal before video`);
 assert.ok((html.match(/<div class="quiz">/g)||[]).length>=3,`${path}: three questions`);
}
const intro=fs.readFileSync('cma/00/00/index.html','utf8');
assert.ok(intro.includes('こんな人におすすめ'));
assert.ok(intro.includes('212講義'));
execFileSync(process.execPath,['scripts/enhance-cma-foundation.mjs']);
console.log('CMA第0章: 導入＋4講義の到達図・対象者・問題・再生成を確認。');
