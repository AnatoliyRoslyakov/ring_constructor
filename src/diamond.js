import * as THREE from 'three';

export function diamondGeometry(){
  // Round brilliant: one table, 32 crown facets and 24 pavilion facets.
  // Each kite is planar, so triangulation never creates an extra optical facet.
  const positions=[],point=(r,y,a)=>new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r);
  function face(...vertices){
    const normal=vertices[1].clone().sub(vertices[0]).cross(vertices[2].clone().sub(vertices[0]));
    const center=vertices.reduce((sum,v)=>sum.add(v),new THREE.Vector3()).divideScalar(vertices.length);center.y+=.10;
    if(normal.dot(center)<0)vertices.reverse();
    for(let i=1;i<vertices.length-1;i++)positions.push(...vertices[0].toArray(),...vertices[i].toArray(),...vertices[i+1].toArray());
  }
  const table=[],stars=[],upper=[],lower=[],halves=[];
  const starY=.22+(.014-.22)*(.48*Math.cos(Math.PI/8)-.36)/(.64-.36);
  const lowerY=-.53+(.53-.014)*.43*Math.cos(Math.PI/8)/.64;
  for(let i=0;i<8;i++){const a=i*Math.PI/4;table.push(point(.36,.22,a));stars.push(point(.48,starY,a+Math.PI/8));halves.push(point(.43,lowerY,a+Math.PI/8));}
  for(let i=0;i<16;i++){upper.push(point(.64,.014,i*Math.PI/8));lower.push(point(.64,-.014,i*Math.PI/8));}
  face(...table);
  for(let i=0;i<8;i++){
    const j=(i+1)%8,k=(i+7)%8,a=i*2,b=(a+1)%16,c=(a+2)%16;
    face(table[i],table[j],stars[i]);face(table[i],stars[i],upper[a],stars[k]);
    face(stars[i],upper[b],upper[a]);face(stars[i],upper[c],upper[b]);
    face(point(0,-.53,0),halves[k],lower[a],halves[i]);
    face(halves[i],lower[a],lower[b]);face(halves[i],lower[b],lower[c]);
  }
  for(let i=0;i<16;i++)face(upper[i],lower[i],lower[(i+1)%16],upper[(i+1)%16]);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();return g;
}

export function createDiamondEnvironment(renderer){
 const gemStudio=new THREE.Scene();gemStudio.background=new THREE.Color('#8e98a7');
 const envCanvas=document.createElement('canvas');envCanvas.width=1024;envCanvas.height=512;const ec=envCanvas.getContext('2d');ec.fillStyle='#d8d9dc';ec.fillRect(0,0,1024,512);const tones=['#fafcff','#343b47','#c2c5cc','#ffffff','#747b85','#f9f7ef'];for(let i=0;i<36;i++){ec.fillStyle=tones[i%tones.length];const x=(i*167)%1024,y=(i*79)%512;ec.fillRect(x,y,40+(i*31)%180,70+(i*23)%230)}const envTexture=new THREE.CanvasTexture(envCanvas);envTexture.colorSpace=THREE.SRGBColorSpace;gemStudio.add(new THREE.Mesh(new THREE.SphereGeometry(15,48,32),new THREE.MeshBasicMaterial({map:envTexture,side:THREE.BackSide})));
 for(const [x,y,z,sx,sy,color] of [[-3,3,3,3,5,0xffffff],[3,1,3,1,4,0xc6d2e3],[0,4,0,5,2,0xffffff],[1,-3,2,2,2,0xf0e6d0],[-3,0,-2,2,5,0x90959f],[3,3,-3,2,2,0xffffff]]){const panel=new THREE.Mesh(new THREE.PlaneGeometry(sx,sy),new THREE.MeshBasicMaterial({color}));panel.position.set(x,y,z);panel.lookAt(0,0,0);gemStudio.add(panel)}
 const gemTarget=new THREE.WebGLCubeRenderTarget(512,{generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter,type:THREE.HalfFloatType});const gemCamera=new THREE.CubeCamera(.1,30,gemTarget);gemCamera.update(renderer,gemStudio);
 gemStudio.traverse(object=>{if(object.isMesh){object.geometry.dispose();object.material.dispose();}});envTexture.dispose();
 return gemTarget;
}
