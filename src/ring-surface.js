import * as THREE from 'three';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';

// Offline filleting: fuse the existing swept profiles into one polished surface.
// Sample the actual profiles so stone seats and the open pavilion keep their positions.
export function createSmoothRingSurface(parts,material){
 const resolution=192,extent=2.1,step=extent*2/resolution,length=resolution**3;
 const field=new Float32Array(length).fill(.3),partField=new Float32Array(length);
 const point=new THREE.Vector3(),blend=.065;
 for(const {mesh,kind} of parts){
  mesh.updateMatrix();const g=mesh.geometry,p=g.attributes.position,params=g.parameters||{};
  const N=kind==='band'?g.userData.bandSegments.N:params.tubularSegments;
  const M=kind==='band'?g.userData.bandSegments.M:params.radialSegments;
  const sample=(i,j)=>{const k=kind==='gallery'?j*(N+1)+i:i*(M+1)+j;return new THREE.Vector3().fromBufferAttribute(p,k).applyMatrix4(mesh.matrix);};
  const rings=[];
  for(let i=0;i<=N;i++){
   const c=new THREE.Vector3();for(let j=0;j<M;j++)c.add(sample(i,j));c.divideScalar(M);
   const n=sample(i,0).sub(c),b=sample(i,Math.round(M/4)).sub(c),r=n.length(),w=b.length();
   rings.push({c,n:n.normalize(),b:b.normalize(),r,w});
  }
  partField.fill(.3);
  for(let i=0;i<N;i++){
   const a=rings[i],b=rings[i+1],v=b.c.clone().sub(a.c),l2=v.lengthSq();if(l2<1e-12)continue;
   const axis=a.n.clone().cross(a.b),along=v.dot(axis);
   if(Math.abs(along)<1e-10)continue;
   const margin=Math.max(a.r,a.w,b.r,b.w)+blend;
   const lo=[a.c.x,a.c.y,a.c.z].map((q,k)=>Math.max(1,Math.floor((Math.min(q,b.c.getComponent(k))-margin+extent)/step)));
   const hi=[a.c.x,a.c.y,a.c.z].map((q,k)=>Math.min(resolution-2,Math.ceil((Math.max(q,b.c.getComponent(k))+margin+extent)/step)));
   const power=kind==='band'?2.5:kind==='shoulder'?2.35:2;
   for(let z=lo[2];z<=hi[2];z++)for(let y=lo[1];y<=hi[1];y++)for(let x=lo[0];x<=hi[0];x++){
    point.set(x*step-extent-a.c.x,y*step-extent-a.c.y,z*step-extent-a.c.z);
    const raw=point.dot(axis)/along,t=Math.max(0,Math.min(1,raw));point.addScaledVector(v,-t);
    const r=THREE.MathUtils.lerp(a.r,b.r,t),w=THREE.MathUtils.lerp(a.w,b.w,t),radius=Math.min(r,w);
    const across=Math.abs(point.dot(a.n))/r,wide=Math.abs(point.dot(a.b))/w;
    const end=(raw<0?-raw:raw>1?raw-1:0)*Math.sqrt(l2)/radius;
    const d=(Math.pow(across**power+wide**power+end**power,1/power)-1)*radius;
    const index=x+resolution*(y+resolution*z);if(d<partField[index])partField[index]=d;
   }
  }
  for(let i=0;i<length;i++){
   const a=field[i],b=partField[i],h=Math.max(blend-Math.abs(a-b),0)/blend;
   field[i]=Math.min(a,b)-h*h*blend*.25;
  }
 }
 // A small field filter removes voxel-scale ripples without flattening the fillets.
 for(let pass=0;pass<2;pass++){
  partField.set(field);
  for(let z=1;z<resolution-1;z++)for(let y=1;y<resolution-1;y++)for(let x=1;x<resolution-1;x++){
   const i=x+resolution*(y+resolution*z);if(Math.abs(partField[i])>.08)continue;
   field[i]=(partField[i]*6+partField[i-1]+partField[i+1]+partField[i-resolution]+partField[i+resolution]+partField[i-resolution*resolution]+partField[i+resolution*resolution])/12;
  }
 }
 const surface=new MarchingCubes(resolution,material,false,false,250000);surface.isolation=0;
 for(let i=0;i<length;i++)surface.field[i]=-field[i];
 surface.update();
 const count=surface.geometry.drawRange.count,geometry=new THREE.BufferGeometry();
 for(const key of ['position','normal'])geometry.setAttribute(key,new THREE.Float32BufferAttribute(surface.geometry.attributes[key].array.slice(0,count*3),3));
 geometry.scale(extent,extent,extent);geometry.computeBoundingSphere();surface.geometry.dispose();
 const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;return mesh;
}
