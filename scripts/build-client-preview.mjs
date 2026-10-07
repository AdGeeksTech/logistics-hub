import {
  cpSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";

// Export a Next.js client preview without altering the server-ready application.
// Email delivery stays disabled, exactly as in the current local preview.
const root = process.cwd();
const stage = resolve(root, ".sites-runtime/client-preview");
rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
for (const file of [
  "app",
  "components",
  "lib",
  "public",
  "tsconfig.json",
  "package.json",
  "package-lock.json",
])
  cpSync(resolve(root, file), join(stage, file), { recursive: true });
// A static host cannot run the admin, uploads or per-car pages, so the
// preview leaves them out and shows the catalogue's empty state.
for (const dir of [
  "app/api",
  "app/admin",
  "components/admin",
  "app/(english)/cars/[slug]",
  "app/[lang]/cars/[slug]",
])
  rmSync(join(stage, dir), { recursive: true, force: true });
symlinkSync(resolve(root, "node_modules"), join(stage, "node_modules"), "dir");
writeFileSync(
  join(stage, "next.config.ts"),
  `import type {NextConfig} from 'next';\nconst config:NextConfig={output:'export',trailingSlash:true,images:{unoptimized:true},turbopack:{root:${JSON.stringify(root)}}};\nexport default config;\n`,
);
writeFileSync(
  join(stage, "app/(english)/page.tsx"),
  `import Home from '@/components/home-page';
import {alternatePaths} from '@/lib/i18n';
export const metadata={alternates:{canonical:'/',languages:alternatePaths()}};
export default function Page(){return <Home/>}`,
);
writeFileSync(
  join(stage, "app/[lang]/page.tsx"),
  `import Home from '@/components/home-page';
import {notFound} from 'next/navigation';
import {isLocale,alternatePaths,localizedPath} from '@/lib/i18n';
export async function generateMetadata({params}:{params:Promise<{lang:string}>}){const {lang}=await params;if(!isLocale(lang))notFound();return {alternates:{canonical:localizedPath(lang),languages:alternatePaths()}}}
export default async function Page({params}:{params:Promise<{lang:string}>}){const {lang}=await params;if(!isLocale(lang))notFound();return <Home locale={lang}/>}`,
);
writeFileSync(
  join(stage, "app/(english)/cars/page.tsx"),
  `import CarsPage from '@/components/cars-page';
import {carsMetadata} from '@/lib/car-routes';
export function generateMetadata(){return carsMetadata('en')}
export default function Page(){return <CarsPage searchParams={{}}/>}`,
);
writeFileSync(
  join(stage, "app/[lang]/cars/page.tsx"),
  `import CarsPage from '@/components/cars-page';
import {notFound} from 'next/navigation';
import {carsMetadata} from '@/lib/car-routes';
import {isLocale} from '@/lib/i18n';
export async function generateMetadata({params}:{params:Promise<{lang:string}>}){const {lang}=await params;if(!isLocale(lang))notFound();return carsMetadata(lang)}
export default async function Page({params}:{params:Promise<{lang:string}>}){const {lang}=await params;if(!isLocale(lang))notFound();return <CarsPage locale={lang} searchParams={{}}/>}`,
);
const queryHelpers = `\nconst subscribeRegion=()=>()=>{};\nconst regionSnapshot=()=>new URLSearchParams(window.location.search).get('region')||'Not sure yet';\nconst serverRegion=()=>'Not sure yet';\n`;
for (const [file, name] of [
  ["regions.tsx", "Regions"],
  ["inquiry.tsx", "Inquiry"],
]) {
  let source = readFileSync(join(stage, "components", file), "utf8");
  source = source.replace(
    '"use client";',
    '"use client";\nimport { useSyncExternalStore } from "react";',
  );
  source = source.replace(
    `export function ${name}(`,
    `function ${name}Content(`,
  );
  source +=
    queryHelpers +
    `\nexport function ${name}(props:React.ComponentProps<typeof ${name}Content>){\n const query=useSyncExternalStore(subscribeRegion,regionSnapshot,serverRegion);\n const selected=['USA','Europe','China'].includes(query)?query:(props.initialRegion||'Not sure yet');\n return <${name}Content {...props} key={selected} initialRegion={selected} ${name === "Inquiry" ? "connected={false}" : ""}/>;\n}\n`;
  writeFileSync(join(stage, "components", file), source);
}
const env = { ...process.env };
delete env.RESEND_API_KEY;
delete env.INQUIRY_TO_EMAIL;
delete env.INQUIRY_FROM_EMAIL;
const build = spawnSync(
  process.execPath,
  [resolve(root, "node_modules/next/dist/bin/next"), "build"],
  { cwd: stage, env, stdio: "inherit" },
);
if (build.status !== 0) process.exit(build.status || 1);
const output = resolve(root, "out");
rmSync(output, { recursive: true, force: true });
cpSync(join(stage, "out"), output, { recursive: true });
console.log("Client preview exported to out");
