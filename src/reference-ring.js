import * as THREE from 'three';

// Rounded rectangular cushion, long axis across the shank; all dimensions are local.
export function cushionPoint(a,scale=1,y=0){
 const c=Math.cos(a),s=Math.sin(a);
 return new THREE.Vector3(.96*Math.sign(c)*Math.pow(Math.abs(c),.62)*scale,y,.73*Math.sign(s)*Math.pow(Math.abs(s),.62)*scale);
}
export function cushionGeometry(){
 const vertices=[],N=32;
 const face=(...points)=>{
  const normal=points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0]));
  const center=points.reduce((sum,p)=>sum.add(p),new THREE.Vector3()).divideScalar(points.length);center.y+=.12;
  if(normal.dot(center)<0)points.reverse();
  for(let i=1;i<points.length-1;i++)vertices.push(...points[0].toArray(),...points[i].toArray(),...points[i+1].toArray());
 };
 const table=Array.from({length:8},(_,i)=>cushionPoint(i*Math.PI/4,.67,.255));
 const crown=Array.from({length:16},(_,i)=>cushionPoint(i*Math.PI/8,.86,i%2?.145:.13));
 const upper=Array.from({length:N},(_,i)=>cushionPoint(i*Math.PI/16,1,.018));
 const lower=upper.map(p=>new THREE.Vector3(p.x,-.018,p.z));
 const pavilion=Array.from({length:16},(_,i)=>cushionPoint(i*Math.PI/8,.51,i%2?-.32:-.35));
 face(...table);
 for(let i=0;i<8;i++){
  const j=(i+1)%8,a=i*2,b=(a+1)%16,c=(a+2)%16;
  face(table[i],table[j],crown[b]);face(table[i],crown[b],crown[a]);face(table[j],crown[c],crown[b]);
 }
 for(let i=0;i<16;i++){
  const j=(i+1)%16,a=i*2,b=(a+1)%N,c=(a+2)%N;
  face(crown[i],crown[j],upper[b]);face(crown[i],upper[b],upper[a]);face(crown[j],upper[c],upper[b]);
  face(lower[a],lower[b],pavilion[i]);face(lower[b],lower[c],pavilion[j]);face(lower[b],pavilion[j],pavilion[i]);
  face(pavilion[i],pavilion[j],new THREE.Vector3(0,-.57,0));
 }
 for(let i=0;i<N;i++)face(upper[i],lower[i],lower[(i+1)%N],upper[(i+1)%N]);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.computeVertexNormals();return g;
}

