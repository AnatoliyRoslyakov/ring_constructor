const assert=(v,m)=>{if(!v)throw Error(m);};
const exact=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).every(k=>keys.includes(k));
const number=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
export function normalizeOrnament(v,shank,basis){
 assert(shank&&exact(v,['repeat','offset','motifs'])&&Number.isInteger(v.repeat)&&v.repeat>=1&&v.repeat<=20&&number(v.offset??0,0,359.99),'ornament');
 assert(Array.isArray(v.motifs)&&v.motifs.length>=1&&v.motifs.length<=16&&v.repeat*v.motifs.length<=128,'motifs');
 const nodes=new Set(shank.bands.map(b=>b.id)),edges=shank.bands.filter(b=>!b.closed).map(b=>[b.id,b.join]);let count=0;
 const motifs=v.motifs.map(m=>{
  assert(exact(m,['id','kind','anchor','endAnchor','depth','ridge','lobes','path'])&&typeof m.id==='string'&&/^[A-Za-z0-9-]{1,24}$/.test(m.id)&&!nodes.has(m.id)&&['curve','leaf'].includes(m.kind),'motif');
  assert(nodes.has(m.anchor)&&(m.endAnchor==null||nodes.has(m.endAnchor))&&number(m.depth,.15,1.8)&&number(m.ridge??.6,0,1)&&Number.isInteger(m.lobes??0)&&(m.lobes??0)>=0&&(m.lobes??0)<=4,'anchor');
  assert(Array.isArray(m.path)&&m.path.length>=3&&m.path.length<=24&&m.path.every(p=>Array.isArray(p)&&p.length===4&&p.every((n,i)=>number(n,...[[-.75,1.75],[-1.4,1.4],[0,2.8],[.03,3.5]][i]))),'motif points');
  for(let i=1;i<m.path.length;i++)assert(Math.hypot(...m.path[i].slice(0,3).map((n,j)=>n-m.path[i-1][j]))>=.012,'motif duplicates');
  for(const[id,p]of [[m.anchor,m.path[0]],...(m.endAnchor?[[m.endAnchor,m.path.at(-1)]]:[])]){const rail=shank.bands.find(b=>b.id===id);if(rail){const target=rail.stations.reduce((a,p)=>a+p[2],0)/rail.stations.length/(basis.width*.5);assert(Math.abs(p[1]-target)<=.35,'rail attachment');}}
  assert(m.kind!=='leaf'||m.path.at(-1)[3]<=.18,'leaf tip');count+=m.path.length;edges.push([m.id,m.anchor]);if(m.endAnchor!=null)edges.push([m.id,m.endAnchor]);nodes.add(m.id);return {...m,ridge:m.ridge??.6,lobes:m.lobes??0};
 });
 assert(count*v.repeat<=2200,'ornament budget');const visited=new Set([shank.bands.find(b=>b.closed).id]);for(let i=0;i<nodes.size;i++)for(const[a,b]of edges)if(visited.has(a)||visited.has(b)){visited.add(a);visited.add(b);}assert([...nodes].every(id=>visited.has(id)),'disconnected ornament');
 return {repeat:v.repeat,offset:v.offset??0,motifs};
}
