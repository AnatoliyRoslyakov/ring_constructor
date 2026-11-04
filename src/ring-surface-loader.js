import * as THREE from 'three';
let pending;
export function loadRingSurface(){
 pending??=(async()=>{
  const response=await fetch(new URL('../assets/models/cushion-setting.bin.gz',import.meta.url));
  if(!response.ok)throw new Error('Ring surface unavailable');
  const buffer=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  const [magic,vertices,indices]=new Uint32Array(buffer,0,3);
  if(magic!==0x52494e47||buffer.byteLength!==12+vertices*48+indices*4)throw new Error('Invalid ring surface');
  const geometry=new THREE.BufferGeometry();let offset=12;
  const attribute=()=>{const a=new THREE.BufferAttribute(new Float32Array(buffer,offset,vertices*3),3);offset+=vertices*12;return a;};
  geometry.setAttribute('position',attribute());geometry.setAttribute('normal',attribute());
  geometry.morphAttributes.position=[attribute()];geometry.morphAttributes.normal=[attribute()];
  geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer,offset,indices),1));geometry.computeBoundingSphere();return geometry;
 })();
 return pending.then(geometry=>geometry.clone());
}
