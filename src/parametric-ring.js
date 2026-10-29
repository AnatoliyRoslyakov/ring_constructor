import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createDiamondEnvironment } from './diamond.js';
import { refractionMaterial } from './diamond-material.js';
import { normalizeDesign, dimensions, headGirdle } from './ring-design.js';
import { gems,shapeRatios,sceneCatalog } from './constructor/catalog.js';
import { buildFreeMetal,freeBandFrame,radialScale,fittedRimGeometry } from './freeform-geometry.js';

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
  if(shape==='halfmoon'){const theta=i/(n-1)*Math.PI-Math.PI/2;x=Math.cos(theta);z=Math.sin(theta)*ratio*.5;}
  if(shape==='trapezoid'){
   const vertices=[new THREE.Vector2(-.5,-ratio*.5),new THREE.Vector2(.5,-ratio*.29),new THREE.Vector2(.5,ratio*.29),new THREE.Vector2(-.5,ratio*.5)];
   const at=i/n*4,edge=Math.floor(at),v=vertices[edge].clone().lerp(vertices[(edge+1)%4],at-edge);x=v.x;z=v.y;
  }
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
function bandSection(d,a,branch=0){
  const shoulder=Math.pow(Math.max(0,Math.sin(a)),8),twist=a*3;
  let width=d.width*(['tapered','cathedral'].includes(d.shank)?1-d.taper*shoulder:1),offset=0,radialOffset=0;
  if(d.shank==='split'){width*=.5;offset=branch*(d.width*.25+shoulder*d.gemSize*.18);}
  if(['twist','rope','organic'].includes(d.shank)){const turns=d.shank==='rope'?a*9:d.shank==='organic'?a*2:twist;width*=.46;offset=branch*d.width*.28*Math.cos(turns);radialOffset=branch*d.thickness*.30*Math.sin(turns);}
  if(d.shank==='double'){width*=.42;offset=branch*d.width*.32;}
  if(d.shank==='bypass'){offset=Math.sin(a)*d.width*.38;radialOffset=Math.cos(a)*shoulder*.45;}
  if(d.shank==='chevron')radialOffset=-shoulder*(.75+Math.abs(Math.cos(a))*.9);
  return {width,offset,radialOffset};
}
function bandGeometry(d,branch=0){
 const N=192,M=24,p=[],indices=[],r=d.ringSize/2+d.thickness/2;
 for(let i=0;i<=N;i++){
  const a=i/N*TAU,{width,offset,radialOffset}=bandSection(d,a,branch);
  for(let j=0;j<=M;j++){
   const b=j/M*TAU,c=Math.cos(b),s=Math.sin(b),power=d.profile==='square'?.2:d.profile==='flat'?.36:d.profile==='comfort'?.65:1;
   const radial=signedPow(c,power)*d.thickness/2,axial=(d.profile==='knife'?signedPow(s,.45):signedPow(s,power))*width/2;
   p.push(Math.cos(a)*(r+radial+radialOffset),Math.sin(a)*(r+radial+radialOffset),offset+axial);
  }
 }
 for(let i=0;i<N;i++)for(let j=0;j<M;j++){const a=i*(M+1)+j,b=a+M+1;indices.push(a,b,a+1,b,b+1,a+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
function pipe(points,radius,material,parent,taper=1,closed=false){
 const curve=new THREE.CatmullRomCurve3(points,closed,'centripetal'),segments=closed?Math.max(64,points.length*3):36,g=new THREE.TubeGeometry(curve,segments,radius,12,closed);
 if(taper!==1){const p=g.attributes.position;for(let i=0;i<=36;i++){const center=curve.getPointAt(i/36),factor=THREE.MathUtils.lerp(1,taper,Math.pow(i/36,4));for(let j=0;j<=12;j++){const n=i*13+j;p.setXYZ(n,center.x+(p.getX(n)-center.x)*factor,center.y+(p.getY(n)-center.y)*factor,center.z+(p.getZ(n)-center.z)*factor);}}g.computeVertexNormals();}
 const m=new THREE.Mesh(g,material);parent.add(m);return m;
}
function contourTube(points,y,r,material,parent,scale=1){return pipe(points.map(p=>V(p.x*scale,y,p.y*scale)),r,material,parent,1,true);}
function offsetContour(points,distance){
 return points.map((p,i)=>{const previous=points[(i+points.length-1)%points.length],next=points[(i+1)%points.length],a=p.clone().sub(previous).normalize(),b=next.clone().sub(p).normalize(),n=new THREE.Vector2(a.y+b.y,-a.x-b.x).normalize();return p.clone().addScaledVector(n,distance/Math.max(.6,n.dot(new THREE.Vector2(a.y,-a.x))));});
}
function shoulderBridge(points,width,depth,endWidth,material,parent){
 const curve=new THREE.CatmullRomCurve3(points,false,'centripetal'),positions=[],indices=[],N=48,M=16;
 for(let i=0;i<=N;i++){
  const t=i/N,at=curve.getPointAt(t),tangent=curve.getTangentAt(t),axis=V(0,0,1).addScaledVector(tangent,-tangent.z).normalize(),normal=tangent.clone().cross(axis).normalize(),ease=t*t*(3-2*t),w=THREE.MathUtils.lerp(width,endWidth,ease),h=THREE.MathUtils.lerp(depth,.24,ease);
  for(let j=0;j<=M;j++){const a=j/M*TAU,p=at.clone().addScaledVector(axis,Math.sin(a)*w*.5).addScaledVector(normal,Math.cos(a)*h);positions.push(...p);}
 }
 for(let i=0;i<N;i++)for(let j=0;j<M;j++){const a=i*(M+1)+j,b=a+M+1;indices.push(a,a+1,b,b,a+1,b+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();parent.add(new THREE.Mesh(g,material));
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
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.3:1.6));renderer.setClearColor('#000000');renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,250);camera.position.set(31,23,41);
 const env=createDiamondEnvironment(renderer),pmrem=new THREE.PMREMGenerator(renderer),lighting=pmrem.fromCubemap(env.texture);scene.environment=lighting.texture;scene.environmentIntensity=1.3;let gemEnvironment=env.texture,hdrCube,hdrLighting,hdrPromise,currentScene='studio';
 scene.add(new THREE.HemisphereLight(0xffffff,0x77849a,1.1));const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-12,30,28);scene.add(key);const rim=new THREE.DirectionalLight(0xc5d8ff,2);rim.position.set(25,12,-20);scene.add(rim);
 const metal=new THREE.MeshPhysicalMaterial({metalness:1,roughness:.1,clearcoat:.8,clearcoatRoughness:.12,envMapIntensity:1.5});
 const surfaceTextures=createFinishTextures();
 const gemCache=new Map(),controls=new OrbitControls(camera,canvas);controls.target.set(0,2,0);controls.enablePan=false;controls.minDistance=27;controls.maxDistance=95;controls.enableDamping=!reduced;controls.dampingFactor=.12;controls.autoRotateSpeed=.6;controls.maxPolarAngle=Math.PI*.94;controls.minPolarAngle=.08;controls.update();
 let group,design,dirty=true,active=false,auto=false,lastTime=0,currentView='perspective',lastFit=0;controls.maxDistance=150;
 function fitDistance(){if(!group)return 65;const box=new THREE.Box3().setFromObject(group),size=box.getSize(V(0,0,0));return size.length()*.5/Math.sin(THREE.MathUtils.degToRad(camera.fov/2))/Math.min(camera.aspect,1)*1.05;}
 function disposeGroup(){if(!group)return;const geometries=new Set(),materials=new Set();group.traverse(o=>{if(o.isMesh){if(!o.userData.cached)geometries.add(o.geometry);if(o.isInstancedMesh)o.dispose();if(o.userData.engraving||o.userData.ownedMaterial)materials.add(o.material);}});for(const g of geometries)g.dispose();for(const m of materials){m.map?.dispose();m.dispose();}scene.remove(group);}
 function gemFor(shape,kind='diamond'){
  const id=`${shape}:${kind}`;
  if(!gemCache.has(id)){const geometry=gemGeometry(shape),material=refractionMaterial(geometry,gemEnvironment);material.uniforms.bounces.value=innerWidth<700?3:5;material.uniforms.color.value.set(gems[kind].color);material.uniforms.ior.value=gems[kind].ior;gemCache.set(id,{geometry,material});}
  return gemCache.get(id);
 }
 function addGem(parent,shape,kind,size,position,rotation=null,primary=false,ratio=shapeRatios[shape]){
  const cached=gemFor(shape,kind),geometry=cached.geometry,material=cached.material,stone=new THREE.Mesh(geometry,material);stone.userData.cached=true;stone.userData.gem=kind;stone.userData.primary=primary;stone.scale.setScalar(size);stone.position.copy(position);if(rotation)stone.rotation.copy(rotation);
  stone.scale.z*=ratio/shapeRatios[shape];
  stone.onBeforeRender=(_r,_s,cam)=>{const target=renderer.getRenderTarget();cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();material.uniforms.viewMatrixInverse.value.copy(cam.matrixWorld);material.uniforms.projectionMatrixInverse.value.copy(cam.projectionMatrixInverse);material.uniforms.resolution.value.set(target?target.width:canvas.width,target?target.height:canvas.height);};parent.add(stone);return stone;
 }
 function setDesign(value){
  const normalized=normalizeDesign(value);
  if(design&&JSON.stringify({...design,scene:''})===JSON.stringify({...normalized,scene:''})){design=normalized;setScene(design.scene);return dimensions(design);}
  const hadOrnament=!!design?.freeform?.ornament;design=normalized;const d=design,dim=dimensions(d),outer=d.ringSize/2+d.thickness,girdle=headGirdle(d);
  metal.color.set({white:0xe1e4e8,yellow:0xe3b85c,rose:0xd9a293,platinum:0xcbd3dc}[d.metal]);metal.roughness={mirror:.11,satin:.43,brushed:.36,hammered:.25}[d.finish];metal.clearcoat=d.finish==='mirror'?.8:.15;metal.bumpMap=d.finish==='mirror'?null:surfaceTextures[d.finish];metal.bumpScale=d.finish==='hammered'?.075:d.finish==='brushed'?.012:.006;
  disposeGroup();group=new THREE.Group();scene.add(group);
  const branches=['split','twist','rope','double','organic'].includes(d.shank)?[-1,1]:[0];
  const points=outline(d.shape).map(p=>{p.y*=d.gemRatio/shapeRatios[d.shape];p.multiplyScalar(d.gemSize);return d.orientation==='east'?new THREE.Vector2(-p.y,p.x):p;});
  if(d.centerStone){const stone=addGem(group,d.shape,d.gem,d.gemSize,V(0,girdle,0),null,true,d.gemRatio);stone.name='Central stone';if(d.orientation==='east')stone.rotation.y=Math.PI/2;}
  if(d.freeform){buildFreeMetal(d,dim,group,metal,{outline,surfaceAt,offsetContour});}else{
for(const branch of branches)group.add(new THREE.Mesh(bandGeometry(d,branch),metal));
  if(d.centerStone){
   const seatDepth=d.setting==='basket'?.22:.18,seatY=girdle-seatDepth*d.gemSize,seatRadius=Math.max(.18,dim.prong*.38);
   const contact=(angle,h,clearance=0)=>{const edge=surfaceAt(points,angle),normal=edge.clone().normalize();edge.multiplyScalar(radialScale(d.shape,h)).addScaledVector(normal,clearance);return V(edge.x,girdle+h*d.gemSize,edge.y);};
   const seatAt=angle=>contact(angle,-seatDepth,seatRadius*.75);
   pipe(Array.from({length:64},(_,i)=>seatAt(i/64*TAU)),seatRadius,metal,group,1,true);
   // Every shoulder starts inside the actual band section and terminates on the gallery.
   for(const side of [-1,1])for(const branch of branches){
    const baseAngle=d.shank==='cathedral'?Math.PI*.24:Math.acos(Math.min(.76,(dim.spanX*.58+1)/outer)),a=side>0?baseAngle:Math.PI-baseAngle,section=bandSection(d,a,branch),r=d.ringSize*.5+d.thickness*.5+section.radialOffset,anchor=V(Math.cos(a)*r,Math.sin(a)*r,section.offset),azimuth=(side>0?0:Math.PI)+(section.offset?Math.sign(section.offset)*side*.52:0),end=seatAt(azimuth),tangent=V(-side*Math.sin(baseAngle),Math.cos(baseAngle),0);
    const approach=anchor.clone().lerp(end,.67);approach.y=Math.min(end.y-.18,approach.y+(d.shank==='cathedral'?.65:.2));
    shoulderBridge([anchor,anchor.clone().addScaledVector(tangent,.85),approach,end],Math.max(.7,section.width*.94),d.thickness*.44,Math.max(.5,seatRadius*2.4),metal,group);
   }
   if(['bezel','halfbezel','tension'].includes(d.setting)){
    const arcs=d.setting==='bezel'?[[0,360]]:d.setting==='halfbezel'?[[-52,52],[128,232]]:[[-24,24],[156,204]],wall=d.setting==='tension'?Math.max(.45,d.width*.22):.3+dim.prong*.16;
    for(const [from,to] of arcs)group.add(new THREE.Mesh(fittedRimGeometry(points,surfaceAt,d.shape,girdle,d.gemSize,{from,to,depth:seatDepth,wall,height:.035}),metal));
    if(d.setting==='tension')for(const side of [-1,1]){
     const a=side>0?0:Math.PI,root=seatAt(a),end=contact(a,.01,wall*.6);
     shoulderBridge([root,contact(a,-seatDepth*.55,wall*.55),end],Math.max(.7,d.width*.65),.3,Math.max(.65,d.width*.5),metal,group);
    }
   }else for(let i=0;i<d.prongs;i++){
    const offset=d.setting==='compass'?0:(d.shape==='pear'||d.shape==='marquise')?Math.PI/2:Math.PI/4,rectangular=['princess','emerald','asscher','radiant','cushion'].includes(d.shape),corner=Math.atan2(dim.spanZ,dim.spanX),corners=[corner,Math.PI-corner,Math.PI+corner,TAU-corner],angles=rectangular&&d.setting!=='compass'?(d.prongs===4?corners:d.prongs===6?[...corners,0,Math.PI]:[...corners,0,Math.PI/2,Math.PI,Math.PI*1.5]):null,angle=angles?angles[i]:i/d.prongs*TAU+offset,radius=dim.prong*.5;
    const addClaw=(a,r)=>{
     const tipRadius=r*(d.prongStyle==='claw'?.42:.72),path=[seatAt(a),contact(a,-.08,r*.85+(d.setting==='tulip'?.13:0)),contact(a,.018,r*.92),contact(a,.07,tipRadius*.66)];
     pipe(path,r,metal,group,d.prongStyle==='claw'?.42:.72);
     const tip=new THREE.Mesh(new THREE.SphereGeometry(tipRadius,14,12),metal);tip.position.copy(path.at(-1));group.add(tip);
     if(d.prongStyle==='v'){const spread=.12;for(const sign of [-1,1])pipe([path[2],contact(a+sign*spread,.07,r*.45)],r*.45,metal,group,.6);}
    };
    if(d.prongStyle==='double')for(const sign of [-1,1])addClaw(angle+sign*radius*.78/(surfaceAt(points,angle).length()),radius*.63);else addClaw(angle,radius);
   }
   if(['basket','crown'].includes(d.setting))pipe(Array.from({length:64},(_,i)=>contact(i/64*TAU,-.035,.17)),.17,metal,group,1,true);
   if(d.halo!=='none')for(const angle of [0,Math.PI*.5,Math.PI,Math.PI*1.5]){
    const edge=surfaceAt(points,angle),hidden=d.halo==='hidden',out=edge.clone().normalize(),distance=d.haloSize*(hidden?.62:d.halo==='double'?1.79:.67);if(hidden)edge.multiplyScalar(radialScale(d.shape,-.20));
    const end=V(edge.x+out.x*distance,(hidden?girdle-d.gemSize*.20:girdle+.08)-d.haloSize*.34,edge.y+out.y*distance);
    pipe([seatAt(angle),contact(angle,hidden?-.20:-.03,.24),end],.18,metal,group);
   }
  }}
  if(d.shank==='pave'||d.pave!=='none'){
   const bands=d.freeform?.shank?.bands||branches,rows=Number(d.paveRows),beadGeometry=new THREE.SphereGeometry(.09,8,6),arc=d.pave==='full'?TAU:TAU*d.paveCoverage;
   // Rows run side-by-side across each band's actual cross section, not around the centre stone.
   const budget=Math.max(16,Math.floor(360/(bands.length*rows))),baseSize=Math.min(1.25,d.width*.72/(rows*1.12)),count=Math.min(budget,Math.max(8,Math.floor(arc*outer/(baseSize*1.16))));
   const beadPositions=[];
   for(const branch of bands)for(let i=0;i<count;i++){
    const a=Math.PI/2-arc/2+(i+.5)/count*arc;if(d.centerStone&&Math.sin(a)>0&&Math.abs(Math.cos(a)*outer)<dim.spanX*.52)continue;
    if(d.freeform&&!d.freeform.shank)continue;if(d.freeform&&(!branch.closed&&(a*180/Math.PI<branch.stations[0][0]||a*180/Math.PI>branch.stations.at(-1)[0])))continue;
    const section=d.freeform?freeBandFrame(d,branch,a*180/Math.PI):bandSection(d,a,branch),size=Math.min(1.25,section.width*.72/(rows*1.12)),spacing=size*1.12;
    for(let row=0;row<rows;row++){
     const lateral=(row-(rows-1)/2)*spacing;
     let surface=outer+section.radialOffset,offset=section.offset+lateral;
     if(d.freeform){
      // Intersect the real authored profile at this row's axial position.
      offset=section.offset+lateral;let radial=-Infinity;
      for(let j=0;j<section.vertices.length;j++){const p=section.vertices[j],q=section.vertices[(j+1)%section.vertices.length];if(lateral>=Math.min(p[1],q[1])&&lateral<=Math.max(p[1],q[1])&&Math.abs(q[1]-p[1])>.0001)radial=Math.max(radial,p[0]+(q[0]-p[0])*(lateral-p[1])/(q[1]-p[1]));}
      if(!Number.isFinite(radial))continue;surface=section.r+radial;
     }else{const power=d.profile==='square'?.2:d.profile==='flat'?.36:d.profile==='comfort'?.65:1,s=Math.pow(Math.abs(lateral)/(section.width*.5),1/power);surface-=d.thickness*.5*(1-Math.pow(Math.sqrt(Math.max(0,1-s*s)),power));}
     addGem(group,'round','diamond',size,V(Math.cos(a)*(surface+size*.06),Math.sin(a)*(surface+size*.06),offset),new THREE.Euler(0,0,a-Math.PI/2));
     for(const z of [-1,1])beadPositions.push(V(Math.cos(a)*(surface+size*.10),Math.sin(a)*(surface+size*.10),offset+z*size*.47));
    }
   }
   if(beadPositions.length){const beads=new THREE.InstancedMesh(beadGeometry,metal,beadPositions.length),pose=new THREE.Object3D();beadPositions.forEach((p,i)=>{pose.position.copy(p);pose.updateMatrix();beads.setMatrixAt(i,pose.matrix);});group.add(beads);}else beadGeometry.dispose();
  }
  if(d.centerStone&&d.halo!=='none'&&(!d.freeform||d.freeform.setting)){
   const hidden=d.halo==='hidden',rows=d.halo==='double'?2:1;
   for(let row=0;row<rows;row++){
    const y=hidden?girdle-d.gemSize*.20:girdle+.08;
    const rowPoints=offsetContour(hidden?points.map(p=>p.clone().multiplyScalar(radialScale(d.shape,-.20))):points,d.haloSize*(hidden?.62:.67+row*1.12)),curve=new THREE.CatmullRomCurve3(rowPoints.map(p=>V(p.x,y,p.y)),true,'centripetal');
    contourTube(rowPoints,y-d.haloSize*.34,.19,metal,group);
    const count=Math.min(72,Math.max(12,Math.floor(curve.getLength()/(d.haloSize*1.08)))),beadGeometry=new THREE.SphereGeometry(.10,8,6);
    for(let i=0;i<count;i++){
     const at=curve.getPointAt(i/count),tangent=curve.getTangentAt(i/count);addGem(group,'round','diamond',d.haloSize,at);
     for(const side of [-1,1]){const bead=new THREE.Mesh(beadGeometry,metal);bead.position.copy(at).addScaledVector(tangent,side*d.haloSize*.47);bead.position.y+=d.haloSize*.10;group.add(bead);}
    }
   }
  }
  if(d.centerStone&&d.sideStones!=='none'&&(!d.freeform||d.freeform.setting)){
   const count=d.sideStones==='pair'?1:d.sideStones==='trio'?2:3;
   for(const sign of [-1,1])for(let i=0;i<count;i++){
    const size=d.gemSize*d.sideSize*(1-i*.18),clearance=['single','double'].includes(d.halo)?d.haloSize*(d.halo==='double'?2.9:1.6):0,x=sign*(dim.spanX*.5+clearance+size*.56+i*size*1.08),y=girdle-(d.gemSize-size)*.3-i*.35,head=new THREE.Group();head.position.set(x,y,0);head.rotation.z=-sign*.18;group.add(head);
    addGem(head,d.sideShape,'diamond',size,V(0,0,0));if(['halfmoon','trapezoid'].includes(d.sideShape))head.scale.x=sign;
    const sidePoints=outline(d.sideShape).map(p=>p.multiplyScalar(size)),seatScale=radialScale(d.sideShape,-.18);contourTube(sidePoints,-size*.18,.13,metal,head,seatScale);
    for(let claw=0;claw<4;claw++){
     const edge=surfaceAt(sidePoints,Math.PI/4+claw/4*TAU);pipe([V(edge.x*seatScale,-size*.18,edge.y*seatScale),V(edge.x*1.04,0,edge.y*1.04),V(edge.x*.92,size*.07,edge.y*.92)],Math.max(.12,size*.06),metal,head,.7);
    }
    const anchorX=sign*Math.min(outer*.82,Math.abs(x)*.78),anchorY=Math.sqrt(Math.max(0,outer*outer-anchorX*anchorX));
    head.updateMatrix();
    for(const z of [-1,1]){const edge=surfaceAt(sidePoints,(sign>0?Math.PI:0)+z*.55).multiplyScalar(seatScale),end=V(edge.x,-size*.18,edge.y).applyMatrix4(head.matrix),anchor=V(anchorX,anchorY,z*Math.min(d.width*.3,size*.22));pipe([anchor,anchor.clone().lerp(end,.55).add(V(0,.25,0)),end],Math.max(.18,size*.07),metal,group);}
   }
  }
  if(!d.freeform&&(d.detail==='milgrain'||d.detail==='rails')){
   const beadGeometry=d.detail==='milgrain'?new THREE.SphereGeometry(.13,8,6):null,instances=beadGeometry?new THREE.InstancedMesh(beadGeometry,metal,176):null,pose=new THREE.Object3D();let beadIndex=0;if(instances)group.add(instances);
   for(const z of [-1,1]){
    if(d.detail==='rails'){
     const rail=new THREE.Mesh(new THREE.TorusGeometry(outer-.06,.13,8,160),metal);rail.position.z=z*d.width*.43;group.add(rail);
    }else for(let i=0;i<88;i++){const a=i/88*TAU;pose.position.set(Math.cos(a)*(outer-.04),Math.sin(a)*(outer-.04),z*d.width*.40);pose.updateMatrix();instances.setMatrixAt(beadIndex++,pose.matrix);}
   }
  }
  if(d.centerStone&&!d.freeform&&d.detail==='gallery')for(let i=0;i<6;i++){
   const depth=d.setting==='basket'?.22:.18,a=i/6*TAU,b=(i+1)/6*TAU,scale=radialScale(d.shape,-depth),p=surfaceAt(points,a).multiplyScalar(scale),q=surfaceAt(points,b).multiplyScalar(scale),y=girdle-depth*d.gemSize;
   pipe([V(p.x,y,p.y),V((p.x+q.x)*.42,y-.32,(p.y+q.y)*.42),V(q.x,y,q.y)],.13,metal,group);
  }
  for(const accent of d.freeform?[]:d.accents){
   const basis=accent.basis||[d.ringSize,d.gemSize,d.headLift,d.thickness],ringRatio=d.ringSize/basis[0],gemRatio=d.gemSize/basis[1],oldOuter=basis[0]/2+basis[3],oldGirdle=oldOuter+basis[1]*.44+.45+basis[2];
   for(const sign of accent.mirrorX?[-1,1]:[1])pipe(accent.points.map(([x,y,z])=>{const anchor=THREE.MathUtils.clamp((y-oldOuter*.55)/Math.max(1,oldGirdle-oldOuter*.55),0,1);return V(x*sign*THREE.MathUtils.lerp(ringRatio,gemRatio,anchor),y*ringRatio+anchor*(girdle-oldGirdle*ringRatio),z*THREE.MathUtils.lerp(1,gemRatio,anchor));}),accent.radius,metal,group);
  }
  if(d.engraving){
   const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.clearRect(0,0,1024,128);ctx.fillStyle='#645d54';ctx.font='46px Georgia';ctx.textAlign='center';ctx.fillText(d.engraving,512,80,960);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
   const g=new THREE.CylinderGeometry(d.ringSize/2-.012,d.ringSize/2-.012,d.width*.62,128,1,true,-Math.PI*.225,Math.PI*.45);g.rotateX(Math.PI/2);
   const m=new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.BackSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});const text=new THREE.Mesh(g,m);text.userData.engraving=true;group.add(text);
  }
  setScene(d.scene);
  const box=new THREE.Box3().setFromObject(group),center=box.getCenter(V(0,0,0)),delta=center.clone().sub(controls.target);camera.position.add(delta);controls.target.copy(center);
  const fit=fitDistance();if(fit>lastFit*1.03){const direction=camera.position.clone().sub(controls.target);camera.position.copy(controls.target).add(direction.setLength(Math.max(direction.length(),fit)));}lastFit=fit;controls.update();if(!hadOrnament&&d.freeform?.ornament&&currentView==='perspective')setView('perspective');dirty=true;
  return {...dim,prongCount:!d.centerStone||d.setting==='bezel'?0:d.prongs,girdle};
 }
 function setScene(name){
  const profile=sceneCatalog[name]||sceneCatalog.studio;currentScene=name;
  renderer.setClearColor(profile.background);renderer.toneMappingExposure=profile.exposure*(design?.freeform?.ornament?.72:1);key.color.set(profile.key);rim.color.set(profile.rim);key.intensity=name==='evening'?3.7:3;rim.intensity=name==='evening'?1.5:2;
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
  const alpha=renderer.getClearAlpha(),position=camera.position.clone(),rotation=camera.quaternion.clone(),visibility=[];
  if(transparent){renderer.setClearAlpha(0);}
  if(component==='stone'&&design.centerStone){
   let stone;group.traverse(o=>{if(o.isMesh){visibility.push([o,o.visible]);o.visible=o.userData.primary===true;if(o.userData.primary)stone=o;}});
   const box=new THREE.Box3().setFromObject(stone),center=box.getCenter(V(0,0,0)),length=box.getSize(V(0,0,0)).length()*.55/Math.sin(THREE.MathUtils.degToRad(camera.fov/2));
   camera.position.copy(V(.5,.5,.85).normalize().multiplyScalar(length)).add(center);camera.lookAt(center);camera.updateMatrixWorld();
  }
  renderer.render(scene,camera);const result=canvas.toDataURL('image/png');
  for(const [o,visible]of visibility)o.visible=visible;camera.position.copy(position);camera.quaternion.copy(rotation);renderer.setClearAlpha(alpha);dirty=true;return result;
 }
 function setView(view){currentView=view;const length=fitDistance(),vectors={perspective:design?.freeform?.ornament?V(.92,.28,.62):V(.60,.40,.78),front:V(0,.10,1),side:V(1,.10,.02),top:V(.01,1,.04)};camera.position.copy((vectors[view]||vectors.perspective).normalize().multiplyScalar(length)).add(controls.target);controls.update();dirty=true;}
 function tick(time){if(!active||document.hidden)return;const dt=Math.min(.05,Math.max(0,(time-lastTime)/1000));lastTime=time;const moved=controls.update(dt);if(dirty||moved||controls.autoRotate){renderer.render(scene,camera);dirty=false;}}
 const observer=new ResizeObserver(resize);observer.observe(canvas.parentElement);
 return {setDesign,setScene,resize,tick,setView,async exportGLB(){
  const {GLTFExporter}=await import('three/addons/exporters/GLTFExporter.js');const model=group.clone(true),temporary=[];
  model.traverse(o=>{if(o.isMesh&&o.userData.gem){const g=gems[o.userData.gem],material=new THREE.MeshPhysicalMaterial({color:g.color,roughness:.04,transmission:.95,thickness:1,ior:Math.min(g.ior,2.333),metalness:0});o.material=material;o.onBeforeRender=()=>{};temporary.push(material);}});model.scale.setScalar(.001);model.userData={generator:'ORIGIN Ring Studio',units:'meters',design};
  try{return await new GLTFExporter().parseAsync(model,{binary:true,onlyVisible:true});}finally{temporary.forEach(m=>m.dispose());}
 },setActive(v){active=v;lastTime=performance.now();dirty=true;},setAutoRotate(v){auto=v;controls.autoRotate=v;dirty=true;return auto;},zoom(delta){const direction=camera.position.clone().sub(controls.target);direction.setLength(THREE.MathUtils.clamp(direction.length()*Math.exp(delta),controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(direction);controls.update();dirty=true;},snapshot,dispose(){observer.disconnect();disposeGroup();controls.dispose();renderer.dispose();lighting.dispose();env.dispose();pmrem.dispose();for(const {geometry,material}of gemCache.values()){geometry.dispose();material.uniforms.bvh.value.dispose();material.dispose();}metal.dispose();Object.values(surfaceTextures).forEach(t=>t.dispose());hdrCube?.dispose();hdrLighting?.dispose();}};
}
