import * as THREE from 'three';
import { refractionMaterial } from './diamond-material.js';
import { diamondGeometry, createDiamondEnvironment } from './diamond.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createSatinReflection } from './satin-reflection.js';

const clamp=THREE.MathUtils.clamp;
const mix=THREE.MathUtils.lerp;
const ease=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const V=(x,y,z)=>new THREE.Vector3(x,y,z);

function bandSection(a){
 const shoulder=Math.pow(Math.max(0,Math.sin(a)),6);
 return {thickness:.092+shoulder*.032,width:.148+.028*Math.sin(a)**2-.058*shoulder};
}
function bandGeometry(){
 const positions=[],indices=[],N=256,M=32;
 for(let i=0;i<=N;i++){const a=i/N*Math.PI*2,{thickness,width}=bandSection(a);for(let j=0;j<=M;j++){const b=j/M*Math.PI*2,c=Math.cos(b),s=Math.sin(b);const radial=Math.sign(c)*Math.pow(Math.abs(c),.72)*thickness;const r=1.12+radial;positions.push(Math.cos(a)*r,Math.sin(a)*r-.2,Math.sign(s)*Math.pow(Math.abs(s),.78)*width);}}
 for(let i=0;i<N;i++)for(let j=0;j<M;j++){const a=i*(M+1)+j,b=a+M+1;indices.push(a,b,a+1,b,b+1,a+1)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();
 // Match duplicate seam normals to keep the polished surface continuous.
 const normals=g.attributes.normal;
 const join=(a,b)=>{const n=V(normals.getX(a)+normals.getX(b),normals.getY(a)+normals.getY(b),normals.getZ(a)+normals.getZ(b)).normalize();normals.setXYZ(a,n.x,n.y,n.z);normals.setXYZ(b,n.x,n.y,n.z);};
 for(let i=0;i<=N;i++)join(i*(M+1),i*(M+1)+M);
 for(let j=0;j<=M;j++)join(j,N*(M+1)+j);
 g.userData.bandSegments={N,M};return g;
}
function tube(points,radius,material,taper=1){
 const curve=new THREE.CatmullRomCurve3(points),N=64,M=16,geometry=new THREE.TubeGeometry(curve,N,radius,M,false);
 if(taper!==1){const p=geometry.attributes.position;for(let i=0;i<=N;i++){const center=curve.getPointAt(i/N),scale=mix(1,taper,ease(.58,1,i/N));for(let j=0;j<=M;j++){const n=i*(M+1)+j;p.setXYZ(n,center.x+(p.getX(n)-center.x)*scale,center.y+(p.getY(n)-center.y)*scale,center.z+(p.getZ(n)-center.z)*scale);}}geometry.computeVertexNormals();}
 return new THREE.Mesh(geometry,material);
}
function roughGeometry(radius,detail,seed=1){const g=new THREE.IcosahedronGeometry(radius,detail);const p=g.attributes.position;for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);const f=1+.12*Math.sin(x*8.1+seed)*Math.cos(y*6.7+z*3.2)+.045*Math.sin(z*18+x*7);p.setXYZ(i,x*f,y*f,z*f)}g.computeVertexNormals();return g}
function uncutCrystalGeometry(){
 const g=new THREE.OctahedronGeometry(.91,5),p=g.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),sum=Math.abs(x)+Math.abs(y)+Math.abs(z);
  let a=x/sum*.86,b=y/sum*.98,c=z/sum*.79;
  // Rounded growth edges and uneven natural terminations; no manufactured girdle.
  a=THREE.MathUtils.clamp(a,-.69,.73);b=THREE.MathUtils.clamp(b,-.80,.84);c=THREE.MathUtils.clamp(c,-.66,.64);
  const relief=Math.sin(a*43+b*31)*Math.sin(c*37-b*19)*.0006+Math.sin(a*113+c*67)*.00018;
  p.setXYZ(i,a*(1+relief)+b*.075,b*(1+relief),c*(1+relief)+a*.045);
 }
 g.computeVertexNormals();return g;
}
function rawCrystalMaterial(){
 const m=new THREE.MeshPhysicalMaterial({color:0xd7d9d2,metalness:0,roughness:.12,transmission:.84,thickness:.95,ior:2.417,attenuationColor:0xd1cbb7,attenuationDistance:2.6,envMapIntensity:.85,dispersion:.012,clearcoat:.12,clearcoatRoughness:.12});
 m.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 vCrystal;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCrystal=position;');
  shader.fragmentShader=`varying vec3 vCrystal;
  float ch(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
  float cn(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(ch(i),ch(i+vec3(1,0,0)),f.x),mix(ch(i+vec3(0,1,0)),ch(i+vec3(1,1,0)),f.x),f.y),mix(mix(ch(i+vec3(0,0,1)),ch(i+vec3(1,0,1)),f.x),mix(ch(i+vec3(0,1,1)),ch(i+vec3(1,1,1)),f.x),f.y),f.z);}
  `+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
  float cloud=cn(vCrystal*8.)*.65+cn(vCrystal*23.)*.35;
  float weather=smoothstep(.44,.72,cloud)*.35;
  float inclusion=smoothstep(.83,.97,cn(vCrystal*100.))*smoothstep(.48,.7,cloud);
  diffuseColor.rgb*=mix(vec3(.98,.99,1.),vec3(.65,.61,.50),weather);
  diffuseColor.rgb*=1.-inclusion*.64;
  float cleavage=1.-smoothstep(.001,.007,abs(vCrystal.x*.58+vCrystal.y*.73-vCrystal.z*.21-.12+cn(vCrystal*16.)*.012));
  float growth=1.-smoothstep(.025,.12,abs(sin((vCrystal.y+vCrystal.x*.16)*245.+cn(vCrystal*21.)*.65)));
  diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.57,.56,.51),cleavage*.24);
  diffuseColor.rgb*=1.-growth*.035;`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=.115+weather*.26+cleavage*.045+growth*.025;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
  float etch=cn(vCrystal*150.)*.00016+cn(vCrystal*44.)*.00022+growth*.000025;
  vec3 q0=dFdx(vViewPosition),q1=dFdy(vViewPosition);vec3 s0=cross(q1,normal),s1=cross(normal,q0);
  float det=dot(q0,s0);normal=normalize(abs(det)*normal-sign(det)*(dFdx(etch)*s0+dFdy(etch)*s1));`);
 };
 m.customProgramCacheKey=()=> 'origin-natural-crystal-detail-2';return m;
}
function noiseTexture(){const size=128,data=new Uint8Array(size*size);let seed=574;for(let i=0;i<data.length;i++){seed=(seed*16807)%2147483647;data[i]=seed%256}const t=new THREE.DataTexture(data,size,size,THREE.RedFormat);t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(5,5);return t}
function opacityGroup(group,a){group.visible=a>.003;group.scale.setScalar(Math.max(.001,a))}

