import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createDiamondEnvironment } from './diamond.js';
import { refractionMaterial } from './diamond-material.js';
import { createSatinReflection } from './satin-reflection.js';
import { normalizeDesign, dimensions } from './ring-design.js';

const V=(x,y,z)=>new THREE.Vector3(x,y,z),TAU=Math.PI*2;
const signedPow=(v,p)=>Math.sign(v)*Math.pow(Math.abs(v),p);
function outline(shape,n=32){
 const result=[],ratio={round:1,oval:1.35,cushion:1.05,princess:1,emerald:1.4,pear:1.5,marquise:1.8}[shape];
 for(let i=0;i<n;i++){
  const a=i/n*TAU,c=Math.cos(a),s=Math.sin(a);let x=c*.5,z=s*.5*ratio;
  if(shape==='cushion'){x=signedPow(c,.58)*.5;z=signedPow(s,.58)*.525;}
  if(shape==='princess'||shape==='emerald'){
   const bevel=shape==='princess'?.06:.16,rx=.5,rz=ratio*.5;
   const radius=Math.min(rx/Math.max(1e-9,Math.abs(c)),rz/Math.max(1e-9,Math.abs(s)),(rx+rz-bevel)/Math.max(1e-9,Math.abs(c)+Math.abs(s)));
   x=c*radius;z=s*radius;
  }
  if(shape==='pear'){const fullness=.76-.24*s;x=c*.5*fullness/.79;z=s*.75;}
  if(shape==='marquise'){x=signedPow(c,2)*.5;z=s*.9;}
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
 const edge=outline(shape,32),levels=[{r:0,y:-.44},{r:.64,y:-.22},{r:1,y:-.015},{r:1,y:.015},{r:.57,y:.23}],p=[];
 const point=(l,i)=>{const v=edge[(i+32)%32];return [v.x*l.r,l.y,v.y*l.r];},tri=(a,b,c)=>p.push(...a,...b,...c);
 for(let l=0;l<levels.length-1;l++)for(let i=0;i<32;i++){const a=point(levels[l],i),b=point(levels[l],i+1),c=point(levels[l+1],i),d=point(levels[l+1],i+1);if(l===0)tri(a,c,d);else{tri(a,c,b);tri(b,c,d);}}
 for(let i=0;i<32;i++)tri([0,.23,0],point(levels[4],i+1),point(levels[4],i));
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
  let width=d.width*(d.shank==='tapered'?1-.43*shoulder:1),offset=0,radialOffset=0;
  if(d.shank==='split'){width*=.5;offset=branch*(d.width*.25+shoulder*d.gemSize*.18);}
  if(d.shank==='twist'){width*=.48;offset=branch*d.width*.27*Math.cos(twist);radialOffset=branch*d.thickness*.22*Math.sin(twist);}
  for(let j=0;j<=M;j++){
   const b=j/M*TAU,c=Math.cos(b),s=Math.sin(b),power=d.profile==='flat'?.36:1;
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
export function createRingStudio(canvas,{reduced=false,onAutoChange=()=>{}}={}){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.3:1.6));renderer.setClearColor('#000000');renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,250);camera.position.set(31,23,41);
 const env=createDiamondEnvironment(renderer),pmrem=new THREE.PMREMGenerator(renderer),lighting=pmrem.fromCubemap(env.texture);scene.environment=lighting.texture;scene.environmentIntensity=1.3;
 scene.add(new THREE.HemisphereLight(0xffffff,0x77849a,1.1));const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-12,30,28);scene.add(key);const rim=new THREE.DirectionalLight(0xc5d8ff,2);rim.position.set(25,12,-20);scene.add(rim);
 const metal=new THREE.MeshPhysicalMaterial({metalness:1,roughness:.1,clearcoat:.8,clearcoatRoughness:.12,envMapIntensity:1.5});
 const accentMaterial=new THREE.MeshPhysicalMaterial({color:0xe9f2ff,metalness:.12,roughness:.05,transmission:.6,thickness:.7,ior:2.417,envMapIntensity:2});
 const gemCache=new Map(),controls=new OrbitControls(camera,canvas);controls.target.set(0,2,0);controls.enablePan=false;controls.minDistance=27;controls.maxDistance=95;controls.enableDamping=!reduced;controls.dampingFactor=.12;controls.autoRotateSpeed=.6;controls.maxPolarAngle=Math.PI*.94;controls.minPolarAngle=.08;controls.update();
 let group,design,dirty=true,active=false,auto=false,lastTime=0,currentView='perspective',lastFit=0;controls.maxDistance=150;const reflection=createSatinReflection(scene,{compact:true,exclude:[]});reflection.scale.setScalar(5);reflection.material.uniforms.uStrength.value=.12;
 function fitDistance(){if(!group)return 65;const box=new THREE.Box3().setFromObject(group),size=box.getSize(V(0,0,0));return size.length()*.5/Math.sin(THREE.MathUtils.degToRad(camera.fov/2))/Math.min(camera.aspect,1)*1.05;}
 function disposeGroup(){if(!group)return;const geometries=new Set(),materials=new Set();group.traverse(o=>{if(o.isMesh){if(!o.userData.cached)geometries.add(o.geometry);if(o.userData.engraving)materials.add(o.material);}});for(const g of geometries)g.dispose();for(const m of materials){m.map?.dispose();m.dispose();}scene.remove(group);}
 function gemFor(shape){if(!gemCache.has(shape)){const geometry=gemGeometry(shape),material=refractionMaterial(geometry,env.texture);material.uniforms.bounces.value=innerWidth<700?3:5;gemCache.set(shape,{geometry,material});}return gemCache.get(shape);}
 function setDesign(value){
  design=normalizeDesign(value);const d=design,dim=dimensions(d),outer=d.ringSize/2+d.thickness,girdle=outer+d.gemSize*.44+.45+d.headLift;
  metal.color.set({white:0xe1e4e8,yellow:0xe3b85c,rose:0xd9a293,platinum:0xcbd3dc}[d.metal]);metal.roughness=d.finish==='satin'?.43:.11;metal.clearcoat=d.finish==='satin'?.12:.8;
  disposeGroup();group=new THREE.Group();scene.add(group);
  const branches=['split','twist'].includes(d.shank)?[-1,1]:[0];for(const branch of branches)group.add(new THREE.Mesh(bandGeometry(d,branch),metal));
  const points=outline(d.shape).map(p=>{p.multiplyScalar(d.gemSize);return d.orientation==='east'?new THREE.Vector2(-p.y,p.x):p;});
  const {geometry,material}=gemFor(d.shape);material.uniforms.color.value.set({diamond:'#f4f8ff',lab:'#f4f8ff',sapphire:'#416cdb',ruby:'#d03f60',emerald:'#43a779',moissanite:'#f2ffe8'}[d.gem]);material.uniforms.ior.value={diamond:2.417,lab:2.417,sapphire:1.77,ruby:1.77,emerald:1.58,moissanite:2.65}[d.gem];
  const stone=new THREE.Mesh(geometry,material);stone.userData.cached=true;stone.scale.setScalar(d.gemSize);stone.position.y=girdle;if(d.orientation==='east')stone.rotation.y=Math.PI/2;
  stone.onBeforeRender=(_r,_s,cam)=>{const target=renderer.getRenderTarget();cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();material.uniforms.viewMatrixInverse.value.copy(cam.matrixWorld);material.uniforms.projectionMatrixInverse.value.copy(cam.projectionMatrixInverse);material.uniforms.resolution.value.set(target?target.width:canvas.width,target?target.height:canvas.height);};group.add(stone);
  const baseY=outer+.3;
  contourTube(points,baseY,.22,metal,group,.34);contourTube(points,girdle-.85,.19,metal,group,.83);
  for(const side of [-1,1]){
   const contact=surfaceAt(points,side>0?0:Math.PI);
   pipe([V(side*d.ringSize*.36,d.ringSize*.35,0),V(side*d.ringSize*.23,outer-.1,0),V(contact.x*.34,baseY,contact.y*.34)],Math.max(.25,d.width*.13),metal,group);
  }
  if(d.setting==='bezel')group.add(new THREE.Mesh(bezelGeometry(points,girdle,.38+dim.prong*.15),metal));
  else for(let i=0;i<d.prongs;i++){
   const offset=(d.shape==='pear'||d.shape==='marquise')?Math.PI/2:Math.PI/4,angle=i/d.prongs*TAU+offset,edge=surfaceAt(points,angle),crown=d.gemSize*.23;
   const path=[V(edge.x*.34,baseY,edge.y*.34),V(edge.x*.83,girdle-.85,edge.y*.83),V(edge.x*1.035,girdle+crown*.12,edge.y*1.035),V(edge.x*.88,girdle+crown*.30,edge.y*.88)];
   const radius=dim.prong/2;pipe(path,radius,metal,group,d.prongStyle==='claw'?.32:1);
   if(d.prongStyle==='v'){const tangent=V(-Math.sin(angle)*.25,0,Math.cos(angle)*.25),tip=path.at(-1);for(const sign of [-1,1])pipe([path[2],tip.clone().addScaledVector(tangent,sign)],radius*.7,metal,group,.65);}
   const tip=new THREE.Mesh(new THREE.SphereGeometry(radius*(d.prongStyle==='claw'?.35:.93),12,12),metal);tip.position.copy(path.at(-1));group.add(tip);
  }
  if(d.shank==='pave'){
   const smallGeometry=gemGeometry('round'),beadGeometry=new THREE.SphereGeometry(.13,8,8);
   for(let i=0;i<24;i++){const a=Math.PI*.15+i/23*Math.PI*.70;if(Math.abs(Math.cos(a)*(outer+.2))<dim.width*.52)continue;
    const small=new THREE.Mesh(smallGeometry,accentMaterial);small.scale.setScalar(Math.min(1.05,d.width*.48));small.position.set(Math.cos(a)*(outer+.20),Math.sin(a)*(outer+.20),0);small.rotation.z=a-Math.PI/2;group.add(small);
    for(const z of [-1,1]){const bead=new THREE.Mesh(beadGeometry,metal);bead.position.set(Math.cos(a)*(outer+.08),Math.sin(a)*(outer+.08),z*d.width*.29);group.add(bead);}
   }
  }
  if(d.engraving){
   const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.clearRect(0,0,1024,128);ctx.fillStyle='#645d54';ctx.font='46px Georgia';ctx.textAlign='center';ctx.fillText(d.engraving,512,80,960);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
   const g=new THREE.CylinderGeometry(d.ringSize/2-.012,d.ringSize/2-.012,d.width*.62,128,1,true,-Math.PI*.225,Math.PI*.45);g.rotateX(Math.PI/2);
   const m=new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.BackSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});const text=new THREE.Mesh(g,m);text.userData.engraving=true;group.add(text);
  }
  reflection.position.y=-outer-.12;
  const box=new THREE.Box3().setFromObject(group),center=box.getCenter(V(0,0,0)),delta=center.clone().sub(controls.target);camera.position.add(delta);controls.target.copy(center);
  const fit=fitDistance();if(fit>lastFit*1.03){const direction=camera.position.clone().sub(controls.target);camera.position.copy(controls.target).add(direction.setLength(Math.max(direction.length(),fit)));}lastFit=fit;controls.update();dirty=true;
  return {...dim,prongCount:d.setting==='bezel'?0:d.prongs,girdle};
 }
 controls.addEventListener('change',()=>{dirty=true;});controls.addEventListener('start',()=>{if(auto){auto=false;controls.autoRotate=false;onAutoChange(false);}dirty=true;});
 canvas.tabIndex=0;canvas.setAttribute('aria-label','Интерактивное кольцо. Перетаскивайте для вращения, колесо или щипок для масштаба. Стрелки поворачивают, Home возвращает ракурс.');
 canvas.addEventListener('keydown',event=>{const movement={ArrowLeft:[.12,0],ArrowRight:[-.12,0],ArrowUp:[0,.1],ArrowDown:[0,-.1]};if(movement[event.key]){event.preventDefault();controls.rotateLeft(movement[event.key][0]);controls.rotateUp(movement[event.key][1]);controls.update();dirty=true;}if(event.key==='Home'){event.preventDefault();setView('perspective');}});
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
 return {setDesign,resize,tick,setView,setActive(v){active=v;lastTime=performance.now();dirty=true;},setAutoRotate(v){auto=v;controls.autoRotate=v;dirty=true;return auto;},zoom(delta){const direction=camera.position.clone().sub(controls.target);direction.setLength(THREE.MathUtils.clamp(direction.length()*Math.exp(delta),controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(direction);controls.update();dirty=true;},snapshot,dispose(){observer.disconnect();disposeGroup();controls.dispose();reflection.dispose();renderer.dispose();lighting.dispose();env.dispose();pmrem.dispose();for(const {geometry,material}of gemCache.values()){geometry.dispose();material.uniforms.bvh.value.dispose();material.dispose();}metal.dispose();accentMaterial.dispose();}};
}
