import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const lerp=THREE.MathUtils.lerp;
const smooth=(a,b,v)=>{const t=THREE.MathUtils.clamp((v-a)/(b-a),0,1);return t*t*(3-2*t)};
function mesh(g,m,parent,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function pipe(points,radius,mat,parent){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),80,radius,16,false),mat,parent)}
function texturedNoise(size=512){
 const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d');x.fillStyle='#949494';x.fillRect(0,0,size,size);let seed=1841;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
 for(let i=0;i<19000;i++){const n=80+rnd()*100;x.fillStyle=`rgba(${n},${n},${n},.25)`;x.fillRect(rnd()*size,rnd()*size,1+rnd()*2,1+rnd()*2)}
 for(let i=0;i<230;i++){x.strokeStyle=`rgba(${rnd()>.5?'245,245,245':'30,30,30'},${.03+rnd()*.10})`;x.lineWidth=.4+rnd()*.8;const px=rnd()*size,py=rnd()*size;x.beginPath();x.moveTo(px,py);x.lineTo(px+30+rnd()*130,py+(rnd()-.5)*6);x.stroke()}
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;
}
function stampTexture(color=false){const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d');x.fillStyle=color?'#cfaa62':'#808080';x.fillRect(0,0,1024,512);x.fillStyle=color?'#b58e47':'#484848';x.textAlign='center';x.font='500 115px Georgia';x.fillText('Au',512,230);x.font='38px Georgia';x.fillText('O R I G I N',512,320);x.strokeStyle=color?'#b38a42':'#626262';x.lineWidth=3;x.strokeRect(340,80,344,300);const t=new THREE.CanvasTexture(c);if(color)t.colorSpace=THREE.SRGBColorSpace;return t}
function annulus(outer,inner,height,mat,parent,y){const shape=new THREE.Shape();shape.absarc(0,0,outer,0,Math.PI*2,false);const hole=new THREE.Path();hole.absarc(0,0,inner,0,Math.PI*2,true);shape.holes.push(hole);const g=new THREE.ExtrudeGeometry(shape,{depth:height,steps:1,bevelEnabled:true,bevelSegments:3,bevelSize:.012,bevelThickness:.012,curveSegments:96});g.rotateX(-Math.PI/2);return mesh(g,mat,parent,0,y,0)}

function addOreMaterial(material,geometry,reveal,transition=null){
 geometry.computeBoundingBox();const box=geometry.boundingBox,size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
 material.onBeforeCompile=shader=>{
  if(transition){shader.uniforms.oreShape=transition.shape;shader.uniforms.oreSurface=transition.surface;shader.vertexShader="attribute vec3 ingotPosition;attribute vec3 ingotNormal;uniform float oreShape;\n"+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace("#include <beginnormal_vertex>","#include <beginnormal_vertex>\nobjectNormal=normalize(mix(ingotNormal,objectNormal,oreShape));");}
  shader.uniforms.oreCenter={value:center};shader.uniforms.oreSize={value:size};shader.uniforms.oreEmergence=reveal;
  shader.vertexShader='varying vec3 vOre;uniform vec3 oreCenter;uniform vec3 oreSize;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvOre=(position-oreCenter)/oreSize;'+(transition?'\ntransformed=mix(ingotPosition,position,oreShape);':'' ));
  shader.fragmentShader=(transition?'uniform float oreSurface;\n':'')+`varying vec3 vOre;uniform float oreEmergence;
  float oh(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
  float on(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(oh(i),oh(i+vec3(1,0,0)),f.x),mix(oh(i+vec3(0,1,0)),oh(i+vec3(1,1,0)),f.x),f.y),mix(mix(oh(i+vec3(0,0,1)),oh(i+vec3(1,0,1)),f.x),mix(oh(i+vec3(0,1,1)),oh(i+vec3(1,1,1)),f.x),f.y),f.z);}
  `+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
  if(vOre.y>oreEmergence+on(vOre*24.)*.025)discard;
  float surfaceReveal=${transition?'smoothstep(.0,.065,oreSurface-(vOre.x*.50+vOre.y*.20+.38))':'1.'};
  float coarse=on(vOre*7.5),grain=on(vOre*95.);
  float oreWarp=coarse*.13+on(vOre*24.)*.042+on(vOre*77.)*.009;
  float seamA=abs(vOre.x*.64+vOre.y*.23-vOre.z*.16+oreWarp-.08);
  float seamB=abs(vOre.z*.7-vOre.x*.22+vOre.y*.28+oreWarp+.12);
  float vein=1.-smoothstep(.004,.025,min(seamA,seamB));
  float quartz=vein*smoothstep(.35,.60,on(vOre*19.));
  float oreMask=(1.-smoothstep(.001,.006,min(seamA,seamB)))*smoothstep(.48,.72,on(vOre*65.));
  oreMask=max(oreMask,smoothstep(.91,.98,on(vOre*155.))*vein*.65);
  vec3 mineralTint=mix(vec3(.76,.72,.65),vec3(1.02,.97,.87),coarse);
  diffuseColor.rgb=max(vec3(0.),(diffuseColor.rgb-.12)*1.12+.12);
  diffuseColor.rgb*=mineralTint*(.88+grain*.22);
  diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.38,.36,.30),quartz*.28);
  diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.54,.31,.065)*(.7+on(vOre*160.)*.55),oreMask);
  diffuseColor.rgb=mix(vec3(.58,.35,.09),diffuseColor.rgb,surfaceReveal);`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
  normal=normalize(mix(nonPerturbedNormal,normal,surfaceReveal));
  float microRelief=(on(vOre*170.)*.00038+on(vOre*65.)*.00024)*surfaceReveal;
  vec3 oq0=dFdx(vViewPosition),oq1=dFdy(vViewPosition);vec3 os0=cross(oq1,normal),os1=cross(normal,oq0);
  float odet=dot(oq0,os0);normal=normalize(abs(odet)*normal-sign(odet)*(dFdx(microRelief)*os0+dFdy(microRelief)*os1));`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(.28,mix(max(roughnessFactor,.89),.43,oreMask),surfaceReveal);');
  shader.fragmentShader=shader.fragmentShader.replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=mix(1.,mix(metalnessFactor,.98,oreMask),surfaceReveal);');
 };
 material.customProgramCacheKey=()=>`origin-ore-natural-${size.x.toFixed(4)}-${!!transition}`;material.needsUpdate=true;
}

