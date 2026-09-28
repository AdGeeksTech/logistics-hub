import { cpSync, mkdirSync, readFileSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';

// Export a Next.js client preview without altering the server-ready application.
// Email delivery stays disabled, exactly as in the current local preview.
const root=process.cwd();
const stage=resolve(root,'.sites-runtime/client-preview');
rmSync(stage,{recursive:true,force:true});mkdirSync(stage,{recursive:true});
for(const file of ['app','components','public','tsconfig.json','package.json','package-lock.json'])cpSync(resolve(root,file),join(stage,file),{recursive:true});
rmSync(join(stage,'app/api'),{recursive:true,force:true});
symlinkSync(resolve(root,'node_modules'),join(stage,'node_modules'),'dir');
writeFileSync(join(stage,'next.config.ts'),`import type {NextConfig} from 'next';\nconst config:NextConfig={output:'export',trailingSlash:true,images:{unoptimized:true},turbopack:{root:${JSON.stringify(root)}}};\nexport default config;\n`);
let home=readFileSync(join(stage,'app/page.tsx'),'utf8');
const start=home.indexOf('export default async function Home(');
const end=home.indexOf('  return (',start);
if(start<0||end<0)throw new Error('Homepage structure changed: review static export adapter.');
home=home.slice(0,start)+`export default function Home(){\n const initialRegion='Not sure yet';\n`+home.slice(end);
writeFileSync(join(stage,'app/page.tsx'),home);
const queryHelpers=`\nconst subscribeRegion=()=>()=>{};\nconst regionSnapshot=()=>new URLSearchParams(window.location.search).get('region')||'Not sure yet';\nconst serverRegion=()=>'Not sure yet';\n`;
for(const [file,name] of [['regions.tsx','Regions'],['inquiry.tsx','Inquiry']]){
 let source=readFileSync(join(stage,'components',file),'utf8');
 source=source.replace('import { use', 'import { useSyncExternalStore, use');
 source=source.replace(`export function ${name}(`,`function ${name}Content(`);
 source+=queryHelpers+`\nexport function ${name}(props:React.ComponentProps<typeof ${name}Content>){\n const query=useSyncExternalStore(subscribeRegion,regionSnapshot,serverRegion);\n const selected=['USA','Europe','China'].includes(query)?query:(props.initialRegion||'Not sure yet');\n return <${name}Content {...props} key={selected} initialRegion={selected} ${name==='Inquiry'?'connected={false}':''}/>;\n}\n`;
 writeFileSync(join(stage,'components',file),source);
}
const env={...process.env};delete env.RESEND_API_KEY;delete env.INQUIRY_TO_EMAIL;delete env.INQUIRY_FROM_EMAIL;
const build=spawnSync(process.execPath,[resolve(root,'node_modules/next/dist/bin/next'),'build'],{cwd:stage,env,stdio:'inherit'});
if(build.status!==0)process.exit(build.status||1);
const output=resolve(root,'out');rmSync(output,{recursive:true,force:true});cpSync(join(stage,'out'),output,{recursive:true});
console.log('Client preview exported to out');
