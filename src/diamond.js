import * as THREE from 'three';

export function diamondGeometry(){
  const levels=[{r:0,y:-.64,n:16,o:0},{r:.4,y:-.26,n:16,o:Math.PI/16},{r:.64,y:-.025,n:16,o:0},{r:.64,y:.025,n:16,o:0},{r:.4,y:.31,n:16,o:Math.PI/16}];
  const positions=[];const push=(a,b,c)=>positions.push(...a,...b,...c);
  const point=(l,i)=>[Math.cos(i/16*Math.PI*2+l.o)*l.r,l.y,Math.sin(i/16*Math.PI*2+l.o)*l.r];
  for(let l=0;l<levels.length-1;l++)for(let i=0;i<16;i++){const a=point(levels[l],i),b=point(levels[l],i+1),c=point(levels[l+1],i),d=point(levels[l+1],i+1);push(a,c,b);push(b,c,d)}
  for(let i=0;i<16;i++)push([0,.31,0],point(levels[4],i+1),point(levels[4],i));
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
