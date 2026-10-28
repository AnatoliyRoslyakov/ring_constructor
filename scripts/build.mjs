import { build } from 'esbuild';
import { readdir,unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
const result=await build({entryPoints:['src/main.js'],bundle:true,minify:true,format:'esm',splitting:true,outdir:'.',entryNames:'app',chunkNames:'chunks/[name]-[hash]',metafile:true});
const keep=new Set(Object.keys(result.metafile.outputs).map(p=>resolve(p)));
for(const name of await readdir('chunks'))if(name.endsWith('.js')&&!keep.has(resolve('chunks',name)))await unlink(resolve('chunks',name));
console.log('ORIGIN build ready');