export function createCraftScenes({world,renderer,pmrem,gold,rawStone,sourceRing}){
 const cast=new THREE.Group(),ingot=new THREE.Group(),ore=new THREE.Group();world.add(cast,ingot,ore);
 const oreReveal={value:-.7},oreTransition={shape:{value:0},surface:{value:0}};let primaryOre;
 const textureLoader=new THREE.TextureLoader();const scratch=texturedNoise();
 const darkSteel=new THREE.MeshStandardMaterial({color:0x35332e,metalness:.85,roughness:.55,bumpMap:scratch,bumpScale:.004,envMapIntensity:.7});
 const liquid=new THREE.MeshPhysicalMaterial({color:0xffb454,metalness:.65,roughness:.23,envMapIntensity:.65,emissive:0xff550a,emissiveIntensity:.85});
 const flask=new THREE.Group();cast.add(flask);flask.position.set(0,-.48,0);
 // A close-fitting split mould follows the shank, sprue and six prongs.
 const shellMaterial=new THREE.MeshPhysicalMaterial({color:0xd6e3e9,metalness:.03,roughness:.27,clearcoat:.35,clearcoatRoughness:.23,envMapIntensity:.8,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});
 shellMaterial.onBeforeCompile=shader=>{
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`float shellFresnel=pow(1.-abs(dot(normalize(normal),normalize(vViewPosition))),2.);
   diffuseColor.a*=.32+shellFresnel*.85;
   #include <opaque_fragment>`);
 };
 shellMaterial.customProgramCacheKey=()=> 'origin-contour-mould';
 const mould=new THREE.Group();flask.add(mould);
 mesh(new THREE.TorusGeometry(.38,.063,32,192),shellMaterial,mould,.04,-.12,.50);
 const feedPoints=[V(0,.75,.50),V(-.45,.38,.50),V(-.49,-.32,.50),V(-.40,-.52,.50),V(.04,-.50,.50)];
 pipe(feedPoints,.057,shellMaterial,mould);
 const funnel=mesh(new THREE.CylinderGeometry(.09,.057,.13,64,1,true),shellMaterial,mould,0,.755,.50);
 const seamMaterialMould=new THREE.MeshStandardMaterial({color:0xc7c6b9,metalness:.65,roughness:.4,transparent:true,opacity:0,depthWrite:false});
 const partingSeam=new THREE.Group();flask.add(partingSeam);
 for(const radius of [.443,.317])mesh(new THREE.TorusGeometry(radius,.0018,6,192),seamMaterialMould,partingSeam,.04,-.12,.50);
 pipe(feedPoints.map(p=>p.clone().add(V(0,0,.057))),.0017,seamMaterialMould,partingSeam);
 // The basket is hollow: every claw has the same wax / cavity / metal stages.
 const prongPaths=[];
 for(let i=0;i<6;i++){
  const a=i/6*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
  const points=[V(.04+c*.062,.225,.50+s*.062),V(.04+c*.115,.32,.50+s*.115),V(.04+c*.156,.435,.50+s*.156),V(.04+c*.143,.475,.50+s*.143)];
  prongPaths.push(points);pipe(points,.026,shellMaterial,mould);
  pipe(points.map(p=>p.clone().add(V(0,0,.026))),.0013,seamMaterialMould,partingSeam);
 }
 const shoulderPaths=[-1,1].map(side=>[V(.04+side*.255,.16,.50),V(.04+side*.21,.25,.50),V(.04+side*.125,.32,.50)]);
 for(const points of shoulderPaths){pipe(points,.030,shellMaterial,mould);pipe(points.map(p=>p.clone().add(V(0,0,.030))),.0013,seamMaterialMould,partingSeam);}
 for(const points of prongPaths)mesh(new THREE.SphereGeometry(.026,12,12),shellMaterial,mould,...points.at(-1).toArray());
 const basketShell=mesh(new THREE.TorusGeometry(.115,.024,16,96),shellMaterial,mould,.04,.32,.50);basketShell.rotation.x=Math.PI/2;
 mould.traverse(o=>{if(o.isMesh){o.renderOrder=8;o.castShadow=false;}});
 partingSeam.traverse(o=>{if(o.isMesh){o.renderOrder=9;o.castShadow=false;}});
 const waxLevel={value:.90};
 function waxMaterial(offset=0){
  const material=new THREE.MeshPhysicalMaterial({color:0x397763,metalness:0,roughness:.29,clearcoat:.18,clearcoatRoughness:.42,envMapIntensity:.85,transparent:true,opacity:0,emissive:0x000000});
  material.onBeforeCompile=shader=>{
   shader.uniforms.waxLevel=waxLevel;
   shader.vertexShader='varying vec3 vWax;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\nvWax=position+vec3(0.,${offset.toFixed(3)},0.);`);
   shader.fragmentShader='varying vec3 vWax;uniform float waxLevel;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
    float burnEdge=waxLevel+.008*sin(vWax.x*67.+vWax.y*21.);
    if(vWax.y>burnEdge)discard;`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
    float ember=exp(-pow((vWax.y-burnEdge)*105.,2.));
    totalEmissiveRadiance+=vec3(1.7,.26,.025)*ember;`);
  };
  material.customProgramCacheKey=()=> 'origin-burnout-'+offset;return material;
 }
 const waxRingMaterial=waxMaterial(-.12),waxFeedMaterial=waxMaterial();
 const waxRing=mesh(new THREE.TorusGeometry(.38,.043,28,192),waxRingMaterial,flask,.04,-.12,.50);
 const waxRunner=pipe(feedPoints,.037,waxFeedMaterial,flask);
 const waxBasket=new THREE.Group();flask.add(waxBasket);
 for(const points of prongPaths){pipe(points,.014,waxFeedMaterial,waxBasket);mesh(new THREE.SphereGeometry(.014,12,12),waxFeedMaterial,waxBasket,...points.at(-1).toArray());}
 for(const points of shoulderPaths)pipe(points,.018,waxFeedMaterial,waxBasket);
 const waxFunnel=mesh(new THREE.CylinderGeometry(.075,.037,.13,24,1),waxMaterial(.755),waxBasket,0,.755,.50);
 const waxCollar=mesh(new THREE.TorusGeometry(.115,.013,16,96).rotateX(Math.PI/2),waxMaterial(.32),waxBasket,.04,.32,.50);
 // Morph the original ring into these targets before handing visibility to wax.
 const transferMeshes=[];
 if(sourceRing){
  const scale=.38/1.12;
  const ringPoint=p=>V((p.x-.04)/scale,(p.y+.12)/scale-.2,(p.z-.50)/scale);
  function morphTo(object,target,arc=null){
   object.updateMatrix();target.applyMatrix4(object.matrix.clone().invert());
   const geometry=object.geometry;geometry.morphAttributes.position=[target.attributes.position];geometry.morphAttributes.normal=[target.attributes.normal];
   if(arc){const bend=geometry.clone(),positions=bend.attributes.position,original=geometry.attributes.position;for(let i=0;i<positions.count;i++)positions.setX(i,original.getX(i)-arc(i,original));geometry.morphAttributes.position.push(positions);geometry.morphAttributes.normal.push(geometry.attributes.normal.clone());}
   object.updateMorphTargets();transferMeshes.push(object);
  }
  const shank=sourceRing.band.geometry.clone(),positions=shank.attributes.position;
  for(let i=0;i<=192;i++)for(let j=0;j<=24;j++){
   const a=i/192*Math.PI*2,b=j/24*Math.PI*2,r=1.12+Math.cos(b)*(.043/scale);
   positions.setXYZ(i*25+j,Math.cos(a)*r,Math.sin(a)*r-.2,Math.sin(b)*(.043/scale));
  }
  shank.computeVertexNormals();morphTo(sourceRing.band,shank);
  prongPaths.forEach((points,i)=>{
   morphTo(sourceRing.claws[i],new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(ringPoint)),48,.014/scale,10,false));
   const tip=ringPoint(points.at(-1));morphTo(sourceRing.tips[i],new THREE.SphereGeometry(.014/scale,12,12).translate(tip.x,tip.y,tip.z));
  });
  shoulderPaths.forEach((points,i)=>morphTo(sourceRing.shoulders[i],new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(ringPoint)),48,.018/scale,10,false)));
  const collarPoint=ringPoint(V(.04,.32,.50));morphTo(sourceRing.girdle,new THREE.TorusGeometry(.115/scale,.013/scale,10,64).rotateX(Math.PI/2).translate(collarPoint.x,collarPoint.y,collarPoint.z));
  const channelCurve=new THREE.CatmullRomCurve3(feedPoints.map(ringPoint)),frames=channelCurve.computeFrenetFrames(80,false);
  const runner=sourceRing.stem.geometry.clone(),rp=runner.attributes.position;
  for(let i=0;i<rp.count;i++){
   const x=rp.getX(i),y=rp.getY(i),z=rp.getZ(i),u=THREE.MathUtils.clamp((.4-y)/.8,0,1),t=1-u,index=Math.round(t*80),radius=lerp(.09,.15,u),center=channelCurve.getPointAt(t);
   center.addScaledVector(frames.normals[index],x/radius*.037/scale).addScaledVector(frames.binormals[index],z/radius*.037/scale);rp.setXYZ(i,center.x,center.y,center.z);
  }
  runner.computeVertexNormals();morphTo(sourceRing.stem,runner,(i,p)=>2.3*THREE.MathUtils.clamp((.4-p.getY(i))/.8,0,1));
  const cone=sourceRing.funnel.geometry.clone(),cp=cone.attributes.position,uv=cone.attributes.uv,center=ringPoint(V(0,.755,.50));
  for(let i=0;i<cp.count;i++){
   const x=cp.getX(i),y=cp.getY(i),z=cp.getZ(i),h=THREE.MathUtils.clamp((y+.175)/.35,0,1),r=Math.hypot(x,z),angle=r>.0000001?Math.atan2(x,z):uv.getX(i)*Math.PI*2;
   const radius=(r<.0000001?0:lerp(.037,.075,h)/scale);cp.setXYZ(i,center.x+Math.sin(angle)*radius,center.y+(h-.5)*.13/scale,center.z+Math.cos(angle)*radius);
  }
  cone.computeVertexNormals();morphTo(sourceRing.funnel,cone,()=>2.3);
 }
 const smokeMapCanvas=document.createElement('canvas');smokeMapCanvas.width=smokeMapCanvas.height=64;const smokeContext=smokeMapCanvas.getContext('2d'),smokeGradient=smokeContext.createRadialGradient(32,32,0,32,32,32);smokeGradient.addColorStop(0,'#c6ccd255');smokeGradient.addColorStop(.35,'#c6ccd226');smokeGradient.addColorStop(1,'#c6ccd200');smokeContext.fillStyle=smokeGradient;smokeContext.fillRect(0,0,64,64);
 const smokePositions=new Float32Array(18*3),smokeGeometry=new THREE.BufferGeometry();smokeGeometry.setAttribute('position',new THREE.BufferAttribute(smokePositions,3));
 const smokeMaterial=new THREE.PointsMaterial({map:new THREE.CanvasTexture(smokeMapCanvas),color:0xc6ccd2,size:.16,transparent:true,opacity:0,depthWrite:false});
 const smoke=new THREE.Points(smokeGeometry,smokeMaterial);smoke.frustumCulled=false;cast.add(smoke);
 function flowingMaterial(axis){
  const material=liquid.clone();const uniforms={head:{value:0},tail:{value:0},phase:{value:0}};
  material.onBeforeCompile=shader=>{
   shader.uniforms.flowHead=uniforms.head;shader.uniforms.flowTail=uniforms.tail;shader.uniforms.flowPhase=uniforms.phase;
   shader.vertexShader='varying float vFlow;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\nvFlow=${axis==='height'?'position.y':'uv.x'};`);
   shader.fragmentShader='varying float vFlow;uniform float flowHead;uniform float flowTail;uniform float flowPhase;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(vFlow>flowHead||vFlow<flowTail)discard;');
   shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nfloat flowSheen=.5+.5*sin(vFlow*85.-flowPhase);totalEmissiveRadiance*=.88+flowSheen*.20;');
  };
  material.customProgramCacheKey=()=>`flow-${axis}`;
  return {material,uniforms};
 }
 const ringFlow=flowingMaterial('height'),prongFlow=flowingMaterial('height'),feedFlow=flowingMaterial('path'),outsideFlow=flowingMaterial('path');
 ringFlow.uniforms.tail.value=-1;
 const castRing=mesh(new THREE.TorusGeometry(.38,.043,28,192),ringFlow.material,flask,.04,-.12,.50);
 const filledRunner=pipe(feedPoints,.038,feedFlow.material,flask);filledRunner.position.z=0;
 const filledBasket=new THREE.Group();flask.add(filledBasket);
 for(const points of prongPaths){pipe(points,.014,prongFlow.material,filledBasket);mesh(new THREE.SphereGeometry(.014,12,12),prongFlow.material,filledBasket,...points.at(-1).toArray());}
 for(const points of shoulderPaths)pipe(points,.018,prongFlow.material,filledBasket);
 const collarFlow=flowingMaterial('height');collarFlow.uniforms.tail.value=-1;
 const castCollar=mesh(new THREE.TorusGeometry(.115,.013,16,96).rotateX(Math.PI/2),collarFlow.material,filledBasket,.04,.32,.50);
 const menisci=[-1,1].map(()=>{const m=mesh(new THREE.SphereGeometry(.052,20,16),liquid,flask);m.scale.set(1,.24,1);return m});

 feedFlow.material.transparent=true;
 // Abstract pouring head, deliberately reduced to a small drop of polished metal.
 const crucible=new THREE.Group();cast.add(crucible);
 const nozzleMaterial=new THREE.MeshPhysicalMaterial({color:0xbab6ab,metalness:1,roughness:.2,envMapIntensity:1.1,transparent:true,opacity:0});
 const profile=[[0,-.15],[.038,-.11],[.11,.025],[.115,.10],[.09,.14],[0,.145]].map(([x,y])=>new THREE.Vector2(x,y));
 mesh(new THREE.LatheGeometry(profile,80),nozzleMaterial,crucible);
 const nozzleSeam=mesh(new THREE.TorusGeometry(.113,.003,8,80),darkSteel,crucible,0,.083,0);nozzleSeam.rotation.x=Math.PI/2;
 const streamCurve=new THREE.CatmullRomCurve3([V(0,1.32,.50),V(.005,1.02,.50),V(-.003,.62,.50),V(0,.31,.50)]);
 const streamGeo=new THREE.TubeGeometry(streamCurve,110,.025,24,false);const stream=mesh(streamGeo,outsideFlow.material,cast);const originalStream=streamGeo.attributes.position.array.slice();
 const pool=mesh(new THREE.CircleGeometry(.095,80),liquid,flask,0,.792,.50);pool.rotation.x=-Math.PI/2;
 const ripples=[];for(let i=0;i<3;i++){const ripple=mesh(new THREE.TorusGeometry(.025+i*.023,.002,8,64),liquid,flask,0,.795+i*.0005,.50);ripple.rotation.x=Math.PI/2;ripples.push(ripple)}
 const droplets=[];for(let i=0;i<5;i++){const d=mesh(new THREE.SphereGeometry(.011+(i%3)*.004,12,10),liquid,cast);droplets.push(d)}
 const heat=new THREE.PointLight(0xffa744,2.2,3);heat.position.set(0,.15,.50);cast.add(heat);
 // Cast ingot: tapered, rounded edges, a lightly rippled cooling surface and an impressed mark.
 const ingotGeo=new RoundedBoxGeometry(2.25,.43,1.02,12,.085);const ip=ingotGeo.attributes.position;
 for(let i=0;i<ip.count;i++){const y=ip.getY(i),x=ip.getX(i),z=ip.getZ(i);const topness=smooth(.04,.22,y);const taper=1-topness*.025;ip.setXYZ(i,x*taper,y+topness*(Math.sin(x*10+z*6)*.003+Math.sin(x*29-z*14)*.0016),z*taper)}ingotGeo.computeVertexNormals();
 const sideGold=new THREE.MeshPhysicalMaterial({color:0xd6a644,metalness:1,roughness:.26,bumpMap:scratch,bumpScale:.004,envMapIntensity:1.1});
 const topGold=new THREE.MeshPhysicalMaterial({map:stampTexture(true),bumpMap:stampTexture(false),bumpScale:.011,metalness:1,roughness:.47,envMapIntensity:.7});
 const stampReveal={value:0},stampBase={value:new THREE.Color(0xc99b38)};
 topGold.onBeforeCompile=shader=>{
  shader.uniforms.stampReveal=stampReveal;shader.uniforms.stampBase=stampBase;
  shader.fragmentShader='uniform float stampReveal;uniform vec3 stampBase;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb=mix(stampBase,diffuseColor.rgb,stampReveal);');
 };
 topGold.customProgramCacheKey=()=> 'origin-progressive-ingot-stamp';
 const bar=mesh(ingotGeo,[sideGold,sideGold,topGold,sideGold,sideGold,sideGold],ingot,-.28,-.975,0);bar.rotation.y=-.18;
 // Subdivide the actual finished ingot, preserving every face's UVs and normals.
 const ingotSurface=ingotGeo.index?ingotGeo.toNonIndexed():ingotGeo;
 const tessellator=new TessellateModifier(.085,8),faces=[];
 for(const group of ingotSurface.groups){
  const face=new THREE.BufferGeometry();
  for(const name of ['position','normal','uv']){
   const attribute=ingotSurface.attributes[name],values=attribute.array.slice(group.start*attribute.itemSize,(group.start+group.count)*attribute.itemSize);
   face.setAttribute(name,new THREE.BufferAttribute(values,attribute.itemSize));
  }
  faces.push(tessellator.modify(face));face.dispose();
 }
 const bridgeGeometry=mergeGeometries(faces,true);faces.forEach(face=>face.dispose());
 const bp=bridgeGeometry.attributes.position,bridgeTarget=bp.array.slice(),bridgeNormals=bridgeGeometry.attributes.normal.array.slice(),bridgeOrigin=new Float32Array(bridgeTarget.length);
 for(let i=0;i<bp.count;i++)V(bp.getX(i)/1.125,bp.getY(i)/.215,bp.getZ(i)/.51).normalize().multiplyScalar(.16).toArray(bridgeOrigin,i*3);
 bar.geometry=bridgeGeometry;bar.frustumCulled=false;ingotGeo.dispose();
 const velvetNoise=new Uint8Array(128*128*4);let velvetSeed=71;
 for(let i=0;i<velvetNoise.length;i+=4){velvetSeed=(velvetSeed*16807)%2147483647;const n=90+velvetSeed%80;velvetNoise[i]=velvetNoise[i+1]=velvetNoise[i+2]=n;velvetNoise[i+3]=255;}
 const velvetTexture=new THREE.DataTexture(velvetNoise,128,128,THREE.RGBAFormat);velvetTexture.wrapS=velvetTexture.wrapT=THREE.RepeatWrapping;velvetTexture.repeat.set(18,11);velvetTexture.magFilter=THREE.LinearFilter;velvetTexture.needsUpdate=true;
 const standMaterial=new THREE.MeshPhysicalMaterial({color:0x64192f,metalness:0,roughness:.96,sheen:1,sheenColor:0x9b465c,sheenRoughness:.78,bumpMap:velvetTexture,bumpScale:.0018,envMap:pmrem.fromScene(new THREE.Scene()).texture,envMapIntensity:0,transparent:true});
 // Two inflated fabric surfaces meet at a pinched perimeter seam.
 const cushionResolution=80,cushionSide=cushionResolution+1,cushionLayer=cushionSide*cushionSide;
 const cushionVertices=[],cushionUvs=[],cushionIndices=[],cushionSamples=[];
 function cushionPlan(u,v){return [1.825*u*(1-.065*Math.pow(Math.abs(v),8)),.95*v*(1-.085*Math.pow(Math.abs(u),8))];}
 for(let layer=0;layer<2;layer++)for(let j=0;j<=cushionResolution;j++)for(let i=0;i<=cushionResolution;i++){
  const u=i/cushionResolution*2-1,v=j/cushionResolution*2-1,[x,z]=cushionPlan(u,v),loft=Math.pow(Math.max(0,(1-u*u)*(1-v*v)),.43);
  cushionVertices.push(x,layer===0?.025+.50*loft:-.025-.22*loft,z);cushionUvs.push((u+1)/2,(v+1)/2);
  if(layer===0)cushionSamples.push({x,z,y:.025+.50*loft,loft});
 }
 for(let layer=0;layer<2;layer++)for(let j=0;j<cushionResolution;j++)for(let i=0;i<cushionResolution;i++){
  const a=layer*cushionLayer+j*cushionSide+i,b=a+1,c=a+cushionSide,d=c+1;
  if(layer===0)cushionIndices.push(a,c,b,b,c,d);else cushionIndices.push(a,b,c,b,d,c);
 }
 const cushionBoundary=[];
 for(let i=0;i<cushionResolution;i++)cushionBoundary.push(i);
 for(let j=0;j<cushionResolution;j++)cushionBoundary.push(j*cushionSide+cushionResolution);
 for(let i=cushionResolution;i>0;i--)cushionBoundary.push(cushionResolution*cushionSide+i);
 for(let j=cushionResolution;j>0;j--)cushionBoundary.push(j*cushionSide);
 for(let i=0;i<cushionBoundary.length;i++){const a=cushionBoundary[i],b=cushionBoundary[(i+1)%cushionBoundary.length];cushionIndices.push(a,b,a+cushionLayer,b,b+cushionLayer,a+cushionLayer);}
 const cushionGeometry=new THREE.BufferGeometry();cushionGeometry.setAttribute('position',new THREE.Float32BufferAttribute(cushionVertices,3));cushionGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(cushionUvs,2));cushionGeometry.setIndex(cushionIndices);cushionGeometry.computeVertexNormals();
 const cushionPositions=cushionGeometry.attributes.position;
 const ingotStand=mesh(cushionGeometry,standMaterial,ingot,.25,-1.50,.16);ingotStand.frustumCulled=false;
 const seamPoints=cushionBoundary.filter((_,i)=>i%4===0).map(i=>V(cushionVertices[i*3],0,cushionVertices[i*3+2]));
 const seamMaterial=new THREE.MeshStandardMaterial({color:0x7c2a42,roughness:1,envMap:standMaterial.envMap,envMapIntensity:0,transparent:true});
 const cushionSeam=mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(seamPoints,true),320,.005,6,true),seamMaterial,ingotStand);cushionSeam.castShadow=false;
 function deformCushion(barPress,gemPress,barOffset,gemOffset,gemSeatX,gemSeatZ){
  for(let i=0;i<cushionSamples.length;i++){
   const {x,z,y,loft}=cushionSamples[i],dx=x+.53,dz=z+.16,bx=Math.cos(.18)*dx+Math.sin(.18)*dz,bz=-Math.sin(.18)*dx+Math.cos(.18)*dz;
   const footprint=Math.max(Math.abs(bx)/1.13,Math.abs(bz)/.51),barMask=Math.exp(-Math.pow(bx/1.10,10)-Math.pow(bz/.49,10));
   const gemRadius=Math.hypot((x-gemSeatX)/.25,(z-gemSeatZ)/.24),gemMask=Math.exp(-gemRadius*gemRadius*1.6);
   const barDent=barPress*barMask*Math.max(0,y-(.31+barOffset)),gemDent=gemPress*gemMask*Math.max(0,y-(.255+gemOffset));
   const collar=.027*barPress*Math.exp(-Math.pow((footprint-1.08)*6.,2.))+.023*gemPress*Math.exp(-Math.pow((gemRadius-1.1)*3.5,2.));
   const wrinkles=.005*Math.sin(bx*43+bz*19)*barPress*Math.exp(-Math.pow((footprint-1.1)*4.,2.));
   cushionPositions.setY(i,Math.max(.025,y-barDent-gemDent+(collar+wrinkles)*loft));
  }
  cushionPositions.needsUpdate=true;cushionGeometry.computeVertexNormals();
 }
 const crumbs=[];for(let i=0;i<6;i++){const t=i*2.399;const g=mesh(new THREE.DodecahedronGeometry(.025+(i%3)*.009,1),sideGold,ingot,-.2+Math.cos(t)*1.1,-1.18,.1+Math.sin(t)*.6);g.scale.set(1.4,.6,1);crumbs.push(g)}
 const shadow=mesh(new THREE.PlaneGeometry(8,7),new THREE.ShadowMaterial({opacity:.035}),world,0,-1.36,0);shadow.rotation.x=-Math.PI/2;shadow.castShadow=false;
 const sandUniforms={settle:{value:0},opacity:{value:0},gemX:{value:-1.72}};
 const sandGeometry=new THREE.PlaneGeometry(10,8,256,208);sandGeometry.rotateX(-Math.PI/2);
 const sandPositions=sandGeometry.attributes.position;
 for(let i=0;i<sandPositions.count;i++){const x=sandPositions.getX(i),z=sandPositions.getZ(i);sandPositions.setY(i,.0035*Math.sin(x*3.1+Math.sin(z*1.9))+.0018*Math.sin(z*6.3+x*.7));}
 sandGeometry.computeVertexNormals();
 const sandMaterial=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.94,envMap:pmrem.fromScene(new THREE.Scene()).texture,envMapIntensity:0,transparent:true,depthWrite:true});
 sandMaterial.onBeforeCompile=shader=>{
  shader.uniforms.sandSettle=sandUniforms.settle;shader.uniforms.sandOpacity=sandUniforms.opacity;shader.uniforms.sandGemX=sandUniforms.gemX;
  shader.vertexShader='varying vec2 vSand;uniform float sandSettle;uniform float sandGemX;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vSand=position.xz;
   float footprint=length((position.xz-vec2(-.12,.1))/vec2(1.22,.79));
   float lip=exp(-pow((footprint-1.02)*9.,2.))*.032*(.7+.3*sin(position.x*12.+position.z*8.));
   float gemFoot=length((position.xz-vec2(sandGemX,.90))/vec2(.27,.23));
   float gemLip=exp(-pow((gemFoot-1.)*6.,2.))*.018;
   transformed.y+=sandSettle*(lip-exp(-footprint*footprint*3.)*.035+gemLip);`);
  shader.fragmentShader=`varying vec2 vSand;uniform float sandOpacity;uniform float sandSettle;uniform float sandGemX;
   float sandHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float sandGrain(vec2 p){vec2 c=floor(p),f=fract(p);vec2 center=vec2(sandHash(c),sandHash(c+vec2(19.7,8.1)))*.48+.26;vec2 d=f-center;return exp(-dot(d,d)*(7.+sandHash(c+12.)*8.));}
   \n`+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float sandIdentity=sandHash(floor(vSand*78.));
   float granule=sandGrain(vSand*78.);
   diffuseColor.rgb*=vec3(3.0,2.85,2.4)*mix(.83,1.12,sandIdentity);
   diffuseColor.rgb*=1.-smoothstep(.975,1.,sandIdentity)*granule*.28;
   float oreFoot=length((vSand-vec2(-.12,.10))/vec2(1.19,.76));
   float diamondFoot=length((vSand-vec2(sandGemX,.90))/vec2(.26,.23));
   diffuseColor.rgb*=1.-sandSettle*(exp(-oreFoot*oreFoot*3.4)*.15+exp(-diamondFoot*diamondFoot*2.8)*.13);
   float perimeter=length(vSand/vec2(4.5,3.5));
   diffuseColor.a*=sandOpacity*(1.-smoothstep(.57,1.,perimeter));`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   float microSand=sandGrain(vSand*78.)*.00105+sandGrain(vSand*137.+vec2(14.2,7.8))*.00034;
   vec3 sq0=dFdx(vViewPosition),sq1=dFdy(vViewPosition),ss0=cross(sq1,normal),ss1=cross(normal,sq0);
   float sdet=dot(sq0,ss0);normal=normalize(abs(sdet)*normal-sign(sdet)*(dFdx(microSand)*ss0+dFdy(microSand)*ss1));`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(.96,.78,smoothstep(.965,1.,sandIdentity));');
 };
 const sand=mesh(sandGeometry,sandMaterial,world,0,-1.355,0);sand.castShadow=false;sand.receiveShadow=false;sand.renderOrder=1;
 const contactCanvas=document.createElement('canvas');contactCanvas.width=contactCanvas.height=128;const contactContext=contactCanvas.getContext('2d');
 const contactGradient=contactContext.createRadialGradient(64,64,8,64,64,64);contactGradient.addColorStop(0,'#302719a6');contactGradient.addColorStop(.58,'#46372465');contactGradient.addColorStop(1,'#46372400');contactContext.fillStyle=contactGradient;contactContext.fillRect(0,0,128,128);
 const contactMaterial=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(contactCanvas),transparent:true,depthWrite:false,opacity:0});
 const contact=mesh(new THREE.PlaneGeometry(3.25,2.25),contactMaterial,world,-.12,-1.315,.1);contact.rotation.x=-Math.PI/2;contact.castShadow=contact.receiveShadow=false;contact.renderOrder=2;
 const gemContact=mesh(new THREE.PlaneGeometry(.85,.68),contactMaterial.clone(),world,-1.72,-1.315,.90);gemContact.rotation.x=-Math.PI/2;gemContact.castShadow=gemContact.receiveShadow=false;gemContact.renderOrder=2;
 const gritMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.91,envMap:sandMaterial.envMap,envMapIntensity:0});
 let seed=427;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
 const grit=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),gritMat,2400);world.add(grit);grit.castShadow=grit.receiveShadow=false;
 const grainPose=new THREE.Object3D(),grainColor=new THREE.Color(),grainPalette=['#c7b08b','#d8c6a6','#ab926c','#e1d5b8','#8b785d','#baa17b'];
 for(let i=0;i<2400;i++){
  const a=rnd()*Math.PI*2,r=Math.sqrt(rnd()),x=Math.cos(a)*r*3.2,z=Math.sin(a)*r*2.2;
  const relief=.0035*Math.sin(x*3.1+Math.sin(z*1.9))+.0018*Math.sin(z*6.3+x*.7),radius=.0028+Math.pow(rnd(),3)*.008;
  grainPose.position.set(x,-1.351+relief,z);grainPose.rotation.set(rnd()*2,rnd()*6.28,rnd()*2);grainPose.scale.set(radius*(.8+rnd()*.8),radius*.45,radius*(.65+rnd()*.8));grainPose.updateMatrix();grit.setMatrixAt(i,grainPose.matrix);grit.setColorAt(i,grainColor.set(grainPalette[Math.floor(rnd()*grainPalette.length)]));
 }
 grit.instanceMatrix.needsUpdate=true;grit.instanceColor.needsUpdate=true;
 let environment=null,oreGem=V(.75,.3,.35);
 const ready=(async()=>{
  const sandMaps=await Promise.all(['Diffuse','nor_gl','Rough','Displacement'].map(name=>textureLoader.loadAsync(`assets/pbr/sand/${name}.jpg`)));
  sandMaps.forEach(t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,2.4);t.anisotropy=renderer.capabilities.getMaxAnisotropy();});sandMaps[0].colorSpace=THREE.SRGBColorSpace;
  sandMaterial.map=sandMaps[0];sandMaterial.normalMap=sandMaps[1];sandMaterial.normalScale.set(.82,.82);sandMaterial.roughnessMap=sandMaps[2];sandMaterial.displacementMap=sandMaps[3];sandMaterial.displacementScale=.012;sandMaterial.displacementBias=-.006;sandMaterial.needsUpdate=true;
  const hdr=await new RGBELoader().loadAsync('assets/pbr/studio.hdr');environment=pmrem.fromEquirectangular(hdr).texture;hdr.dispose();
  const loader=new GLTFLoader();const scan=await loader.loadAsync('assets/pbr/rock_07/rock_07.gltf');
  const root=scan.scene;const bounds=new THREE.Box3().setFromObject(root),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());const s=2.9/Math.max(size.x,size.y,size.z);
  root.traverse(o=>{if(o.isMesh){o.geometry=o.geometry.clone();o.geometry.translate(-center.x,-center.y,-center.z);o.geometry.scale(s,s,s);o.material=o.material.clone();o.material.color.set('#e9e4db');o.material.envMapIntensity=.22;o.material.normalScale.set(1.04,1.04);for(const t of [o.material.map,o.material.normalMap,o.material.roughnessMap])if(t)t.anisotropy=renderer.capabilities.getMaxAnisotropy();o.material.vertexColors=false;if(o.material.metalnessMap){o.material.aoMap=o.material.metalnessMap;o.material.aoMapIntensity=1.05}primaryOre=o;o.material.transparent=true;addOreMaterial(o.material,o.geometry,oreReveal,oreTransition);o.castShadow=o.receiveShadow=true;o.frustumCulled=false;}});
  root.position.set(-.12,0,0);root.rotation.set(0,.5,0);const groundedBox=new THREE.Box3().setFromObject(root);root.position.y=-1.35-groundedBox.min.y;ore.add(root);
  // A single scanned mesh changes shape; no second textured object intersects it.
  root.updateMatrix();const inverseRoot=root.matrix.clone().invert();
  const original=primaryOre.geometry.attributes.position,normals=primaryOre.geometry.attributes.normal;
  const startPositions=new Float32Array(original.count*3),startNormals=new Float32Array(original.count*3);
  const boundsCenter=primaryOre.geometry.boundingBox.getCenter(new THREE.Vector3()),halfSize=primaryOre.geometry.boundingBox.getSize(new THREE.Vector3()).multiplyScalar(.5);
  const normalMatrix=new THREE.Matrix3().getNormalMatrix(inverseRoot),morphDirection=V(0,0,0),point=V(0,0,0);
  for(let i=0;i<original.count;i++){
   morphDirection.fromBufferAttribute(original,i).sub(boundsCenter).divide(halfSize).normalize();
   const radius=.065,stretch=Math.max(Math.abs(morphDirection.x)/(1.125-radius),Math.abs(morphDirection.y)/(.215-radius),Math.abs(morphDirection.z)/(.51-radius));
   point.copy(morphDirection).divideScalar(Math.max(stretch,.001)).addScaledVector(morphDirection,radius).applyAxisAngle(V(0,1,0),-.18).add(V(-.28,-.975,0)).applyMatrix4(inverseRoot);point.toArray(startPositions,i*3);
   const ax=Math.abs(morphDirection.x)/1.125,ay=Math.abs(morphDirection.y)/.215,az=Math.abs(morphDirection.z)/.51;
   point.set(ax>ay&&ax>az?Math.sign(morphDirection.x):0,ay>=ax&&ay>=az?Math.sign(morphDirection.y):0,az>ax&&az>ay?Math.sign(morphDirection.z):0).applyAxisAngle(V(0,1,0),-.18).applyMatrix3(normalMatrix).normalize().toArray(startNormals,i*3);
  }
  primaryOre.geometry.setAttribute('ingotPosition',new THREE.BufferAttribute(startPositions,3));primaryOre.geometry.setAttribute('ingotNormal',new THREE.BufferAttribute(startNormals,3));
  const second=(await loader.loadAsync('assets/pbr/rock_09/rock_09.gltf')).scene;const b2=new THREE.Box3().setFromObject(second),c2=b2.getCenter(new THREE.Vector3()),s2=1.1/b2.getSize(new THREE.Vector3()).length();second.traverse(o=>{if(o.isMesh){o.geometry=o.geometry.clone();o.geometry.translate(-c2.x,-c2.y,-c2.z);o.geometry.scale(s2,s2,s2);o.material=o.material.clone();o.material.color.set('#e0d9cd');o.material.envMapIntensity=.22;addOreMaterial(o.material,o.geometry,oreReveal);o.castShadow=o.receiveShadow=true;}});second.position.set(1.1,0,.6);const secondGround=new THREE.Box3().setFromObject(second);second.position.y=-1.35-secondGround.min.y;ore.add(second);
  // Detached fragments sit on the same ground plane as the parent specimen.
  for(const [x,z,scale,angle] of [[-.95,.78,.48,-.7],[.64,1.03,.32,1.2]]){
   const fragment=second.clone(true);fragment.position.set(x,0,z);fragment.scale.setScalar(scale);fragment.rotation.y=angle;
   fragment.updateMatrixWorld(true);const ground=new THREE.Box3().setFromObject(fragment);fragment.position.y=-1.35-ground.min.y;ore.add(fragment);
  }
  ore.children.forEach(specimen=>{specimen.userData.restScale=specimen.scale.clone();});
  const font=await new FontLoader().loadAsync('assets/pbr/engraving-font.json');
  const incised=new THREE.MeshPhysicalMaterial({color:0x8b641d,metalness:.85,roughness:.5,envMapIntensity:.5});
  for(const [text,size,z] of [['Au',.21,-.07],['ORIGIN',.055,.16]]){const geo=new TextGeometry(text,{font,size,depth:.001,curveSegments:8,bevelEnabled:false});geo.computeBoundingBox();const width=geo.boundingBox.max.x;const label=mesh(geo,incised,bar,-width*.5,.222,z);label.rotation.x=-Math.PI/2;label.castShadow=false;}
  // Place the uncut crystal into the scanned surface, rather than letting it float.
  world.updateMatrixWorld(true);const origin=ore.localToWorld(V(.65,3,.35));const direction=V(0,-1,0).transformDirection(ore.matrixWorld);const ray=new THREE.Raycaster(origin,direction);const hits=ray.intersectObject(root,true);if(hits.length){oreGem=ore.worldToLocal(hits[0].point.clone());oreGem.y+=.075;}
 })();
 function update(q,mobile=false){
  const inflate=smooth(.667,.718,q),barFall=THREE.MathUtils.clamp((q-.719)/.027,0,1),gemFall=THREE.MathUtils.clamp((q-.731)/.028,0,1);
  const barImpact=THREE.MathUtils.clamp((q-.746)/.030,0,1),gemImpact=THREE.MathUtils.clamp((q-.759)/.027,0,1);
  const barBounce=-.075*Math.sin(barImpact*Math.PI*2)*Math.exp(-barImpact*4),gemBounce=-.045*Math.sin(gemImpact*Math.PI*2)*Math.exp(-gemImpact*4);
  const barOffset=.60*smooth(.675,.715,q)*(1-barFall*barFall)+barBounce,gemOffset=.48*smooth(.677,.722,q)*(1-gemFall*gemFall)+gemBounce;
  const barPress=smooth(.739,.751,q),gemPress=smooth(.751,.764,q);
  const gemX=mobile?-1.05:-1.72;sandUniforms.gemX.value=gemX;gemContact.position.x=gemX;
  const release=smooth(.632,.652,q),morph=smooth(.652,.715,q),emerge=smooth(.806,.91,q);
  const casting=q>.37&&q<.67;
  cast.visible=casting;cast.traverse(object=>{if(object.isMesh)object.castShadow=q<.65&&!object.material.transparent;});cast.scale.setScalar(1+.055*smooth(.44,.49,q)*(1-smooth(.62,.65,q)));cast.rotation.set(0,lerp(.16+(q-.53)*.3,-.2,release),0);cast.position.y=0;
  const gather=smooth(.632,.650,q),castSize=lerp(1,.19,gather);
  flask.scale.setScalar(castSize);
  flask.position.set(.04*(1-castSize),-.60+.12*castSize,.50*(1-castSize));
  const transfer=smooth(.36,.46,q),waxTurn=smooth(.395,.46,q);
  for(const object of transferMeshes){object.morphTargetInfluences[0]=transfer;if(object.morphTargetInfluences.length>1)object.morphTargetInfluences[1]=Math.sin(transfer*Math.PI);}
  if(sourceRing){const material=sourceRing.metal;material.color.set(0xe8e9e8).lerp(waxRingMaterial.color,waxTurn);material.metalness=1-waxTurn;material.roughness=lerp(material.roughness,.29,waxTurn);material.envMapIntensity=lerp(1.9,.85,waxTurn);material.clearcoat=lerp(material.clearcoat,.18,waxTurn);material.clearcoatRoughness=lerp(.07,.42,waxTurn);material.bumpScale*=1-waxTurn;}
  const envelope=smooth(.46,.478,q)*(1-release),burnout=smooth(.468,.505,q);
  shellMaterial.opacity=envelope*.38;seamMaterialMould.opacity=envelope*.50;
  const waxPresence=1-smooth(.500,.508,q);waxRing.visible=waxRunner.visible=waxBasket.visible=q>=.46&&q<.508;
  for(const material of [waxRingMaterial,waxFeedMaterial,waxCollar.material,waxFunnel.material]){material.opacity=waxPresence;material.depthWrite=waxPresence>.98;}
  waxLevel.value=lerp(.90,-.70,burnout);
  smoke.visible=q>.468&&q<.520;smokeMaterial.opacity=Math.sin(smooth(.468,.520,q)*Math.PI)*.24;
  for(let i=0;i<18;i++){const phase=(q*19+i*.061)%1;smokePositions[i*3]=Math.sin(phase*5+i*.8)*.035*(.3+phase);smokePositions[i*3+1]=.32+phase*.82;smokePositions[i*3+2]=.50+Math.cos(phase*4+i)*.025;}smokeGeometry.attributes.position.needsUpdate=true;
  for(const flow of [ringFlow,prongFlow,collarFlow,feedFlow,outsideFlow])flow.uniforms.phase.value=q*620;
  const arrival=smooth(.501,.525,q),departure=smooth(.625,.67,q);
  crucible.visible=q>.501&&q<.67;crucible.position.set(0,1.47+(1-arrival)*.25+departure*.3,.50);nozzleMaterial.opacity=arrival*(1-departure);
  crucible.rotation.z=0;
  outsideFlow.uniforms.head.value=smooth(.516,.531,q);outsideFlow.uniforms.tail.value=smooth(.625,.646,q);
  stream.visible=q>.516&&q<.647;
  feedFlow.uniforms.head.value=smooth(.530,.552,q);feedFlow.uniforms.tail.value=0;filledRunner.visible=q>.530&&q<.650;
  const fill=smooth(.552,.620,q),cool=smooth(.620,.646,q);
  ringFlow.uniforms.head.value=lerp(-.46,.63,fill);ringFlow.uniforms.tail.value=-1;
  prongFlow.uniforms.head.value=ringFlow.uniforms.head.value-.12;prongFlow.uniforms.tail.value=-1;
  collarFlow.uniforms.head.value=ringFlow.uniforms.head.value-.44;
  filledBasket.visible=q>.552&&q<.650;
  castRing.visible=q>.552&&q<.650;
  menisci.forEach((m,i)=>{const h=THREE.MathUtils.clamp(ringFlow.uniforms.head.value,-.38,.38);m.visible=q>.552&&q<.620&&ringFlow.uniforms.head.value<.38;m.position.set(.04+(i?1:-1)*Math.sqrt(Math.max(0,.38*.38-h*h)),-.12+h,.505)});
  ringFlow.material.emissiveIntensity=lerp(.95,.10,cool);ringFlow.material.color.set(0xffc46a).lerp(new THREE.Color(0xc99b38),cool);
  for(const material of [prongFlow.material,collarFlow.material]){material.emissiveIntensity=ringFlow.material.emissiveIntensity;material.color.copy(ringFlow.material.color);}
  feedFlow.material.emissiveIntensity=lerp(.9,.1,cool);feedFlow.material.opacity=1-release;
  const sp=streamGeo.attributes.position;
  for(let i=0;i<sp.count;i++){const x=originalStream[i*3],y=originalStream[i*3+1],z=originalStream[i*3+2];const wave=Math.sin(y*32-q*140)*.0025;sp.setXYZ(i,x+wave,y,z+Math.cos(y*28-q*130)*.0015)}
  sp.needsUpdate=true;streamGeo.computeVertexNormals();
  ripples.forEach((r,i)=>{const phase=(q*12+i*.21)%1;r.visible=q>.530&&q<.627;r.scale.setScalar(.75+phase*.7);r.position.y=.795+Math.sin(q*70+i)*.0006});
  pool.visible=q>.530&&q<.64;pool.scale.setScalar(.87+smooth(.530,.60,q)*.1);
  droplets.forEach((d,i)=>{const t=(q*14+i*.137)%1,a=i*2.399;d.visible=q>.530&&q<.625;d.position.set(Math.cos(a)*t*.065,.315+Math.sin(t*Math.PI)*.055,.50+Math.sin(a)*t*.065);d.scale.setScalar(Math.sin(t*Math.PI))});
  heat.intensity=(q>.530&&q<.64)?1.2+fill*1.1:0;
  const handover=.806,goldHandoff=smooth(.796,.819,q),cushionDeflate=smooth(.780,.796,q),plinthExit=smooth(.786,.796,q);
  ingot.visible=q>.64&&q<.898;ingot.scale.setScalar(1);ingot.rotation.set(0,-.2+(Math.min(q,handover)-.74)*.65,0);
  // Keep the same mesh, normals and materials through forming, settling and presentation.
  bar.visible=q>=.642&&q<.819;
  const barTurn=-.2+(Math.min(q,handover)-.74)*.65;
  const sourceCenter=V(.04,-.60,.50).applyEuler(cast.rotation).applyAxisAngle(V(0,1,0),-barTurn);
  bar.position.copy(sourceCenter).lerp(V(-.28,-.975+barOffset,0),morph);
  bar.rotation.set(.045*(1-smooth(.719,.768,q))*smooth(.68,.715,q)*morph,lerp(cast.rotation.y-barTurn,-.18,morph),.018*Math.sin(barImpact*Math.PI*2)*Math.exp(-barImpact*4)*morph);
  if(bar.visible){
   const dropGrowth=smooth(.642,.650,q),normal=bridgeGeometry.attributes.normal,a=V(0,0,0),b=V(0,0,0);
   for(let i=0;i<bp.count;i++){
    a.fromArray(bridgeOrigin,i*3).multiplyScalar(dropGrowth);b.fromArray(bridgeTarget,i*3);a.lerp(b,morph);bp.setXYZ(i,a.x,a.y,a.z);
    a.fromArray(bridgeOrigin,i*3).normalize();b.fromArray(bridgeNormals,i*3);a.lerp(b,morph).normalize();normal.setXYZ(i,a.x,a.y,a.z);
   }
   bp.needsUpdate=true;normal.needsUpdate=true;
  }
  stampReveal.value=smooth(.692,.755,q);stampBase.value.set(0xc99b38).lerp(new THREE.Color(0xd6a644),morph);
  sideGold.color.copy(stampBase.value);sideGold.roughness=lerp(.29,.26,morph);sideGold.bumpScale=lerp(.002,.004,morph);
  topGold.roughness=lerp(.29,.47,stampReveal.value);topGold.envMapIntensity=lerp(1.1,.7,stampReveal.value);topGold.bumpScale=.011*stampReveal.value;
  for(const material of [sideGold,topGold]){material.transparent=true;material.opacity=1-goldHandoff;material.depthWrite=q<.796;material.emissive.set(0xff9b36);material.emissiveIntensity=(1-morph)*.035;}
  ingotStand.visible=q>=.667&&q<.796;ingotStand.position.y=lerp(-1.79,-1.50,inflate)-cushionDeflate*.245-plinthExit*.08;
  ingotStand.scale.set((lerp(.90,1,inflate)+Math.abs(barBounce)*.16)*(1+cushionDeflate*.025-plinthExit*.08),lerp(.045,1,inflate)*(1-cushionDeflate*.965),(lerp(.88,1,inflate)+Math.abs(gemBounce)*.13)*(1+cushionDeflate*.035-plinthExit*.08));
  standMaterial.opacity=smooth(.667,.683,q)*(1-plinthExit);seamMaterial.opacity=standMaterial.opacity;
  if(ingotStand.visible){const gemSeat=V(1.20,0,.62).applyAxisAngle(V(0,1,0),-ingot.rotation.y);deformCushion(barPress,gemPress,barOffset,gemOffset,gemSeat.x-.25,gemSeat.z-.16);}
  crumbs.forEach(c=>{c.visible=q>.715&&q<handover;c.position.y=-1.18+barOffset*.85;c.scale.set(1.4,.6,1).multiplyScalar(smooth(.715,.735,q)*(1-smooth(.79,handover,q)));});
  const landing=smooth(.91,.965,q),burial=smooth(.965,.998,q),sandIn=smooth(.865,.92,q);
  ore.visible=q>=.796;ore.scale.setScalar(1);
  ore.rotation.set(0,lerp(-.2+(handover-.74)*.65,-.15+(Math.min(q,.965)-.9)*.7,emerge),lerp(0,-.012,landing));
  ore.position.set(0,.43*emerge*(1-landing)-burial*.16,0);oreReveal.value=.7;
  oreTransition.shape.value=smooth(handover,.901,q);oreTransition.surface.value=smooth(.819,.870,q);
  if(primaryOre){primaryOre.castShadow=q>.905;primaryOre.receiveShadow=q>.905;primaryOre.material.aoMapIntensity=1.05*oreTransition.surface.value;primaryOre.material.opacity=goldHandoff;primaryOre.material.depthWrite=q>=.819;primaryOre.material.envMapIntensity=lerp(1.1,.22,oreTransition.surface.value);}
  for(const specimen of ore.children)if(specimen!==ore.children[0]){specimen.visible=q>.885;if(specimen.userData.restScale)specimen.scale.copy(specimen.userData.restScale).multiplyScalar(Math.max(.001,smooth(.885,.923,q)));}
  sand.visible=q>.865;sandUniforms.opacity.value=sandIn;sandUniforms.settle.value=burial;
  contact.visible=q>.86;contactMaterial.opacity=sandIn*lerp(.025,.26,landing);contact.scale.setScalar(lerp(1.25,1,landing));
  grit.visible=q>.90;
  const crystalStart=V(.04,1.82,1.12);const settled=smooth(.365,.49,q);
  rawStone.position.copy(crystalStart).lerp(V(1.20,-1.02,.62),settled);rawStone.rotation.set(.35,q*2,.12);rawStone.scale.setScalar(smooth(.365,.425,q)*.43);rawStone.position.y+=(.14*smooth(.67,.715,q)+gemOffset)*(1-smooth(.806,.88,q));rawStone.rotation.z+=.07*(1-gemFall)*smooth(.68,.72,q);
  if(emerge>0){
   rawStone.position.lerp(V(gemX,-1.13-burial*.045,.90),emerge);
   rawStone.position.y+=Math.sin(emerge*Math.PI)*.50;rawStone.position.z+=Math.sin(emerge*Math.PI)*.75;
   rawStone.rotation.set(lerp(.35,.30,emerge),lerp(q*2,.52,emerge),lerp(.12,-.18,emerge));rawStone.scale.setScalar(.43*(1-emerge*.07));
  }
  gemContact.visible=q>.80;gemContact.material.opacity=sandIn*emerge*lerp(.03,.23,landing);gemContact.scale.setScalar(lerp(1.15,1,landing));
  shadow.visible=q>.375&&q<.80;shadow.material.opacity=.035*smooth(.375,.44,q);
 }

 return {ready,update,groundSurfaces:[shadow,sand,contact,gemContact],get environment(){return environment}};
}
