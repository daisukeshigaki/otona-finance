import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(p=>/^(?:basics|beginner|cma|fp3)\/.*\.html$/.test(p)||/^scripts\/generate-(?:cma|fp3)\.mjs$/.test(p));
const transform=old=>old
 .replace(/練習問題\s*[—―－–-]\s*この場の資料だけで解く/g,'練習問題')
 .replace(/<p\b[^>]*><strong>撮影・復習の目安<\/strong>[\s\S]*?<\/p>/g,'');
const changed=files.filter(path=>process.argv[2]==='--list'||path===process.argv[2]).filter(path=>transform(fs.readFileSync(path,'utf8'))!==fs.readFileSync(path,'utf8'));
if(process.argv[2]==='--list')console.log(JSON.stringify(changed));
else{
 const path=process.argv[2];if(!changed.includes(path))throw Error('No targeted change: '+path);
 const old=fs.readFileSync(path,'utf8').split('\n'),next=transform(old.join('\n')).split('\n');
 if(old.length!==next.length)throw Error('Unexpected multiline change');
 const hunks=old.flatMap((line,i)=>line===next[i]?[]:[`@@\n-${line}\n+${next[i]}`]);
 process.stdout.write('*** Begin Patch\n*** Update File: '+path+'\n'+hunks.join('\n')+'\n*** End Patch\n');
}
