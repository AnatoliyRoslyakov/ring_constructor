import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createDiamondEnvironment } from './diamond.js';
import { refractionMaterial } from './diamond-material.js';
import { createSatinReflection } from './satin-reflection.js';
import { normalizeDesign, dimensions } from './ring-design.js';
import { gems,shapeRatios,sceneCatalog } from './constructor/catalog.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const V=(x,y,z)=>new THREE.Vector3(x,y,z),TAU=Math.PI*2;
const signedPow=(v,p)=>Math.sign(v)*Math.pow(Math.abs(v),p);
function outline(shape,n=32){
 const result=[],ratio=shapeRatios[shape];
 for(let i=0;i<n;i++){
  const a=i/n*TAU,c=Math.cos(a),s=Math.sin(a);let x=c*.5,z=s*.5*ratio;
  if(shape==='cushion'){x=signedPow(c,.58)*.5;z=signedPow(s,.58)*.525;}
  if(['princess','emerald','asscher','radiant'].includes(shape)){
   const bevel=shape==='princess'?.06:shape==='asscher'?.23:.16,rx=.5,rz=ratio*.5;
   const radius=Math.min(rx/Math.max(1e-9,Math.abs(c)),rz/Math.max(1e-9,Math.abs(s)),(rx+rz-bevel)/Math.max(1e-9,Math.abs(c)+Math.abs(s)));
   x=c*radius;z=s*radius;
  }
  if(shape==='pear'){const fullness=.76-.24*s;x=c*.5*fullness/.79;z=s*.75;}
  if(shape==='marquise'){x=signedPow(c,2)*.5;z=s*.9;}
  if(shape==='heart'){x=Math.pow(Math.sin(a),3)*.5;z=-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))/32;}
  if(shape==='trillion'||shape==='hexagon'){
   const count=shape==='trillion'?3:6,sector=TAU/count,phase=shape==='trillion'?Math.PI/2:0;
   const radius=.5*Math.cos(Math.PI/count)/Math.cos(((a-phase+sector*8+Math.PI/count)%sector)-Math.PI/count);
   x=c*radius;z=s*radius*ratio;
  }
  result.push(new THREE.Vector2(x,z));
 }
 const minX=Math.min(...result.map(p=>p.x)),maxX=Math.max(...result.map(p=>p.x)),minZ=Math.min(...result.map(p=>p.y)),maxZ=Math.max(...result.map(p=>p.y));
 for(const p of result){p.x=(p.x-(minX+maxX)*.5)/(maxX-minX);p.y=(p.y-(minZ+maxZ)*.5)/(maxZ-minZ)*ratio;}
 return result;
}
function triangleGeometry(positions){
 let volume=0;for(let i=0;i<positions.length;i+=9){const a=V(...positions.slice(i,i+3)),b=V(...positions.slice(i+3,i+6)),c=V(...positions.slice(i+6,i+9));volume+=a.dot(b.cross(c));}
 if(volume<0)for(let i=0;i<positions.length;i+=9)for(let j=0;j<3;j++){const t=positions[i+3+j];positions[i+3+j]=positions[i+6+j];positions[i+6+j]=t;}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.computeVertexNormals();return geo;
}
function gemGeometry(shape){
 const edge=outline(shape,32),levels=['emerald','asscher'].includes(shape)?[{r:0,y:-.44},{r:.40,y:-.30},{r:.72,y:-.14},{r:1,y:-.015},{r:1,y:.015},{r:.72,y:.13},{r:.56,y:.23}]:[{r:0,y:-.44},{r:.64,y:-.22},{r:1,y:-.015},{r:1,y:.015},{r:.57,y:.23}],p=[];
 const point=(l,i)=>{const v=edge[(i+32)%32];return [v.x*l.r,l.y,v.y*l.r];},tri=(a,b,c)=>p.push(...a,...b,...c);
 for(let l=0;l<levels.length-1;l++)for(let i=0;i<32;i++){const a=point(levels[l],i),b=point(levels[l],i+1),c=point(levels[l+1],i),d=point(levels[l+1],i+1);if(l===0)tri(a,c,d);else{tri(a,c,b);tri(b,c,d);}}
 for(let i=0;i<32;i++)tri([0,.23,0],point(levels.at(-1),i+1),point(levels.at(-1),i));
 return triangleGeometry(p);
}
function surfaceAt(points,angle){
 const dx=Math.cos(angle),dz=Math.sin(angle);let distance=Infinity;
 for(let i=0;i<points.length;i++){
  const a=points[i],b=points[(i+1)%points.length],sx=b.x-a.x,sz=b.y-a.y,den=dx*sz-dz*sx;
  if(Math.abs(den)<1e-8)continue;
  const t=(a.x*sz-a.y*sx)/den,u=(a.x*dz-a.y*dx)/den;
  if(t>0&&u>=-1e-6&&u<=1+1e-6)distance=Math.min(distance,t);
 }
 return new THREE.Vector2(dx*distance,dz*distance);
}
function bandGeometry(d,branch=0){
 const N=192,M=24,p=[],indices=[],r=d.ringSize/2+d.thickness/2;
 for(let i=0;i<=N;i++){
  const a=i/N*TAU,shoulder=Math.pow(Math.max(0,Math.sin(a)),8),twist=a*3;
  let width=d.width*(['tapered','cathedral'].includes(d.shank)?1-d.taper*shoulder:1),offset=0,radialOffset=0;
  if(d.shank==='split'){width*=.5;offset=branch*(d.width*.25+shoulder*d.gemSize*.18);}
  if(['twist','rope','organic'].includes(d.shank)){const turns=d.shank==='rope'?a*9:d.shank==='organic'?a*2:twist;width*=.46;offset=branch*d.width*.28*Math.cos(turns);radialOffset=branch*d.thickness*.30*Math.sin(turns);}
  if(d.shank==='double'){width*=.42;offset=branch*d.width*.32;}
  if(d.shank==='bypass'){offset=Math.sin(a)*d.width*.38;radialOffset=Math.cos(a)*shoulder*.45;}
  if(d.shank==='chevron')radialOffset=-shoulder*(.75+Math.abs(Math.cos(a))*.9);
  for(let j=0;j<=M;j++){
   const b=j/M*TAU,c=Math.cos(b),s=Math.sin(b),power=d.profile==='square'?.2:d.profile==='flat'?.36:d.profile==='comfort'?.65:1;
   const radial=signedPow(c,power)*d.thickness/2,axial=(d.profile==='knife'?signedPow(s,.45):signedPow(s,power))*width/2;
   p.push(Math.cos(a)*(r+radial+radialOffset),Math.sin(a)*(r+radial+radialOffset),offset+axial);
  }
 }
 for(let i=0;i<N;i++)for(let j=0;j<M;j++){const a=i*(M+1)+j,b=a+M+1;indices.push(a,b,a+1,b,b+1,a+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
function pipe(points,radius,material,parent,taper=1){
 const curve=new THREE.CatmullRomCurve3(points),g=new THREE.TubeGeometry(curve,36,radius,12,false);
 if(taper!==1){const p=g.attributes.position;for(let i=0;i<=36;i++){const center=curve.getPointAt(i/36),factor=THREE.MathUtils.lerp(1,taper,Math.pow(i/36,4));for(let j=0;j<=12;j++){const n=i*13+j;p.setXYZ(n,center.x+(p.getX(n)-center.x)*factor,center.y+(p.getY(n)-center.y)*factor,center.z+(p.getZ(n)-center.z)*factor);}}g.computeVertexNormals();}
 const m=new THREE.Mesh(g,material);parent.add(m);return m;
}
function contourTube(points,y,r,material,parent,scale=1){return pipe([...points,points[0],points[1]].map(p=>V(p.x*scale,y,p.y*scale)),r,material,parent);}
function bezelGeometry(points,y,wall){
 const p=[],tri=(a,b,c)=>p.push(...a,...b,...c);for(let i=0;i<points.length;i++){
  const a=points[i],b=points[(i+1)%points.length],ext=v=>v.clone().multiplyScalar(1+wall/v.length());
  const ae=ext(a),be=ext(b),lo=y-.65,hi=y+.12;
  const A=[a.x,lo,a.y],B=[b.x,lo,b.y],C=[a.x,hi,a.y],D=[b.x,hi,b.y],E=[ae.x,lo,ae.y],F=[be.x,lo,be.y],G=[ae.x,hi,ae.y],H=[be.x,hi,be.y];
  tri(E,G,F);tri(F,G,H);tri(A,B,C);tri(B,D,C);tri(C,D,G);tri(D,H,G);tri(A,E,B);tri(B,E,F);
 }return triangleGeometry(p);
}
function createSurfaceTexture(kind){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');let seed=41;
 const random=()=>{seed=seed*16807%2147483647;return seed/2147483647;};
 c.fillStyle='#bcb8ad';c.fillRect(0,0,256,256);
 for(let i=0;i<6000;i++){const n=Math.floor(130+random()*90);c.fillStyle=`rgba(${n},${n},${n},${kind==='velvet'?.14:.22})`;c.fillRect(random()*256,random()*256,kind==='velvet'?.7:1.8,kind==='velvet'?3:1);}
 if(kind==='travertine'||kind==='limestone')for(let i=0;i<34;i++){c.strokeStyle='#746c5d16';c.beginPath();const y=random()*256;c.moveTo(0,y);c.bezierCurveTo(80,y-16,160,y+14,256,y+random()*20);c.stroke();}
 const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(3,3);return texture;
}
function createFinishTextures(){
 const textures={};
 for(const name of ['satin','brushed','hammered']){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d');c.fillStyle='#808080';c.fillRect(0,0,128,128);let seed=17;
  const random=()=>{seed=seed*16807%2147483647;return seed/2147483647;};
  for(let i=0;i<(name==='hammered'?180:1600);i++){const n=Math.floor(80+random()*100);c.fillStyle=`rgb(${n},${n},${n})`;if(name==='hammered'){c.beginPath();c.arc(random()*128,random()*128,2+random()*5,0,TAU);c.fill();}else c.fillRect(random()*128,random()*128,name==='brushed'?25:1,1);}
  const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(4,2);textures[name]=texture;
 }
 return textures;
}
export function createRingStudio(canvas,{reduced=false,onAutoChange=()=>{}}={}){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.3:1.6));renderer.setClearColor('#111e30');renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,250);camera.position.set(31,23,41);
 const env=createDiamondEnvironment(renderer),pmrem=new THREE.PMREMGenerator(renderer),lighting=pmrem.fromCubemap(env.texture);scene.environment=lighting.texture;scene.environmentIntensity=1.3;let gemEnvironment=env.texture,hdrCube,hdrLighting,hdrPromise,currentScene='studio';
 scene.add(new THREE.HemisphereLight(0xffffff,0x77849a,1.1));const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-12,30,28);scene.add(key);const rim=new THREE.DirectionalLight(0xc5d8ff,2);rim.position.set(25,12,-20);scene.add(rim);
 const metal=new THREE.MeshPhysicalMaterial({metalness:1,roughness:.1,clearcoat:.8,clearcoatRoughness:.12,envMapIntensity:1.5});
 const surfaceTextures=createFinishTextures();
 const accentMaterial=new THREE.MeshPhysicalMaterial({color:0xe9f2ff,metalness:.12,roughness:.05,transmission:.6,thickness:.7,ior:2.417,envMapIntensity:2});
 const gemCache=new Map(),controls=new OrbitControls(camera,canvas);controls.target.set(0,2,0);controls.enablePan=false;controls.minDistance=27;controls.maxDistance=95;controls.enableDamping=!reduced;controls.dampingFactor=.12;controls.autoRotateSpeed=.6;controls.maxPolarAngle=Math.PI*.94;controls.minPolarAngle=.08;controls.update();
 const sceneProps=new THREE.Group();scene.add(sceneProps);
 let group,design,dirty=true,active=false,auto=false,lastTime=0,currentView='perspective',lastFit=0;controls.maxDistance=150;const reflection=createSatinReflection(scene,{compact:true,exclude:[]});reflection.scale.setScalar(5);reflection.material.uniforms.uStrength.value=.12;
 function fitDistance(){if(!group)return 65;const box=new THREE.Box3().setFromObject(group),size=box.getSize(V(0,0,0));return size.length()*.5/Math.sin(THREE.MathUtils.degToRad(camera.fov/2))/Math.min(camera.aspect,1)*1.05;}
 function disposeGroup(){if(!group)return;const geometries=new Set(),materials=new Set();group.traverse(o=>{if(o.isMesh){if(!o.userData.cached)geometries.add(o.geometry);if(o.isInstancedMesh)o.dispose();if(o.userData.engraving)materials.add(o.material);}});for(const g of geometries)g.dispose();for(const m of materials){m.map?.dispose();m.dispose();}scene.remove(group);}
 function gemFor(shape,kind='diamond'){
  const id=`${shape}:${kind}`;
  if(!gemCache.has(id)){const geometry=gemGeometry(shape),material=refractionMaterial(geometry,gemEnvironment);material.uniforms.bounces.value=innerWidth<700?3:5;material.uniforms.color.value.set(gems[kind].color);material.uniforms.ior.value=gems[kind].ior;gemCache.set(id,{geometry,material});}
  return gemCache.get(id);
 }
 function addGem(parent,shape,kind,size,position,rotation=null,primary=false){
  const cached=gemFor(shape,kind),geometry=cached.geometry,material=primary?cached.material:accentMaterial,stone=new THREE.Mesh(geometry,material);stone.userData.cached=true;stone.userData.gem=kind;stone.scale.setScalar(size);stone.position.copy(position);if(rotation)stone.rotation.copy(rotation);
  if(primary)stone.onBeforeRender=(_r,_s,cam)=>{const target=renderer.getRenderTarget();cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();material.uniforms.viewMatrixInverse.value.copy(cam.matrixWorld);material.uniforms.projectionMatrixInverse.value.copy(cam.projectionMatrixInverse);material.uniforms.resolution.value.set(target?target.width:canvas.width,target?target.height:canvas.height);};parent.add(stone);return stone;
 }
 function setDesign(value){
  const normalized=normalizeDesign(value);
  if(design&&JSON.stringify({...design,scene:''})===JSON.stringify({...normalized,scene:''})){design=normalized;setScene(design.scene);return dimensions(design);}
  design=normalized;const d=design,dim=dimensions(d),outer=d.ringSize/2+d.thickness,girdle=outer+d.gemSize*.44+.45+d.headLift;
  metal.color.set({white:0xe1e4e8,yellow:0xe3b85c,rose:0xd9a293,platinum:0xcbd3dc}[d.metal]);metal.roughness={mirror:.11,satin:.43,brushed:.36,hammered:.25}[d.finish];metal.clearcoat=d.finish==='mirror'?.8:.15;metal.bumpMap=d.finish==='mirror'?null:surfaceTextures[d.finish];metal.bumpScale=d.finish==='hammered'?.075:d.finish==='brushed'?.012:.006;
  disposeGroup();group=new THREE.Group();scene.add(group);
  const branches=['split','twist','rope','double','organic'].includes(d.shank)?[-1,1]:[0];for(const branch of branches)group.add(new THREE.Mesh(bandGeometry(d,branch),metal));
  const points=outline(d.shape).map(p=>{p.multiplyScalar(d.gemSize);return d.orientation==='east'?new THREE.Vector2(-p.y,p.x):p;});
  const stone=addGem(group,d.shape,d.gem,d.gemSize,V(0,girdle,0),null,true);stone.name='Central stone';if(d.orientation==='east')stone.rotation.y=Math.PI/2;
  const baseY=outer+.3;
  contourTube(points,baseY,.22,metal,group,.34);contourTube(points,girdle-.85,.19,metal,group,.83);
  for(const side of [-1,1]){
   const contact=surfaceAt(points,side>0?0:Math.PI);
   pipe([V(side*d.ringSize*.36,d.ringSize*.35,0),V(side*d.ringSize*.23,outer-.1,0),V(contact.x*.34,baseY,contact.y*.34)],Math.max(.25,d.width*.13),metal,group);
  }
  if(d.setting==='bezel'||d.setting==='halfbezel'){
   const geometry=bezelGeometry(points,girdle,.38+dim.prong*.15);
   if(d.setting==='halfbezel'){
    const p=geometry.attributes.position,kept=[];for(let i=0;i<p.count;i+=3){const x=(p.getX(i)+p.getX(i+1)+p.getX(i+2))/3,z=(p.getZ(i)+p.getZ(i+1)+p.getZ(i+2))/3;if(Math.abs(x)>Math.abs(z)*.65)for(let j=0;j<3;j++)kept.push(p.getX(i+j),p.getY(i+j),p.getZ(i+j));}geometry.dispose();group.add(new THREE.Mesh(triangleGeometry(kept),metal));
   }else group.add(new THREE.Mesh(geometry,metal));
  }else if(d.setting==='tension'){
   for(const side of [-1,1])pipe([V(side*d.ringSize*.40,outer-.6,0),V(side*dim.spanX*.63,girdle-.3,0),V(side*dim.spanX*.48,girdle+.1,0)],Math.max(.42,d.width*.23),metal,group);
  }
  else for(let i=0;i<d.prongs;i++){
   const offset=d.setting==='compass'?0:(d.shape==='pear'||d.shape==='marquise')?Math.PI/2:Math.PI/4,angle=i/d.prongs*TAU+offset,edge=surfaceAt(points,angle),crown=d.gemSize*.23;
   const flare=d.setting==='tulip'?1.16:d.setting==='crown'?1.10:1.035;
   const path=[V(edge.x*(d.setting==='tulip'?.18:.34),baseY,edge.y*(d.setting==='tulip'?.18:.34)),V(edge.x*(d.setting==='basket'?.95:.83),girdle-.85,edge.y*(d.setting==='basket'?.95:.83)),V(edge.x*flare,girdle+crown*.12,edge.y*flare),V(edge.x*.88,girdle+crown*.30,edge.y*.88)];
   const radius=dim.prong/2;
   if(d.prongStyle==='double'){const tangent=V(-Math.sin(angle),0,Math.cos(angle));for(const sign of [-1,1])pipe(path.map(p=>p.clone().addScaledVector(tangent,sign*radius*.8)),radius*.62,metal,group,.65);}
   else pipe(path,radius,metal,group,d.prongStyle==='claw'?.32:1);
   if(d.prongStyle==='v'){const tangent=V(-Math.sin(angle)*.25,0,Math.cos(angle)*.25),tip=path.at(-1);for(const sign of [-1,1])pipe([path[2],tip.clone().addScaledVector(tangent,sign)],radius*.7,metal,group,.65);}
   const tip=new THREE.Mesh(new THREE.SphereGeometry(radius*(d.prongStyle==='claw'?.35:.93),12,12),metal);tip.position.copy(path.at(-1));group.add(tip);
  }
  if(d.shank==='pave'){
   const smallGeometry=gemGeometry('round'),beadGeometry=new THREE.SphereGeometry(.13,8,8);
   for(let i=0;i<24;i++){const a=Math.PI*(.5-d.paveCoverage/2)+i/23*Math.PI*d.paveCoverage;if(Math.abs(Math.cos(a)*(outer+.2))<dim.width*.52)continue;
    const small=new THREE.Mesh(smallGeometry,accentMaterial);small.scale.setScalar(Math.min(1.05,d.width*.48));small.position.set(Math.cos(a)*(outer+.20),Math.sin(a)*(outer+.20),0);small.rotation.z=a-Math.PI/2;group.add(small);
    for(const z of [-1,1]){const bead=new THREE.Mesh(beadGeometry,metal);bead.position.set(Math.cos(a)*(outer+.08),Math.sin(a)*(outer+.08),z*d.width*.29);group.add(bead);}
   }
  }
  if(d.shank==='cathedral')for(const sign of [-1,1])pipe([V(sign*outer*.90,outer*.40,0),V(sign*outer*.70,outer*.92,0),V(sign*dim.spanX*.40,girdle-.45,0)],Math.max(.3,d.width*.19),metal,group);
  if(d.setting==='crown')contourTube(points,girdle-.22,.20,metal,group,1.01);
  if(d.halo!=='none'){
   const hidden=d.halo==='hidden',rows=d.halo==='double'?2:1;
   for(let row=0;row<rows;row++){
    const expansion=1+(hidden?-.06:(d.haloSize*.75+row*d.haloSize*1.25)/(d.gemSize*.5));
    const y=hidden?girdle-.65:girdle+.08;
    contourTube(points,y-.25,.19,metal,group,expansion);
    const count=Math.min(52,Math.max(16,Math.round((dim.width+dim.length)*1.55/d.haloSize)));
    for(let i=0;i<count;i++){
     const edge=surfaceAt(points,i/count*TAU).multiplyScalar(expansion);
     addGem(group,'round','diamond',d.haloSize,V(edge.x,y,edge.y));
    }
   }
  }
  if(d.sideStones!=='none'){
   const count=d.sideStones==='pair'?1:d.sideStones==='trio'?2:3;
   for(const sign of [-1,1])for(let i=0;i<count;i++){
    const size=d.gemSize*d.sideSize*(1-i*.18),x=sign*(dim.spanX*.5+size*.56+i*size*.85),y=outer+.45+d.headLift*.25-i*.35;
    addGem(group,d.sideShape,'diamond',size,V(x,y,0),new THREE.Euler(0,0,-sign*.22));
    for(const z of [-1,1])pipe([V(x*.8,outer-.3,0),V(x,y-.3,z*size*.38)],Math.max(.17,size*.08),metal,group);
   }
  }
  if(d.detail==='milgrain'||d.detail==='rails'){
   const beadGeometry=d.detail==='milgrain'?new THREE.SphereGeometry(.13,8,6):null,instances=beadGeometry?new THREE.InstancedMesh(beadGeometry,metal,176):null,pose=new THREE.Object3D();let beadIndex=0;if(instances)group.add(instances);
   for(const z of [-1,1]){
    if(d.detail==='rails'){
     const rail=new THREE.Mesh(new THREE.TorusGeometry(outer-.06,.13,8,160),metal);rail.position.z=z*d.width*.43;group.add(rail);
    }else for(let i=0;i<88;i++){const a=i/88*TAU;pose.position.set(Math.cos(a)*(outer-.04),Math.sin(a)*(outer-.04),z*d.width*.40);pose.updateMatrix();instances.setMatrixAt(beadIndex++,pose.matrix);}
   }
  }
  if(d.detail==='gallery')for(let i=0;i<6;i++){
   const a=i/6*TAU,b=(i+1)/6*TAU,p=surfaceAt(points,a).multiplyScalar(.77),q=surfaceAt(points,b).multiplyScalar(.77);
   pipe([V(p.x,girdle-.75,p.y),V((p.x+q.x)*.42,girdle-1.45,(p.y+q.y)*.42),V(q.x,girdle-.75,q.y)],.15,metal,group);
  }
  for(const accent of d.accents){
   const basis=accent.basis||[d.ringSize,d.gemSize,d.headLift,d.thickness],ringRatio=d.ringSize/basis[0],gemRatio=d.gemSize/basis[1],oldOuter=basis[0]/2+basis[3],oldGirdle=oldOuter+basis[1]*.44+.45+basis[2];
   for(const sign of accent.mirrorX?[-1,1]:[1])pipe(accent.points.map(([x,y,z])=>{const anchor=THREE.MathUtils.clamp((y-oldOuter*.55)/Math.max(1,oldGirdle-oldOuter*.55),0,1);return V(x*sign*THREE.MathUtils.lerp(ringRatio,gemRatio,anchor),y*ringRatio+anchor*(girdle-oldGirdle*ringRatio),z*THREE.MathUtils.lerp(1,gemRatio,anchor));}),accent.radius,metal,group);
  }
  if(d.engraving){
   const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.clearRect(0,0,1024,128);ctx.fillStyle='#645d54';ctx.font='46px Georgia';ctx.textAlign='center';ctx.fillText(d.engraving,512,80,960);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
   const g=new THREE.CylinderGeometry(d.ringSize/2-.012,d.ringSize/2-.012,d.width*.62,128,1,true,-Math.PI*.225,Math.PI*.45);g.rotateX(Math.PI/2);
   const m=new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.BackSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});const text=new THREE.Mesh(g,m);text.userData.engraving=true;group.add(text);
  }
  reflection.position.y=-outer-.12;setScene(d.scene);updateSurface(outer);
  const box=new THREE.Box3().setFromObject(group),center=box.getCenter(V(0,0,0)),delta=center.clone().sub(controls.target);camera.position.add(delta);controls.target.copy(center);
  const fit=fitDistance();if(fit>lastFit*1.03){const direction=camera.position.clone().sub(controls.target);camera.position.copy(controls.target).add(direction.setLength(Math.max(direction.length(),fit)));}lastFit=fit;controls.update();dirty=true;
  return {...dim,prongCount:d.setting==='bezel'?0:d.prongs,girdle};
 }
 function clearSurface(){sceneProps.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.map?.dispose();o.material.dispose();}});sceneProps.clear();}
 function updateSurface(outer){sceneProps.position.y=-outer-.12;}
 function setScene(name){
  const profile=sceneCatalog[name]||sceneCatalog.studio;currentScene=name;
  renderer.setClearColor(profile.background);renderer.toneMappingExposure=profile.exposure;key.color.set(profile.key);rim.color.set(profile.rim);key.intensity=name==='evening'?3.7:3;rim.intensity=name==='evening'?1.5:2;
  reflection.visible=name==='studio';
  if(sceneProps.userData.name!==name){
   clearSurface();sceneProps.userData.name=name;
   if(profile.surface){
    const geometry=new RoundedBoxGeometry(name==='velvet'?36:42,name==='velvet'?4:2,30,5,name==='velvet'?1.8:.6);
    const texture=createSurfaceTexture(profile.surface),material=new THREE.MeshPhysicalMaterial({color:name==='velvet'?0x5c1d32:name==='daylight'?0xc6c5b7:name==='stone'?0xb2a286:0x29242b,map:texture,roughness:name==='velvet'?.98:.72,metalness:0,sheen:name==='velvet'?1:0,sheenColor:0xa25c70});
    const pedestal=new THREE.Mesh(geometry,material);pedestal.position.y=name==='velvet'?-2.1:-1.1;sceneProps.add(pedestal);
    const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),gradient=x.createRadialGradient(32,32,2,32,32,31);gradient.addColorStop(0,'#00000065');gradient.addColorStop(1,'#00000000');x.fillStyle=gradient;x.fillRect(0,0,64,64);
    const contact=new THREE.Mesh(new THREE.PlaneGeometry(15,10),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,opacity:.75}));contact.rotation.x=-Math.PI/2;contact.position.y=-.08;sceneProps.add(contact);
   }
  }
  if(name!=='studio'&&!hdrPromise){
   hdrPromise=import('three/addons/loaders/RGBELoader.js').then(({RGBELoader})=>new RGBELoader().loadAsync('assets/pbr/studio.hdr')).then(texture=>{
    const source=new THREE.WebGLCubeRenderTarget(256);source.fromEquirectangularTexture(renderer,texture);texture.dispose();
    const room=new THREE.Scene(),material=new THREE.ShaderMaterial({side:THREE.BackSide,uniforms:{nativeMap:{value:env.texture},photoMap:{value:source.texture}},vertexShader:'varying vec3 direction;void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 direction;uniform samplerCube nativeMap;uniform samplerCube photoMap;void main(){vec3 d=normalize(direction);vec3 a=textureCube(nativeMap,d).rgb;vec3 b=textureCube(photoMap,d).rgb;gl_FragColor=vec4(mix(a,b,.28),1.);}'}),sphere=new THREE.Mesh(new THREE.SphereGeometry(12,32,16),material);room.add(sphere);
    hdrCube=new THREE.WebGLCubeRenderTarget(256,{type:THREE.HalfFloatType});new THREE.CubeCamera(.1,30,hdrCube).update(renderer,room);hdrLighting=pmrem.fromCubemap(hdrCube.texture);sphere.geometry.dispose();material.dispose();source.dispose();
    if(currentScene!=='studio')applyEnvironment();dirty=true;
   }).catch(()=>{hdrPromise=null;});
  }
  applyEnvironment();dirty=true;
 }
 function applyEnvironment(){
  const native=currentScene==='studio'||!hdrLighting;scene.environment=native?lighting.texture:hdrLighting.texture;gemEnvironment=native?env.texture:hdrCube.texture;
  for(const {material}of gemCache.values())material.uniforms.envMap.value=gemEnvironment;
 }
 controls.addEventListener('change',()=>{dirty=true;});controls.addEventListener('start',()=>{if(auto){auto=false;controls.autoRotate=false;onAutoChange(false);}dirty=true;});
 canvas.tabIndex=0;canvas.setAttribute('aria-label','Интерактивное кольцо. Перетаскивайте для вращения, колесо или щипок для масштаба. Стрелки поворачивают, Home возвращает ракурс.');
 canvas.addEventListener('keydown',event=>{const movement={ArrowLeft:[.12,0],ArrowRight:[-.12,0],ArrowUp:[0,.1],ArrowDown:[0,-.1]};if(movement[event.key]){event.preventDefault();const offset=camera.position.clone().sub(controls.target),spherical=new THREE.Spherical().setFromVector3(offset);spherical.theta+=movement[event.key][0];spherical.phi=THREE.MathUtils.clamp(spherical.phi+movement[event.key][1],.08,Math.PI*.94);camera.position.copy(controls.target).add(offset.setFromSpherical(spherical));controls.update();dirty=true;}if(event.key==='Home'){event.preventDefault();setView('perspective');}});
 function resize(w,h){const host=canvas.parentElement,width=typeof w==='number'?w:host.clientWidth,height=typeof h==='number'?h:host.clientHeight;if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();setView(currentView);dirty=true;}
 function snapshot({transparent=false,component='ring'}={}){
  const alpha=renderer.getClearAlpha(),position=camera.position.clone(),rotation=camera.quaternion.clone(),reflected=reflection.visible,visibility=[];
  if(transparent){renderer.setClearAlpha(0);reflection.visible=false;}
  if(component==='stone'){
   let stone;group.traverse(o=>{if(o.isMesh){visibility.push([o,o.visible]);o.visible=!!o.userData.cached;if(o.userData.cached)stone=o;}});
   const box=new THREE.Box3().setFromObject(stone),center=box.getCenter(V(0,0,0)),length=box.getSize(V(0,0,0)).length()*.55/Math.sin(THREE.MathUtils.degToRad(camera.fov/2));
   camera.position.copy(V(.5,.5,.85).normalize().multiplyScalar(length)).add(center);camera.lookAt(center);camera.updateMatrixWorld();
  }
  renderer.render(scene,camera);const result=canvas.toDataURL('image/png');
  for(const [o,visible]of visibility)o.visible=visible;camera.position.copy(position);camera.quaternion.copy(rotation);renderer.setClearAlpha(alpha);reflection.visible=reflected;dirty=true;return result;
 }
 function setView(view){currentView=view;const length=fitDistance(),vectors={perspective:V(.60,.40,.78),front:V(0,.10,1),side:V(1,.10,.02),top:V(.01,1,.04)};camera.position.copy((vectors[view]||vectors.perspective).normalize().multiplyScalar(length)).add(controls.target);controls.update();dirty=true;}
 function tick(time){if(!active||document.hidden)return;const dt=Math.min(.05,Math.max(0,(time-lastTime)/1000));lastTime=time;const moved=controls.update(dt);if(dirty||moved||controls.autoRotate){renderer.render(scene,camera);dirty=false;}}
 const observer=new ResizeObserver(resize);observer.observe(canvas.parentElement);
 return {setDesign,setScene,resize,tick,setView,async exportGLB(){
  const {GLTFExporter}=await import('three/addons/exporters/GLTFExporter.js');const model=group.clone(true),temporary=[];
  model.traverse(o=>{if(o.isMesh&&o.userData.gem){const g=gems[o.userData.gem],material=new THREE.MeshPhysicalMaterial({color:g.color,roughness:.04,transmission:.95,thickness:1,ior:Math.min(g.ior,2.333),metalness:0});o.material=material;o.onBeforeRender=()=>{};temporary.push(material);}});model.scale.setScalar(.001);model.userData={generator:'ORIGIN Ring Studio',units:'meters',design};
  try{return await new GLTFExporter().parseAsync(model,{binary:true,onlyVisible:true});}finally{temporary.forEach(m=>m.dispose());}
 },setActive(v){active=v;lastTime=performance.now();dirty=true;},setAutoRotate(v){auto=v;controls.autoRotate=v;dirty=true;return auto;},zoom(delta){const direction=camera.position.clone().sub(controls.target);direction.setLength(THREE.MathUtils.clamp(direction.length()*Math.exp(delta),controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(direction);controls.update();dirty=true;},snapshot,dispose(){observer.disconnect();disposeGroup();controls.dispose();reflection.dispose();renderer.dispose();lighting.dispose();env.dispose();pmrem.dispose();for(const {geometry,material}of gemCache.values()){geometry.dispose();material.uniforms.bvh.value.dispose();material.dispose();}metal.dispose();accentMaterial.dispose();Object.values(surfaceTextures).forEach(t=>t.dispose());clearSurface();hdrCube?.dispose();hdrLighting?.dispose();}};
}