const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const mix=THREE.MathUtils.lerp;
const ease=(a,b,x)=>{const t=THREE.MathUtils.clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
export function bandSection(a){
 const shoulder=Math.pow(Math.max(0,Math.sin(a)),6);
 return {thickness:.092+shoulder*.032,width:.155+.038*Math.sin(a)**2+.025*shoulder};
}
function bandGeometry(){
 const positions=[],indices=[],N=256,M=32,start=Math.PI/2+.50,span=Math.PI*2-1;
 for(let i=0;i<=N;i++){const a=start+i/N*span,{thickness,width}=bandSection(a);for(let j=0;j<=M;j++){const b=j/M*Math.PI*2,c=Math.cos(b),s=Math.sin(b);const radial=Math.sign(c)*Math.pow(Math.abs(c),.72)*thickness;const r=1.12+radial;positions.push(Math.cos(a)*r,Math.sin(a)*r-.2,Math.sign(s)*Math.pow(Math.abs(s),.78)*width);}}
 for(let i=0;i<N;i++)for(let j=0;j<M;j++){const a=i*(M+1)+j,b=a+M+1;indices.push(a,b,a+1,b,b+1,a+1)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();
 // Match duplicate seam normals to keep the polished surface continuous.
 const normals=g.attributes.normal;
 const join=(a,b)=>{const n=V(normals.getX(a)+normals.getX(b),normals.getY(a)+normals.getY(b),normals.getZ(a)+normals.getZ(b)).normalize();normals.setXYZ(a,n.x,n.y,n.z);normals.setXYZ(b,n.x,n.y,n.z);};
 for(let i=0;i<=N;i++)join(i*(M+1),i*(M+1)+M);
 // The two upper ends stay open and meet the rising shoulders.
 g.userData.bandSegments={N,M,start};return g;
}
function tube(points,radius,material,taper=1){
 const curve=new THREE.CatmullRomCurve3(points),N=64,M=16,geometry=new THREE.TubeGeometry(curve,N,radius,M,false);
 if(taper!==1){const p=geometry.attributes.position;for(let i=0;i<=N;i++){const center=curve.getPointAt(i/N),scale=mix(1,taper,ease(.58,1,i/N));for(let j=0;j<=M;j++){const n=i*(M+1)+j;p.setXYZ(n,center.x+(p.getX(n)-center.x)*scale,center.y+(p.getY(n)-center.y)*scale,center.z+(p.getZ(n)-center.z)*scale);}}geometry.computeVertexNormals();}
 return new THREE.Mesh(geometry,material);
}

export function createReferenceSetting(metal){
 const ring=new THREE.Group(),band=new THREE.Mesh(bandGeometry(),metal);ring.add(band);band.castShadow=true;
 const basket=new THREE.Group(),claws=[],tips=[],shoulders=[];ring.add(basket);
 // Four scalloped crescents share their rising ends with the claws.
 // Keep the torus vertex grid so the casting handoff remains a true morph.
 const galleryAt=a=>{
  const rise=Math.sin(2*a)**2,p=cushionPoint(a,.90+.105*rise,1.30+.35*rise);
  const tangent=cushionPoint(a+.0001).sub(cushionPoint(a-.0001)).normalize();
  return {p,n:V(tangent.z,0,-tangent.x).normalize(),height:mix(.125,.066,rise),rise};
 };
 const collarGeometry=new THREE.TorusGeometry(1,.072,16,96),collarPos=collarGeometry.attributes.position;
 for(let i=0;i<collarPos.count;i++){
  const x=collarPos.getX(i),y=collarPos.getY(i),z=collarPos.getZ(i),a=Math.atan2(y,x),b=Math.atan2(z,Math.hypot(x,y)-1),{p,n,height}=galleryAt(a);
  collarPos.setXYZ(i,p.x+n.x*Math.cos(b)*.064,p.z+n.z*Math.cos(b)*.064,-(p.y-1.5+Math.sin(b)*height));
 }
 collarGeometry.computeVertexNormals();
 const girdle=new THREE.Mesh(collarGeometry,metal);girdle.rotation.x=Math.PI/2;girdle.position.y=1.50;basket.add(girdle);
 for(let i=0;i<4;i++){
  const a=Math.PI/4+i*Math.PI/2,p=cushionPoint(a),end=cushionPoint(a,.945,1.765);
  const points=[V(p.x*1.005,1.59,p.z*1.005),V(p.x*1.025,1.68,p.z*1.025),V(p.x*1.01,1.75,p.z*1.01),end];
  const claw=tube(points,.067,metal,.68);claw.castShadow=true;basket.add(claw);claws.push(claw);
  const cap=new THREE.SphereGeometry(.046,12,12);cap.scale(1,.78,1);
  const tip=new THREE.Mesh(cap,metal);tip.position.copy(end);basket.add(tip);tips.push(tip);
 }
 const shoulderCurve=side=>[V(side*.61,.74,0),V(side*.56,.88,0),V(side*.66,1.13,0),V(side*.864,1.30,0)];
 const shoulderWidth=u=>.202+.12*ease(.15,1,u);
 for(const side of [-1,1]){
  const shoulder=tube(shoulderCurve(side),.115,metal,1),curve=new THREE.CatmullRomCurve3(shoulderCurve(side));
  const geometry=shoulder.geometry,p=geometry.attributes.position,{tubularSegments:N,radialSegments:M}=geometry.parameters;
  // A broad, softly flared shoulder continues the shank into the crescent saddle.
  for(let i=0;i<=N;i++){
   const u=i/N,c=curve.getPointAt(u),width=shoulderWidth(u);
   for(let j=0;j<=M;j++){const k=i*(M+1)+j,z=(p.getZ(k)-c.z)/.115;p.setZ(k,c.z+Math.sign(z)*Math.pow(Math.abs(z),.78)*width);}
  }
  geometry.computeVertexNormals();shoulder.castShadow=true;basket.add(shoulder);shoulders.push(shoulder);
 }

 return {ring,band,basket,girdle,claws,tips,shoulders,galleryAt,shoulderCurve,shoulderWidth};
}
