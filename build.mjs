import { readFile, writeFile } from 'node:fs/promises';
const raw=process.env.PUBLIC_SITE_URL||process.env.VERCEL_PROJECT_PRODUCTION_URL||process.env.VERCEL_URL;
if(raw){const origin=new URL(raw.startsWith('https://')?raw:'https://'+raw).origin;const path=new URL('./public/index.html',import.meta.url);let html=await readFile(path,'utf8');html=html.replace(/(<meta property="og:image" content=")[^"]+(\/share-template.webp")/, '$1'+origin+'$2');await writeFile(path,html)}
console.log('Vercel static game and API gateway ready');
