import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';

export function createSatinReflection(world,{compact=false,exclude=[]}={}){
 const mirror=new Reflector(new THREE.PlaneGeometry(14,12),{
  textureWidth:compact?640:1024,textureHeight:compact?640:1024,clipBias:.002,multisample:0,
  shader:{
   name:'OriginSatinReflection',
   uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null},uStrength:{value:.20}},
   vertexShader:`uniform mat4 textureMatrix;varying vec4 vReflection;varying vec2 vFloor;
    void main(){vFloor=position.xy;vReflection=textureMatrix*vec4(position,1.);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
   fragmentShader:`uniform sampler2D tDiffuse;uniform float uStrength;varying vec4 vReflection;varying vec2 vFloor;
    void main(){
     vec2 uv=vReflection.xy/vReflection.w;
     if(any(lessThan(uv,vec2(0.)))||any(greaterThan(uv,vec2(1.))))discard;
     float front=max(0.,-vFloor.y);
     vec2 blur=vec2(.0018+min(front,4.)*.0012);
     vec4 reflection=texture2D(tDiffuse,uv)*.20;
     reflection+=(texture2D(tDiffuse,uv+vec2(blur.x,0.))+texture2D(tDiffuse,uv-vec2(blur.x,0.))+texture2D(tDiffuse,uv+vec2(0.,blur.y))+texture2D(tDiffuse,uv-vec2(0.,blur.y)))*.12;
     reflection+=(texture2D(tDiffuse,uv+blur)+texture2D(tDiffuse,uv-blur)+texture2D(tDiffuse,uv+vec2(blur.x,-blur.y))+texture2D(tDiffuse,uv+vec2(-blur.x,blur.y)))*.08;
     float edge=1.-smoothstep(.55,1.,length(vFloor/vec2(4.2,4.)));
     float fade=exp(-front*.55)*edge;
     gl_FragColor=vec4(reflection.rgb,reflection.a*uStrength*fade);
     #include <tonemapping_fragment>
     #include <colorspace_fragment>
    }`
  }
 });
 mirror.rotation.x=-Math.PI/2;mirror.position.y=-1.65;
 mirror.material.transparent=true;mirror.material.depthWrite=false;mirror.renderOrder=3;
 const reflect=mirror.onBeforeRender;
 mirror.onBeforeRender=function(renderer,scene,camera){
  const alpha=renderer.getClearAlpha(),visibility=exclude.map(object=>object.visible);
  exclude.forEach(object=>{object.visible=false;});renderer.setClearAlpha(0);
  try{reflect.call(this,renderer,scene,camera);}
  finally{renderer.setClearAlpha(alpha);exclude.forEach((object,i)=>{object.visible=visibility[i];});}
 };
 world.add(mirror);
 return mirror;
}
