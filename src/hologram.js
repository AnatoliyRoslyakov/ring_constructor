import * as THREE from 'three';
import { refractionMaterial } from './diamond-material.js';
import { diamondGeometry, createDiamondEnvironment } from './diamond.js';
import { createGemCaustics } from './gem-caustics.js';

export function setupHologram(root,{reduced=false}={}){
 if(!root)return;
 const canvas=root.querySelector('canvas'),host=root.querySelector('.holo-view'),buttons=[...root.querySelectorAll('[data-holo-mode]')];
 let renderer,scene,camera,gem,edge,points,scaleDial,uniforms,caustics,active=false,dirty=true,last=0,elapsed=0,mode=0,drag=null,spin=0,realMaterial,realMesh,holoMesh,reveal=0,revealTarget=reduced?1:0;
 const pointer={x:0,y:0},angle={x:0,y:0};
 const tint=new THREE.Color('#c5b69c'),accent=new THREE.Color('#f1dfb6');
 function init(){
  if(renderer)return;
  try{
   renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
   scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(36,1,.1,40);camera.position.set(0,1.25,6.3);camera.lookAt(0,-.1,0);
   const geometry=diamondGeometry();geometry.translate(0,.165,0);geometry.scale(1.55,1.55,1.55);
   uniforms={uTime:{value:0},uScan:{value:0},uSpectrum:{value:0},uWire:{value:0},uReveal:{value:0}};
   const material=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:`varying vec3 vLocal;varying vec3 vWorld;varying vec3 vNormal;void main(){vLocal=position;vec4 world=modelMatrix*vec4(position,1.);vWorld=world.xyz;vNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*world;}`,
    fragmentShader:`varying vec3 vLocal;varying vec3 vWorld;varying vec3 vNormal;uniform float uTime;uniform float uScan;uniform float uSpectrum;uniform float uWire;uniform float uReveal;
    void main(){
     vec3 viewDir=normalize(cameraPosition-vWorld);float fresnel=pow(1.-abs(dot(normalize(vNormal),viewDir)),2.4);
     float wave=vLocal.x*1.8+vLocal.y*2.5+vLocal.z*.8+uTime*.17;
     vec3 opal=.5+.5*cos(wave+vec3(.3,2.3,4.4));
     vec3 pearl=mix(vec3(.32,.46,.46),vec3(.68,.52,.27),fresnel);
     vec3 color=mix(pearl,mix(vec3(.35,.70,.61),vec3(.62,.43,.78),opal.x),.30+uSpectrum*.55);
     float scan=exp(-pow((vLocal.y-uScan)*16.,2.));
     float lines=pow(.5+.5*sin(vLocal.y*190.+uTime*.55),14.);
     float facing=.58+.42*max(dot(normalize(vNormal),normalize(vec3(-1.,2.,3.))),0.);
     color*=facing;float alpha=(.24+fresnel*.49+scan*.24+lines*.035+uSpectrum*.09)*(1.-uWire*.82);
     color+=scan*vec3(.20,.16,.10);gl_FragColor=vec4(color,alpha*uReveal);
     #include <tonemapping_fragment>
     #include <colorspace_fragment>
    }`});
   const cube=createDiamondEnvironment(renderer);
   realMaterial=refractionMaterial(geometry,cube.texture);realMaterial.transparent=true;realMaterial.depthWrite=true;realMaterial.uniforms.lightStrength.value=.28;
   gem=new THREE.Group();scene.add(gem);realMesh=new THREE.Mesh(geometry,realMaterial);holoMesh=new THREE.Mesh(geometry,material);gem.add(realMesh,holoMesh);
   caustics=createGemCaustics(scene,geometry,{reduced});
   edge=new THREE.LineSegments(new THREE.EdgesGeometry(geometry,1),new THREE.LineBasicMaterial({color:tint,transparent:true,opacity:.52}));gem.add(edge);
   points=new THREE.Points(geometry,new THREE.PointsMaterial({color:0xf7f3e7,size:.027,transparent:true,opacity:.52,sizeAttenuation:true}));gem.add(points);
   scaleDial=new THREE.Group();scaleDial.position.y=-1.35;scene.add(scaleDial);
   const ticks=[],rim=[];
   for(let i=0;i<120;i++){
    const angle=i/120*Math.PI*2,major=i%10===0,inner=major?1.56:1.64,outer=1.71;
    ticks.push(Math.cos(angle)*inner,0,Math.sin(angle)*inner,Math.cos(angle)*outer,0,Math.sin(angle)*outer);
   }
   for(let i=0;i<192;i++){const angle=i/192*Math.PI*2;rim.push(Math.cos(angle)*1.51,0,Math.sin(angle)*1.51);}
   const tickGeometry=new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(ticks,3));
   const rimGeometry=new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(rim,3));
   scaleDial.add(new THREE.LineSegments(tickGeometry,new THREE.LineBasicMaterial({color:accent,transparent:true,opacity:.72,toneMapped:false})),new THREE.LineLoop(rimGeometry,new THREE.LineBasicMaterial({color:accent,transparent:true,opacity:.36,toneMapped:false})));
   canvas.classList.add('holo-light-canvas');root.prepend(canvas);
   root.classList.add('holo-ready');resize();
  }catch(error){root.classList.add('holo-fallback');console.warn('ORIGIN hologram unavailable:',error);}
 }
 function resize(){if(!renderer)return;const w=host.clientWidth,h=host.clientHeight,rw=root.clientWidth,rh=root.clientHeight;if(!w||!h||!rw||!rh)return;const box=host.getBoundingClientRect(),section=root.getBoundingClientRect();renderer.setSize(rw,rh,false);camera.setViewOffset(w,h,section.left-box.left,section.top-box.top,rw,rh);camera.updateProjectionMatrix();const glowX=-.9,glowY=1-(rh-Math.min(100,rh*.12))/rh*2;caustics.setGlowAnchor(camera,glowX,glowY);dirty=true;}
 const warmupObserver=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){init();dirty=true;warmupObserver.disconnect();}},{rootMargin:'180px'});warmupObserver.observe(host);
 const observer=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active){init();dirty=true;}});observer.observe(root);
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resizeObserver.observe(root);
 buttons.forEach(button=>button.addEventListener('click',()=>{mode=Number(button.dataset.holoMode);revealTarget=1;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));root.dataset.mode=String(mode);dirty=true;}));
 host.addEventListener('pointermove',event=>{
  if(event.pointerType==='touch'&&drag===null)return;
  const rect=host.getBoundingClientRect();pointer.x=(event.clientX-rect.left)/rect.width*2-1;pointer.y=(event.clientY-rect.top)/rect.height*2-1;
  if(drag!==null){spin+=(event.clientX-drag)*.008;drag=event.clientX;}dirty=true;
 });
 host.addEventListener('pointerleave',()=>{pointer.x=pointer.y=0;dirty=true;});
 host.addEventListener('pointerdown',event=>{if(event.pointerType==='mouse'&&event.button!==0)return;drag=event.clientX;host.setPointerCapture(event.pointerId);host.classList.add('is-dragging');});
 const release=()=>{drag=null;host.classList.remove('is-dragging');};host.addEventListener('pointerup',release);host.addEventListener('pointercancel',release);host.addEventListener('lostpointercapture',release);
 host.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();spin+=event.key==='ArrowLeft'?-.18:.18;dirty=true;}if(event.key==='Home'){spin=0;dirty=true;}});
 return {setReveal(value){revealTarget=reduced?1:THREE.MathUtils.clamp(value,0,1);dirty=true;},update(time){
  if(!active||!renderer||document.hidden)return;
  if(reduced&&!dirty)return;
  const delta=Math.min(.05,Math.max(0,(time-last)/1000));last=time;elapsed+=delta;
  const damping=reduced?1:1-Math.exp(-5*delta);
  angle.x+=(pointer.y*.13-angle.x)*damping;angle.y+=(pointer.x*.21-angle.y)*damping;
  const phase=reduced?0:elapsed;
  gem.rotation.set(.16+angle.x,.42+spin+angle.y+Math.sin(phase*.16)*.18,-.12);
  gem.position.y=reduced?0:Math.sin(phase*.7)*.025;
  scaleDial.rotation.y=gem.rotation.y;
  uniforms.uSpectrum.value+=(Number(mode===2)-uniforms.uSpectrum.value)*damping;
  uniforms.uWire.value+=(Number(mode===1)-uniforms.uWire.value)*damping;
  reveal+=(revealTarget-reveal)*damping;uniforms.uReveal.value=reveal*(.06+uniforms.uWire.value*.86+uniforms.uSpectrum.value*.12);
  camera.updateMatrixWorld();realMaterial.uniforms.viewMatrixInverse.value.copy(camera.matrixWorld);realMaterial.uniforms.projectionMatrixInverse.value.copy(camera.projectionMatrixInverse);realMaterial.uniforms.resolution.value.set(canvas.width,canvas.height);realMaterial.uniforms.opacity.value=1-uniforms.uWire.value*.78;realMesh.visible=true;holoMesh.visible=reveal>.005;scaleDial.visible=reveal>.01;edge.visible=points.visible=reveal>.005;realMaterial.uniforms.aberrationStrength.value=.018+uniforms.uSpectrum.value*.04;realMaterial.uniforms.lightDirection.value.set(pointer.x*.8-.4,1.1-pointer.y*.5,1.5).normalize();
  uniforms.uTime.value=phase;uniforms.uScan.value=reduced?.15:Math.sin(phase*.64)*1.18;
  edge.material.opacity=(.045+uniforms.uWire.value*.78)*reveal;points.material.opacity=(.045+uniforms.uWire.value*.48)*reveal;
  caustics.update(gem,camera,{time,delta,reveal,spectrum:uniforms.uSpectrum.value,wire:uniforms.uWire.value,interacting:drag!==null,pointerX:pointer.x,pointerY:pointer.y});
  caustics.getLightDirection(realMaterial.uniforms.lightDirection.value,gem.position);
  renderer.render(scene,camera);dirty=false;
 }};
}
