import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshBVH } from 'three-mesh-bvh';
import { gzipSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createReferenceSetting } from './reference-ring.js';
import { createSmoothRingSurface } from './ring-surface.js';

const V=(x,y,z)=>new THREE.Vector3(x,y,z),material=new THREE.MeshBasicMaterial();
const {band,girdle,shoulders,claws}=createReferenceSetting(material);
const parts=[{mesh:band,kind:'band'},{mesh:girdle,kind:'gallery'},...shoulders.map(mesh=>({mesh,kind:'shoulder'})),...claws.map(mesh=>({mesh,kind:'claw'}))];
const smooth=createSmoothRingSurface(parts,material),geometry=mergeVertices(smooth.geometry,1e-5);
const scale=.38/1.12,ringPoint=p=>V((p.x-.04)/scale,(p.y+.12)/scale-.2,(p.z-.50)/scale);
const sources=[],targets=[];
for(const {mesh,kind} of parts){
 mesh.updateMatrix();const source=mesh.geometry.clone().applyMatrix4(mesh.matrix);let target;
 if(kind==='band'){
  target=source.clone();const {N,M,start}=source.userData.bandSegments,p=target.attributes.position;
  for(let i=0;i<=N;i++)for(let j=0;j<=M;j++){
   const a=start+i/N*Math.PI*2,b=j/M*Math.PI*2,r=1.12+Math.cos(b)*.043/scale;
   p.setXYZ(i*(M+1)+j,Math.cos(a)*r,Math.sin(a)*r-.2,Math.sin(b)*.043/scale);
  }
 }else if(kind==='gallery'){
  const c=ringPoint(V(.04,.32,.50)),{radialSegments,tubularSegments}=source.parameters;
  target=new THREE.TorusGeometry(.115/scale,.013/scale,radialSegments,tubularSegments).rotateX(Math.PI/2).translate(c.x,c.y,c.z);
 }else{
  let points,radius;
  if(kind==='shoulder'){
   const side=shoulders.indexOf(mesh)===0?-1:1;radius=.018;
   points=[V(.04+side*.255,.16,.50),V(.04+side*.21,.25,.50),V(.04+side*.125,.32,.50)];
  }else{
   const a=Math.PI/4+claws.indexOf(mesh)/4*Math.PI*2,c=Math.cos(a),s=Math.sin(a);radius=.014;
   points=[V(.04+c*.062,.225,.50+s*.062),V(.04+c*.115,.32,.50+s*.115),V(.04+c*.156,.435,.50+s*.156),V(.04+c*.143,.475,.50+s*.143)];
  }
  const {tubularSegments,radialSegments}=source.parameters;
  target=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(ringPoint)),tubularSegments,radius/scale,radialSegments,false);
 }
 for(const g of [source,target]){for(const name of Object.keys(g.attributes))if(name!=='position')g.deleteAttribute(name);}
 sources.push(source);targets.push(target);
}
const source=mergeGeometries(sources),target=mergeGeometries(targets),tree=new MeshBVH(source,{indirect:true});
const p=geometry.attributes.position,morph=new Float32Array(p.count*3),index=source.index;
const point=new THREE.Vector3(),hit={},tri=new THREE.Triangle(),weights=new THREE.Vector3(),out=new THREE.Vector3(),vertex=new THREE.Vector3();
for(let i=0;i<p.count;i++){
 point.fromBufferAttribute(p,i);tree.closestPointToPoint(point,hit);
 const ids=[0,1,2].map(n=>index.getX(hit.faceIndex*3+n));
 tri.a.fromBufferAttribute(source.attributes.position,ids[0]);tri.b.fromBufferAttribute(source.attributes.position,ids[1]);tri.c.fromBufferAttribute(source.attributes.position,ids[2]);
 tri.getBarycoord(hit.point,weights);out.set(0,0,0);
 for(let j=0;j<3;j++)out.addScaledVector(vertex.fromBufferAttribute(target.attributes.position,ids[j]),weights.getComponent(j));
 out.toArray(morph,i*3);
}
// Relax the transferred target across the fused junctions: nearest-part mapping
// otherwise leaves sharp seams where a shoulder and a crescent share vertices.
const adjacency=Array.from({length:p.count},()=>new Set()),ix=geometry.index.array;
for(let i=0;i<ix.length;i+=3)for(let j=0;j<3;j++){
 const a=ix[i+j],b=ix[i+(j+1)%3];adjacency[a].add(b);adjacency[b].add(a);
}
let relaxed=morph.slice(),next=new Float32Array(morph.length);
for(let pass=0;pass<28;pass++){
 for(let i=0;i<p.count;i++){
  const neighbors=adjacency[i];for(let axis=0;axis<3;axis++){
   let sum=0;for(const j of neighbors)sum+=relaxed[j*3+axis];
   next[i*3+axis]=neighbors.size?relaxed[i*3+axis]*.5+sum/neighbors.size*.5:relaxed[i*3+axis];
  }
 }
 [relaxed,next]=[next,relaxed];
}
morph.set(relaxed);
const targetSurface=geometry.clone();targetSurface.setAttribute('position',new THREE.Float32BufferAttribute(morph,3));targetSurface.computeVertexNormals();
const header=new Uint32Array([0x52494e47,p.count,geometry.index.count]);
const arrays=[header,p.array,geometry.attributes.normal.array,morph,targetSurface.attributes.normal.array,new Uint32Array(geometry.index.array)];
const bytes=Buffer.concat(arrays.map(a=>Buffer.from(a.buffer,a.byteOffset,a.byteLength)));
const path=new URL('../assets/models/cushion-setting.bin.gz',import.meta.url);mkdirSync(new URL('.',path),{recursive:true});writeFileSync(path,gzipSync(bytes,{level:9}));
console.log(JSON.stringify({vertices:p.count,triangles:geometry.index.count/3,compressedBytes:gzipSync(bytes).length}));