export function createJewelScene(canvas,options={}){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:!!options.craft,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor('#000000',1);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(34,1,.1,70);camera.position.set(0,.3,10);
 const pmrem=new THREE.PMREMGenerator(renderer);const studio=new RoomEnvironment();
 const panelMat=new THREE.MeshBasicMaterial({color:0xffffff});
 for(const [x,y,z,sx,sy,intensity] of [[-4,4,2,4,6,5],[4,2,4,2,5,3],[0,6,-3,6,2,4],[-1,1,-5,1,4,2]]){const panel=new THREE.Mesh(new THREE.PlaneGeometry(sx,sy),panelMat.clone());panel.material.color.multiplyScalar(intensity);panel.position.set(x,y,z);panel.lookAt(0,0,0);studio.add(panel)}
 const env=pmrem.fromScene(studio,.04).texture;scene.environment=env;scene.environmentIntensity=1.25;
 const hemi=new THREE.HemisphereLight(0xffffff,0xb09e82,.65);scene.add(hemi);
 const key=new THREE.DirectionalLight(0xffffff,2);key.position.set(-3,6,5);key.castShadow=true;key.shadow.mapSize.set(options.center?1024:2048,options.center?1024:2048);key.shadow.camera.left=-7;key.shadow.camera.right=7;key.shadow.camera.top=7;key.shadow.camera.bottom=-7;key.shadow.normalBias=.03;key.shadow.bias=-.0002;key.shadow.radius=5;scene.add(key);
 const rim=new THREE.DirectionalLight(0xe5eeff,1);rim.position.set(4,2,-3);scene.add(rim);const fill=new THREE.DirectionalLight(0xfff5df,.45);fill.position.set(-5,-1,2);scene.add(fill);
 const metal=new THREE.MeshPhysicalMaterial({color:0xe8e9e8,metalness:1,roughness:.095,envMapIntensity:1.9,clearcoat:1,clearcoatRoughness:.07});
 const gold=new THREE.MeshPhysicalMaterial({color:0xd5a348,metalness:1,roughness:.32,envMapIntensity:1.5});
 const glass=new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:0,roughness:0,transmission:.82,thickness:.7,ior:2.417,envMapIntensity:2.7,clearcoat:1,dispersion:.045,side:THREE.DoubleSide});
 const diamondCore=new THREE.MeshPhysicalMaterial({color:0xfafcff,metalness:.42,roughness:.018,envMapIntensity:2.9,transparent:true,opacity:.52,side:THREE.BackSide});
 const roughGlass=new THREE.MeshPhysicalMaterial({color:0xe7e3d7,metalness:.03,roughness:.23,transmission:.6,thickness:1,ior:2.417,envMapIntensity:2,flatShading:true});
 const noise=noiseTexture();const rockMat=new THREE.MeshStandardMaterial({color:0x827666,roughness:1,envMapIntensity:.055,bumpMap:noise,bumpScale:.07,flatShading:false});
 const world=new THREE.Group();scene.add(world);const ring=new THREE.Group();world.add(ring);const band=new THREE.Mesh(bandGeometry(),metal);ring.add(band);band.castShadow=true;
 const basket=new THREE.Group(),claws=[],tips=[],shoulders=[];ring.add(basket);
 const diamondShape=diamondGeometry(),stoneSurface=new THREE.Mesh(diamondShape,metal),seatRay=new THREE.Raycaster();
 const girdle=new THREE.Mesh(new THREE.TorusGeometry(.43,.027,16,96),metal);girdle.rotation.x=Math.PI/2;girdle.position.y=1.38;basket.add(girdle);
 for(let i=0;i<6;i++){
  const a=i/6*Math.PI*2+Math.PI/6,c=Math.cos(a),s=Math.sin(a);
  seatRay.set(V(c*2,.067,s*2),V(-c,0,-s));
  const contact=seatRay.intersectObject(stoneSurface,false)[0];
  const end=contact.point.clone().addScaledVector(contact.face.normal,.010);end.y+=1.62;
  // Six short petals grow from the gallery and fold over the actual crown surface.
  const points=[V(c*.43,1.38,s*.43),V(c*.535,1.48,s*.535),V(c*.657,1.596,s*.657),V(c*.658,1.642,s*.658),end];
  const claw=tube(points,.030,metal,.46);claw.castShadow=true;basket.add(claw);claws.push(claw);
  const cap=new THREE.SphereGeometry(.0145,12,12);cap.scale(1,.70,1.16);cap.rotateY(Math.PI/2-a);
  const tip=new THREE.Mesh(cap,metal);tip.position.copy(end);basket.add(tip);tips.push(tip);
 }
 // Attach beyond the last pavé stone, inside the unpaved crown of the shank.
 for(const side of [-1,1]){const shoulder=tube([V(side*.285,.970,0),V(side*.306,1.105,0),V(side*.375,1.270,0),V(side*.43,1.38,0)],.044,metal,.76);shoulder.castShadow=true;basket.add(shoulder);shoulders.push(shoulder);}
 const diamond=new THREE.Group();world.add(diamond);diamond.position.y=1.62;const gemTarget=createDiamondEnvironment(renderer);
 const brilliant=refractionMaterial(diamondShape,gemTarget.texture);brilliant.uniforms.aberrationStrength.value=.008;const cut=new THREE.Mesh(diamondShape,brilliant);diamond.add(cut);
 cut.onBeforeRender=(activeRenderer,_scene,activeCamera)=>{const target=activeRenderer.getRenderTarget();activeCamera.projectionMatrixInverse.copy(activeCamera.projectionMatrix).invert();brilliant.uniforms.viewMatrixInverse.value.copy(activeCamera.matrixWorld);brilliant.uniforms.projectionMatrixInverse.value.copy(activeCamera.projectionMatrixInverse);brilliant.uniforms.resolution.value.set(target?target.width:activeRenderer.domElement.width,target?target.height:activeRenderer.domElement.height);};
 // Graduated bead-set pavé. Shared geometry and instancing keep the live model light.
 const pave=new THREE.Group();ring.add(pave);
 const paveMaterial=refractionMaterial(diamondShape,gemTarget.texture);paveMaterial.uniforms.bounces.value=3;paveMaterial.uniforms.aberrationStrength.value=.009;
 const detailMetal=metal.clone();detailMetal.transparent=true;
 const paveStones=new THREE.InstancedMesh(diamondShape,paveMaterial,16),seats=new THREE.InstancedMesh(new THREE.TorusGeometry(.65,.052,8,32).rotateX(Math.PI/2),detailMetal,16),beads=new THREE.InstancedMesh(new THREE.SphereGeometry(.0105,10,8),detailMetal,64);
 pave.add(paveStones,seats,beads);const pavePlacements=[],dummy=new THREE.Object3D();
 for(const side of [-1,1])for(let i=0;i<8;i++){
  const a=side>0?.15+i*.147:Math.PI-(.15+i*.147),size=.109+i*.0023,{thickness}=bandSection(a),r=1.12+thickness+.009;
  const position=V(Math.cos(a)*r,Math.sin(a)*r-.2,0),rotation=new THREE.Quaternion().setFromAxisAngle(V(0,0,1),a-Math.PI/2),index=pavePlacements.length;
  pavePlacements.push({position,rotation,size,normal:V(Math.cos(a),Math.sin(a),0)});
  dummy.position.copy(position);dummy.quaternion.copy(rotation);dummy.scale.setScalar(size);dummy.updateMatrix();seats.setMatrixAt(index,dummy.matrix);
  for(let j=0;j<4;j++){const angle=Math.PI/4+j*Math.PI/2;dummy.position.copy(V(Math.cos(angle)*size*.69,.008,Math.sin(angle)*size*.69).applyQuaternion(rotation).add(position));dummy.scale.set(1,1.18,1);dummy.updateMatrix();beads.setMatrixAt(index*4+j,dummy.matrix);}
 }
 paveStones.frustumCulled=false;
 paveStones.onBeforeRender=(activeRenderer,_scene,activeCamera)=>{const target=activeRenderer.getRenderTarget();paveMaterial.uniforms.viewMatrixInverse.value.copy(activeCamera.matrixWorld);paveMaterial.uniforms.projectionMatrixInverse.value.copy(activeCamera.projectionMatrixInverse);paveMaterial.uniforms.resolution.value.set(target?target.width:activeRenderer.domElement.width,target?target.height:activeRenderer.domElement.height);};
 const sprue=new THREE.Group();ring.add(sprue);const stem=new THREE.Mesh(new THREE.CylinderGeometry(.09,.15,.8,16,80),metal);stem.position.set(0,-1.7,0);sprue.add(stem);const base=new THREE.Mesh(new THREE.CylinderGeometry(.000001,.27,.35,24),metal);base.position.y=-2.23;sprue.add(base);
 const rawGeometry=uncutCrystalGeometry();const roughStone=new THREE.Mesh(rawGeometry,rawCrystalMaterial());roughStone.castShadow=true;roughStone.receiveShadow=true;world.add(roughStone);
 const craft=options.craftFactory?options.craftFactory({world,renderer,pmrem,gold,rawStone:roughStone,sourceRing:{band,girdle,claws,tips,shoulders,stem,funnel:base,metal}}):{update(){},ready:Promise.resolve(),environment:null};
 let dustSeed=72;const rnd=()=>{dustSeed=(dustSeed*16807)%2147483647;return dustSeed/2147483647};
 const dust=new THREE.Group();world.add(dust);for(let i=0;i<55;i++){const d=new THREE.Mesh(new THREE.IcosahedronGeometry(.012+rnd()*.009,0),new THREE.MeshBasicMaterial({color:0xc7bca7,transparent:true,opacity:.25+rnd()*.4}));d.position.set((rnd()-.5)*7,(rnd()-.5)*5,(rnd()-.5)*3);dust.add(d)}
 const reflection=createSatinReflection(world,{compact:!!options.center||!!options.live,exclude:[dust,...(craft.groundSurfaces||[])]});

 let width=1,height=1,renderMode=false,inspect=false,spinX=0,spinY=0,centered=!!options.center,hero=false;let finish='mirror',stoneScale=1,view='ring',lightX=0,lightY=0;
 const pickRay=new THREE.Raycaster(),pickPointer=new THREE.Vector2(),pickBox=new THREE.Box3(),pickCorner=new THREE.Vector3();
 function containsPoint(x,y){
  const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return false;
  pickPointer.set((x-rect.left)/rect.width*2-1,1-(y-rect.top)/rect.height*2);pickRay.setFromCamera(pickPointer,camera);
  if(pickRay.intersectObjects([band,cut,...claws],false).length)return true;
  // The empty centre of a ring is also a natural place to start a drag.
  pickBox.setFromObject(band).expandByObject(cut);let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
  for(let i=0;i<8;i++){pickCorner.set(i&1?pickBox.max.x:pickBox.min.x,i&2?pickBox.max.y:pickBox.min.y,i&4?pickBox.max.z:pickBox.min.z).project(camera);const px=(pickCorner.x+1)*rect.width/2+rect.left,py=(1-pickCorner.y)*rect.height/2+rect.top;left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);}
  return x>=left-16&&x<=right+16&&y>=top-16&&y<=bottom+16;
 }
 const sky=new THREE.Color('#000000');
 function resize(w=innerWidth,h=innerHeight,film=false){
  width=w;height=h;renderMode=film;renderer.setPixelRatio(film?1:Math.min(devicePixelRatio,options.live?1.5:1.6));renderer.setSize(w,h,false);camera.clearViewOffset();camera.aspect=w/h;
  // Match object-fit: cover of the rendered film, including narrow desktop windows.
  if(hero){const sw=w<=700?720:1600,sh=w<=700?1280:1000,cover=Math.max(w/sw,h/sh);camera.setViewOffset(sw,sh,(sw-w/cover)/2,(sh-h/cover)/2,w/cover,h/cover);}
  camera.updateProjectionMatrix();
 }
 function render(p=0,time=0,pointer={x:0,y:0},motion=null){
  const mobile=hero?width<=700:renderMode==='portrait'||(!renderMode&&width/height<.9);
  const q=inspect ? 0 : p;
  const rough=ease(.27,.39,q),melt=ease(.405,.475,q),moldIn=ease(.4,.49,q),moldOut=ease(.615,.69,q),ingotIn=ease(.63,.71,q),ingotOut=ease(.79,.86,q),oreIn=ease(.79,.92,q);
  world.position.set(centered?0:mobile?0:1.72,centered?0:mobile?1.12:0,0);world.scale.setScalar(centered?1.1:mobile?.98:1.16);
  world.scale.multiplyScalar(motion?.scale??1);world.position.y+=motion?.offsetY||0;world.position.x+=motion?.offsetX||0;
  const cameraDepth=mobile?10.9:10;const craftView=ease(.395,.48,q);camera.position.set(pointer.x*.14,mix(mobile?.45:.3+pointer.y*.10,2.65,craftView),cameraDepth-mix(0,.18,ease(0,.17,q)));camera.lookAt(0,mix(.05,-.12,craftView),0);
  const handoff=ease(.36,.46,q),turn=Math.min(q,.36);
  const ringStart=new THREE.Euler(.48+Math.sin(turn*8)*.11+(inspect?spinX:0)+(motion?.x||0),-.45+turn*18.5+(inspect?spinY:0)+(motion?.y||0),-.27+turn*.7+(motion?.z||0));
  const castYaw=.16+(q-.53)*.3;
  ring.rotation.set(mix(ringStart.x,0,handoff),mix(ringStart.y,Math.PI*2+castYaw,handoff),mix(ringStart.z,0,handoff));
  const castingScale=1+.055*ease(.44,.49,q)*(1-ease(.62,.65,q));
  const ringScale=mix(1,.38/1.12,handoff)*castingScale;ring.scale.setScalar(ringScale);ring.visible=q<.46;
  const targetCenter=V(.04,-.60,.50).applyAxisAngle(V(0,1,0),castYaw).multiplyScalar(castingScale);
  const bandOffset=V(0,-.2,0).multiplyScalar(ringScale).applyEuler(ring.rotation);
  ring.position.copy(V(0,-ease(.2,.32,q)*.15,0).lerp(targetCenter.sub(bandOffset),handoff));
  ring.position.y+=motion?.float||0;
  metal.roughness=finish==='satin'?.4:mix(.075,.69,rough);metal.clearcoat=1-rough*.8;metal.bumpMap=rough>.01?noise:null;metal.bumpScale=rough*.045;
  metal.color.set(0xe8e9e8).lerp(new THREE.Color(0x211e1a),ease(.405,.46,q));
  basket.scale.setScalar(1);band.visible=basket.visible=!(centered&&view==='macro');
  const paveRelease=ease(.225,.325,q);pave.visible=q<.36&&band.visible;
  detailMetal.color.copy(metal.color);detailMetal.roughness=metal.roughness;detailMetal.clearcoat=metal.clearcoat;detailMetal.opacity=1-ease(.30,.36,q);detailMetal.depthWrite=detailMetal.opacity>.98;
  if(pave.visible){pavePlacements.forEach(({position,rotation,size,normal},i)=>{dummy.position.copy(position).addScaledVector(normal,paveRelease*.18);dummy.quaternion.copy(rotation);dummy.scale.setScalar(Math.max(.0001,size*(1-paveRelease)));dummy.updateMatrix();paveStones.setMatrixAt(i,dummy.matrix);});paveStones.instanceMatrix.needsUpdate=true;paveStones.visible=paveRelease<.999;}
  const gemTurn=Math.min(q,.36),gemEuler=new THREE.Euler(.48+Math.sin(gemTurn*8)*.11+(inspect?spinX:0)+(motion?.x||0),-.45+gemTurn*18.5+(inspect?spinY:0)+(motion?.y||0),-.27+gemTurn*.7+(motion?.z||0));
  diamond.position.copy(V(0,1.62+ease(.205,.34,gemTurn)*.85+(motion?.lift||0),0).applyEuler(gemEuler)).add(V(0,-ease(.2,.32,gemTurn)*.15+(motion?.float||0),0));
  diamond.quaternion.setFromEuler(gemEuler);diamond.rotateY(gemTurn*5);
  if(q>.36)diamond.position.lerp(V(1.20,-1.02,.62),ease(.365,.49,q));
  diamond.scale.setScalar(stoneScale*(1-ease(.365,.425,q)));
  sprue.visible=rough>.005&&q<.46;sprue.scale.setScalar(Math.max(.001,rough));
  const rs=ease(.365,.44,q);roughStone.visible=q>.36;roughStone.scale.setScalar(rs*.75);roughStone.position.set(mix(1.5,.7,oreIn),mix(.3,.15,oreIn),.3);roughStone.rotation.set(.2+q*.6,q*3,.15);roughStone.position.y+=Math.sin(q*8)*.045;
  craft.update(q,mobile);
  dust.rotation.y=q*.5;dust.visible=q>.14;
  const floor=mix(mix(-1.65,-2.30,ease(.23,.34,q)),-1.355,ease(.36,.47,q));
  reflection.position.y=mix(floor-.47*ease(.69,.73,q)*(1-ease(.825,.9,q)),-1.305,oreIn);reflection.material.uniforms.uStrength.value=mix(.23,.14,oreIn)*(1-ease(.865,.925,q));reflection.visible=!(centered&&view==='macro');
  key.intensity=mix(2,1.45,oreIn);hemi.intensity=mix(.65,.43,oreIn);rim.intensity=mix(1,.5,oreIn);fill.intensity=mix(.45,.25,oreIn);key.shadow.normalBias=mix(.03,.009,oreIn);
  sky.set('#000000');sky.lerp(new THREE.Color('#000000'),oreIn*.7);renderer.setClearColor(sky);scene.environment=q>.41&&craft.environment?craft.environment:env;scene.environmentIntensity=q>.41?.75:1.15;
  scene.environmentRotation.y=motion?.light||0;
  key.position.set(-3,6,5);brilliant.uniforms.lightStrength.value=0;
  if(centered){
   if(view==='macro'){
    world.updateMatrixWorld(true);const target=diamond.getWorldPosition(new THREE.Vector3());
    const distance=Math.max(3.5,stoneScale*.82/(Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*Math.min(camera.aspect,1)*.80));
    camera.position.set(target.x+.10,target.y+.65,target.z+distance);camera.lookAt(target);
   }else{const distance=Math.max(9.2,1.45/(Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*Math.min(camera.aspect,1)*.82));camera.position.set(0,.45,distance);camera.lookAt(0,.35,0);}
   key.position.set(-3+lightX*6,5+lightY*3,5);rim.intensity=.8;
   brilliant.uniforms.lightDirection.value.set(lightX*1.8,.65+lightY*.8,1.3).normalize();brilliant.uniforms.lightStrength.value=view==='macro'?.7:.22;
  }
  camera.updateMatrixWorld();
  renderer.render(scene,camera);
 }
 resize();
 return {renderer,resize,render,ready:craft.ready,setPresentation(value){hero=value==='hero';centered=!hero;view='ring';resize(width,height)},containsPoint,setView(value){view=value},setLight(x,y=0){lightX=x;lightY=y},setInspect(v){inspect=v;spinX=0;spinY=0},rotate(dx,dy){spinY+=dx*.008;spinX=clamp(spinX+dy*.006,-.75,.75)},getHotspots(){world.updateMatrixWorld(true);return [[0,.22,0],[.46,.12,.15],[.61,0,0]].map(a=>{const point=cut.localToWorld(new THREE.Vector3(...a)).project(camera);return {x:(point.x+1)*width/2,y:(1-point.y)*height/2,visible:point.z<1&&Math.abs(point.x)<.95&&Math.abs(point.y)<.95}})},setDesign(value){finish=value.finish;stoneScale={delicate:.78,classic:1,bold:1.2}[value.stone]||1},dispose(){reflection.dispose();reflection.geometry.dispose();renderer.dispose();pmrem.dispose();}};
}
