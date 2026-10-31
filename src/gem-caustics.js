import * as THREE from 'three';
import { MeshBVH } from 'three-mesh-bvh';

// Rays are traced in gem-local space; reflections stay on two world-space receivers.
export function createGemCaustics(scene,geometry,{reduced=false}={}){
 const floorY=-1.38,wallZ=-2.65;
 const rayGeometry=geometry.clone(),bvh=new MeshBVH(rayGeometry,{targetLeafSize:4});
 const positions=geometry.getAttribute('position'),facets=[];
 const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),ab=new THREE.Vector3(),ac=new THREE.Vector3();
 for(let i=0;i<positions.count;i+=3){
  a.fromBufferAttribute(positions,i);b.fromBufferAttribute(positions,i+1);c.fromBufferAttribute(positions,i+2);
  ab.subVectors(b,a);ac.subVectors(c,a);const normal=ab.clone().cross(ac),area=normal.length()*.5;
  if(area<.00001)continue;
  normal.normalize();facets.push({id:facets.length,center:a.clone().add(b).add(c).multiplyScalar(1/3),normal,area});
 }
 const capacity=Math.max(512,facets.length*4);
 const uniforms={uStrength:{value:0},uMotion:{value:0},uSpectrum:{value:0},uTime:{value:0},uRotation:{value:0},uFloorY:{value:floorY},uWallZ:{value:wallZ}};
 const material=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,premultipliedAlpha:true,side:THREE.DoubleSide,toneMapped:false,
  vertexShader:`attribute float aEnergy;attribute float aStyle;varying vec2 vUv;varying float vEnergy;varying float vStyle;varying vec3 vWorld;void main(){vUv=uv;vEnergy=aEnergy;vStyle=aStyle;vec4 world=modelMatrix*instanceMatrix*vec4(position,1.);vWorld=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`,
  fragmentShader:`varying vec2 vUv;varying float vEnergy;varying float vStyle;varying vec3 vWorld;uniform float uFloorY;uniform float uWallZ;uniform float uStrength;uniform float uMotion;uniform float uSpectrum;uniform float uTime;
  float band(vec2 p,float shift){
   float envelope=pow(max(0.,1.-p.x*p.x),1.1);
   float fold=.13*sin(p.x*2.8)+.055*p.x*p.x;
   float width=.065+.13*envelope;
   float d=(p.y-fold-shift)/width;
   return (exp(-d*d*2.5)+exp(-d*d*.17)*.12)*envelope;
  }
  void main(){
   if(vWorld.y<uFloorY||vWorld.z<uWallZ)discard;
   vec2 p=(vUv-.5)*2.;float r=length(p),kind=floor(vStyle),seed=fract(vStyle)*17.;
   vec3 pearl=mix(vec3(.96,.98,1.),vec3(1.,.99,.96),fract(seed));
   vec3 light;
   if(kind<.5){
    vec2 q=p+vec2(.08*sin(p.y*3.+seed),.1*sin(p.x*4.+seed));
    float boundary=length(q)*(1.+.12*sin(atan(q.y,q.x)*3.+seed));
    float spot=1.-smoothstep(.28,.37,boundary);
    light=pearl*(spot*.95+exp(-dot(q,q)*24.)*.3+exp(-r*r*5.)*.045);
   }else if(kind<1.5){
    vec2 q=p+vec2(.07*sin(p.y*4.+seed),.09*p.x*p.x);
    float boundary=max(abs(q.x)*.78+abs(q.y)*.3,abs(q.y)*.92+abs(q.x)*.15);
    light=pearl*((1.-smoothstep(.24,.32,boundary))*.95+exp(-dot(q,q)*17.)*.14);
   }else if(kind<2.5){
    float arc=.08+.92*smoothstep(-.4,.5,sin(atan(p.y,p.x)+seed));
    float ring=exp(-pow((r-.53)/(.09+.04*fract(seed)),2.));
    light=pearl*(ring*arc*.65+exp(-r*r*6.)*.065);
   }else if(kind<3.5){
    float angle=atan(p.y,p.x);
    float radius=.48+.07*sin(angle*3.+seed)+.045*sin(angle*5.-seed);
    float width=.035+.055*(.5+.5*sin(angle*2.+seed));
    float arc=smoothstep(-.15,.55,sin(angle+seed*1.6)+.3*sin(angle*3.+seed));
    float d=r-radius,ring=exp(-pow(d/width,2.))*arc;
    float dispersion=.003+uSpectrum*.006;
    vec3 fringe=vec3(exp(-pow((d-dispersion)/width,2.)),exp(-pow(d/width,2.)),exp(-pow((d+dispersion)/width,2.)));
    float colored=smoothstep(.25,.85,sin(angle*1.7-seed));
    light=pearl*exp(-r*r*32.)*.5+pearl*ring*.42+mix(pearl,fringe,.08+uSpectrum*.12)*arc*colored*ring*(.32+uSpectrum*.24);
   }else{
    float spread=.002+uSpectrum*.004;
    light=vec3(band(p,spread),band(p,0.),band(p,-spread))*pearl;
   }
   light*=1.-smoothstep(.78,1.,r);
   float power=vEnergy*uStrength*(.8+uMotion*.65)*(.85-.15*cos(uTime*.57));
   float intensity=max(light.r,max(light.g,light.b));
   gl_FragColor=vec4(light/max(intensity,.0001),min(.85,intensity*power));
   #include <colorspace_fragment>
   #include <premultiplied_alpha_fragment>
  }`});
 const floorGeometry=new THREE.PlaneGeometry(1,1),wallGeometry=floorGeometry.clone();
 const floorEnergy=new THREE.InstancedBufferAttribute(new Float32Array(capacity),1).setUsage(THREE.DynamicDrawUsage);
 const wallEnergy=new THREE.InstancedBufferAttribute(new Float32Array(capacity),1).setUsage(THREE.DynamicDrawUsage);
 floorGeometry.setAttribute('aEnergy',floorEnergy);wallGeometry.setAttribute('aEnergy',wallEnergy);
 floorGeometry.setAttribute('aStyle',new THREE.InstancedBufferAttribute(new Float32Array(capacity),1).setUsage(THREE.DynamicDrawUsage));
 wallGeometry.setAttribute('aStyle',new THREE.InstancedBufferAttribute(new Float32Array(capacity),1).setUsage(THREE.DynamicDrawUsage));
 const floor=new THREE.InstancedMesh(floorGeometry,material,capacity),wall=new THREE.InstancedMesh(wallGeometry,material,capacity);
 for(const mesh of [floor,wall]){mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;mesh.count=facets.length*4;mesh.renderOrder=-2;scene.add(mesh);}
 // Subtle surface tones and contact shading describe the corner without an emissive seam.
 const backdropGeometry=new THREE.PlaneGeometry(40,40);
 function backdropMaterial(isFloor){
  return new THREE.ShaderMaterial({toneMapped:false,uniforms:{uTone:{value:new THREE.Color(isFloor?'#050505':'#010101')},uIsFloor:{value:isFloor?1:0},uFloorY:{value:floorY},uWallZ:{value:wallZ}},
   vertexShader:`varying vec3 vWorld;void main(){vec4 world=modelMatrix*vec4(position,1.);vWorld=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`,
   fragmentShader:`varying vec3 vWorld;uniform vec3 uTone;uniform float uIsFloor;uniform float uFloorY;uniform float uWallZ;
   void main(){
    float distanceToCorner=mix(vWorld.y-uFloorY,vWorld.z-uWallZ,uIsFloor);
    float contact=.45+.55*smoothstep(0.,mix(.18,.3,uIsFloor),max(0.,distanceToCorner));
    float falloff=1.-smoothstep(5.,15.,abs(vWorld.x+.8));
    float wallFade=mix(1.-smoothstep(3.,10.,vWorld.y-uFloorY),1.,uIsFloor);
    gl_FragColor=vec4(uTone*contact*falloff*wallFade,1.);
    #include <colorspace_fragment>
   }`});
 }
 const backWall=new THREE.Mesh(backdropGeometry,backdropMaterial(false));
 backWall.position.set(0,floorY+20,wallZ);
 const backFloor=new THREE.Mesh(backdropGeometry,backdropMaterial(true));
 backFloor.rotation.x=-Math.PI/2;backFloor.position.set(0,floorY,wallZ+20);
 scene.add(backWall,backFloor);
 // A hidden warm source leaves only its slowly breathing footprint on the floor.
 const glowGeometry=new THREE.PlaneGeometry(1,1);
 const glowMaterial=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,premultipliedAlpha:true,toneMapped:false,
  vertexShader:`varying vec2 vUv;varying vec3 vWorld;void main(){vUv=uv;vec4 world=modelMatrix*vec4(position,1.);vWorld=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`,
  fragmentShader:`uniform float uTime;uniform float uStrength;uniform float uWallZ;varying vec2 vUv;varying vec3 vWorld;
  void main(){
   if(vWorld.z<uWallZ)discard;
   float breath=.5-.5*cos(uTime*.57);
   float r=length((vUv-.5)*2.);
   float core=1.-smoothstep(.56,.79,r);
   float edge=1.-smoothstep(.76,.95,r);
   float pool=(.86*core+.14*edge);
   float alpha=pool*(.92+.08*breath)*min(1.,uStrength*1.5);
   vec3 warmth=mix(vec3(1.,.84,.48),vec3(1.,.98,.88),core);
   gl_FragColor=vec4(warmth,alpha);
   #include <colorspace_fragment>
   #include <premultiplied_alpha_fragment>
  }`});
 const floorGlow=new THREE.Mesh(glowGeometry,glowMaterial);
 floorGlow.rotation.x=-Math.PI/2;floorGlow.position.set(-3.25,floorY+.004,.6);floorGlow.scale.set(3.8,3.6,1);floorGlow.renderOrder=-4;scene.add(floorGlow);
 const glowRay=new THREE.Raycaster(),glowPlane=new THREE.Plane(new THREE.Vector3(0,1,0),-floorY),glowAnchor=new THREE.Vector3();
 // A single faint incident beam connects the footprint to the gem; reflected hits stay on the receivers.
 const shaftPositions=new Float32Array(12),shaftGeometry=new THREE.BufferGeometry();
 shaftGeometry.setAttribute('position',new THREE.BufferAttribute(shaftPositions,3).setUsage(THREE.DynamicDrawUsage));
 shaftGeometry.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,0,1,1,1],2));shaftGeometry.setIndex([0,1,2,2,1,3]);
 const shaftMaterial=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,premultipliedAlpha:true,toneMapped:false,
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform float uTime;uniform float uStrength;varying vec2 vUv;void main(){
   float edge=1.-smoothstep(.84,1.,abs(vUv.x*2.-1.));
   float ends=smoothstep(0.,.12,vUv.y)*(1.-smoothstep(.9,1.,vUv.y));
   float breath=.5-.5*cos(uTime*.57);
   gl_FragColor=vec4(vec3(1.,.9,.7),edge*ends*(.025+.012*breath)*uStrength);
   #include <colorspace_fragment>
   #include <premultiplied_alpha_fragment>
  }`});
 const shaft=new THREE.Mesh(shaftGeometry,shaftMaterial);shaft.frustumCulled=false;shaft.renderOrder=-1;scene.add(shaft);
 const shaftEnd=new THREE.Vector3(),shaftDirection=new THREE.Vector3(),shaftSide=new THREE.Vector3(),shaftView=new THREE.Vector3();
 const ray=new THREE.Ray(),inverse=new THREE.Matrix4(),dummy=new THREE.Object3D(),light=new THREE.Vector3(-3.4,5.5,3.2);
 const entry=new THREE.Vector3(),normal=new THREE.Vector3(),incident=new THREE.Vector3(),direction=new THREE.Vector3(),origin=new THREE.Vector3(),exit=new THREE.Vector3(),worldDirection=new THREE.Vector3(),hitPoint=new THREE.Vector3(),glintPoint=new THREE.Vector3();
 const normalFloor=new THREE.Vector3(0,1,0),normalWall=new THREE.Vector3(0,0,1),rotation=new THREE.Quaternion(),planeRotation=new THREE.Quaternion(),zAxis=new THREE.Vector3(0,0,1);
 let previousRotation=new THREE.Quaternion(),previousPosition=new THREE.Vector3(),previousLight=new THREE.Vector3(),traced=false,lastTrace=0,motion=0;
 function refract(out,i,n,eta){const cosine=-n.dot(i),k=1-eta*eta*(1-cosine*cosine);if(k<0)return false;out.copy(i).multiplyScalar(eta).addScaledVector(n,eta*cosine-Math.sqrt(k)).normalize();return true;}
 // Stable facet slots keep disappearing rays alive long enough to fade out.
 const makeState=()=>({position:new THREE.Vector3(),target:new THREE.Vector3(),length:0,width:0,targetLength:0,targetWidth:0,power:0,targetPower:0,style:0,initialized:false});
 const floorStates=Array.from({length:facets.length*4},makeState),wallStates=Array.from({length:facets.length*4},makeState);
 function receiver(mesh,energy,index,p,length,width,power,isFloor,style){
  const radial=isFloor?Math.atan2(-p.z,p.x):Math.atan2(p.y,p.x);
  planeRotation.setFromUnitVectors(zAxis,isFloor?normalFloor:normalWall);rotation.setFromAxisAngle(zAxis,radial);
  dummy.position.copy(p);dummy.position[isFloor?'y':'z']+=.008;
  dummy.quaternion.copy(planeRotation).multiply(rotation);dummy.scale.set(length,width,1);dummy.updateMatrix();mesh.setMatrixAt(index,dummy.matrix);energy.array[index]=power;mesh.geometry.attributes.aStyle.array[index]=style;
 }
 function trace(gem){
  gem.updateMatrixWorld();inverse.copy(gem.matrixWorld).invert();
  for(const states of [floorStates,wallStates])for(const state of states)state.targetPower=0;
  for(const facet of facets){
   entry.copy(facet.center).applyMatrix4(gem.matrixWorld);incident.subVectors(entry,light).normalize().transformDirection(inverse);
   const facing=-incident.dot(facet.normal);if(facing<.04)continue;
   if(!refract(direction,incident,facet.normal,1/2.417))continue;
   ray.origin.copy(facet.center).addScaledVector(direction,.0015);ray.direction.copy(direction);let escaped=false;
   for(let bounce=0;bounce<5;bounce++){
    const hit=bvh.raycastFirst(ray,THREE.BackSide);if(!hit)break;
    normal.copy(hit.face.normal);if(normal.dot(ray.direction)>0)normal.negate();
    if(refract(direction,ray.direction,normal,2.417)){exit.copy(hit.point);escaped=true;break;}
    ray.direction.reflect(normal).normalize();ray.origin.copy(hit.point).addScaledVector(ray.direction,.0015);
   }
   if(!escaped)continue;
   origin.copy(exit).applyMatrix4(gem.matrixWorld);worldDirection.copy(direction).transformDirection(gem.matrixWorld);
   const tf=worldDirection.y<-.015?(floorY-origin.y)/worldDirection.y:Infinity;
   const tw=worldDirection.z<-.015?(wallZ-origin.z)/worldDirection.z:Infinity;
   const isFloor=tf<tw,t=isFloor?tf:tw;if(!Number.isFinite(t)||t<=0||t>18)continue;
   hitPoint.copy(origin).addScaledVector(worldDirection,t);
   const power=Math.min(.95,(.22+Math.sqrt(facet.area)*3.4)*facing)*(1-Math.min(1,t/24));
   const size=.38+Math.min(.5,t*.045)+Math.sqrt(facet.area)*.38;
   for(let j=0;j<4;j++){
    const index=facet.id*4+j;
    glintPoint.copy(hitPoint);
    if(j){const angle=facet.id*2.399+j*2.1,radius=.35+j*.37;glintPoint.x+=Math.cos(angle)*radius;glintPoint[isFloor?'z':'y']+=Math.sin(angle)*radius*.8;}
    const scale=j===0?1:j===1?.62:j===2?.42:.55;
    const choice=(facet.id*7+j*3)%10,variation=(Math.sin(facet.id*12.9898+j*78.233)*43758.5453)%1;
    const variant=variation-Math.floor(variation);
    let kind=choice<3?0:choice<5?1:choice<7?2:choice<8?3:4;
    if(j===3)kind=facet.id%2;
    if((j>0||!isFloor)&&kind===4)kind=0;
    const length=kind===4?.75+Math.min(3.6,t*.43):size*scale*(.7+variant*.65);
    const width=kind===4?.28+Math.sqrt(facet.area)*1.8:length*(kind===1?.4+variant*.25:.65+variant*.3);
    const state=(isFloor?floorStates:wallStates)[index];
    state.target.copy(glintPoint);state.targetLength=length;state.targetWidth=width;
    state.targetPower=power*(j===0?1:.65);state.style=kind+.1+variant*.8;
   }
  }
  previousRotation.copy(gem.quaternion);previousPosition.copy(gem.position);previousLight.copy(light);traced=true;
 }
 function easeReceivers(delta){
  const rise=reduced?1:1-Math.exp(-delta*5),fall=reduced?1:1-Math.exp(-delta*8),move=reduced?1:1-Math.exp(-delta*12);
  for(const isFloor of [true,false]){
   const states=isFloor?floorStates:wallStates,mesh=isFloor?floor:wall,energy=isFloor?floorEnergy:wallEnergy;
   for(let i=0;i<states.length;i++){
    const state=states[i];
    if(!state.initialized&&state.targetPower===0)continue;
    if(!state.initialized){state.position.copy(state.target);state.length=state.targetLength;state.width=state.targetWidth;state.initialized=true;}
    const jumped=state.position.distanceToSquared(state.target)>.85*.85;
    const target=jumped&&!reduced&&state.power>.002?0:state.targetPower;
    state.power+=(target-state.power)*(target>state.power?rise:fall);
    if(state.power<.002||reduced){state.position.copy(state.target);state.length=state.targetLength;state.width=state.targetWidth;}
    else if(!jumped){state.position.lerp(state.target,move);state.length+=(state.targetLength-state.length)*move;state.width+=(state.targetWidth-state.width)*move;}
    receiver(mesh,energy,i,state.position,state.length,state.width,state.power,isFloor,state.style);
   }
   mesh.instanceMatrix.needsUpdate=true;energy.needsUpdate=true;mesh.geometry.attributes.aStyle.needsUpdate=true;
  }
 }
 return {getLightDirection(out,position){return out.subVectors(light,position).normalize();},setGlowAnchor(camera,x,y){
  camera.updateMatrixWorld();glowRay.setFromCamera({x,y},camera);
  if(glowRay.ray.intersectPlane(glowPlane,glowAnchor)&&glowAnchor.z>wallZ+.3&&glowAnchor.z<5){floorGlow.position.x=glowAnchor.x;floorGlow.position.z=glowAnchor.z;}
 },update(gem,camera,{time,delta,reveal=1,spectrum=0,wire=0,interacting=false,pointerX=0,pointerY=0}){
  const rotationChange=traced?gem.quaternion.angleTo(previousRotation):0;
  const target=reduced?0:Math.min(1,rotationChange/Math.max(.001,delta)*.16+(interacting?.3:0));motion+=(target-motion)*(1-Math.exp(-delta*5));
  uniforms.uMotion.value=motion;uniforms.uStrength.value=(.6+reveal*.4)*(1-wire*.78);uniforms.uSpectrum.value=spectrum;
  uniforms.uTime.value=reduced?0:time*.001;uniforms.uRotation.value=gem.rotation.y;
  light.copy(floorGlow.position);light.y+=.04;
  shaftEnd.copy(gem.position);shaftEnd.y+=.15;
  shaftDirection.subVectors(shaftEnd,light).normalize();camera.getWorldDirection(shaftView);
  shaftSide.crossVectors(shaftDirection,shaftView);if(shaftSide.lengthSq()<.00001)shaftSide.set(1,0,0);shaftSide.normalize();
  for(let i=0;i<4;i++){const point=i<2?light:shaftEnd,width=(i%2===0?-1:1)*(i<2?.7:.48);shaftSide.toArray(shaftPositions,i*3);for(let axis=0;axis<3;axis++)shaftPositions[i*3+axis]=point.getComponent(axis)+shaftPositions[i*3+axis]*width;}
  shaftGeometry.attributes.position.needsUpdate=true;
  if(!traced||time-lastTrace>14&&(rotationChange>.00005||gem.position.distanceToSquared(previousPosition)>.00000001||light.distanceToSquared(previousLight)>.00001)){
   trace(gem);lastTrace=time;
  }
  easeReceivers(delta);
 },dispose(){scene.remove(floor,wall,backWall,backFloor,floorGlow,shaft);shaftGeometry.dispose();shaftMaterial.dispose();glowGeometry.dispose();glowMaterial.dispose();backdropGeometry.dispose();backWall.material.dispose();backFloor.material.dispose();floorGeometry.dispose();wallGeometry.dispose();material.dispose();rayGeometry.dispose();}};
}
