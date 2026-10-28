import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
const TAU=Math.PI*2,V=(x,y,z)=>new THREE.Vector3(x,y,z),clamp=THREE.MathUtils.clamp;
// Build one connected relief cell in an unwrapped strip, then wrap the mesh itself.
// Spaces between rails/stems/leaves are real holes; no textures or CSG runtime.
export function buildOrnament(d,parent,material,bandFrame){
 const f=d.freeform,o=f?.ornament;if(!o)return;
 const inner=d.ringSize*.5,radius=inner+d.thickness*.58,length=TAU*radius/o.repeat,axial=d.width*.5,radial=d.thickness/f.basis.thickness,widthScale=d.width/f.basis.width,pieces=[];
 const wrap=(p,angle)=>{const a=angle+p.x/radius,r=Math.max(inner+.035,radius+p.z);return V(Math.cos(a)*r,Math.sin(a)*r,p.y);};
 for(let cell=0;cell<o.repeat;cell++){
  const angle=(o.offset/360+cell/o.repeat)*TAU,nodes=new Map();
  const anchor=(id,p)=>{
   const band=f.shank.bands.find(b=>b.id===id);
   if(band){const a=(angle+p.x/radius)*180/Math.PI,frame=bandFrame(d,band,a);return V(p.x,frame.offset,frame.r-radius);}
   const points=nodes.get(id);return points.reduce((best,q)=>q.distanceToSquared(p)<best.distanceToSquared(p)?q:best,points[0]).clone();
  };
  for(const m of o.motifs){
   const input=m.path.map(([u,v,h,w])=>({p:V(u*length,v*axial,h*radial),w:w*widthScale})),points=input.map(p=>p.p),first=points[0].clone(),last=points.at(-1).clone();
   const startDelta=anchor(m.anchor,first).sub(first),endDelta=m.endAnchor?anchor(m.endAnchor,last).sub(last):V(0,0,0);
   for(let i=0;i<points.length;i++){const t=i/(points.length-1);points[i].addScaledVector(startDelta,1-THREE.MathUtils.smoothstep(t,0,.25)).addScaledVector(endDelta,THREE.MathUtils.smoothstep(t,.75,1));}
   const path=new THREE.CatmullRomCurve3(points,false,'centripetal'),steps=clamp(Math.ceil(path.getLength()*8),28,Math.min(96,Math.floor(76000/(o.repeat*o.motifs.length*17))-1)),sides=m.kind==='leaf'?16:12,centers=[],positions=[],colors=[],indices=[],depth=m.depth*radial;
   for(let i=0;i<=steps;i++){
    const t=i/steps,p=path.getPoint(t),tangent=path.getTangent(t),side=new THREE.Vector2(-tangent.y,tangent.x).normalize();centers.push(p.clone());
    const at=t*(input.length-1),lo=Math.floor(at),w=THREE.MathUtils.lerp(input[lo].w,input[Math.min(lo+1,input.length-1)].w,at-lo)*(m.kind==='leaf'&&m.lobes?1-.24*Math.pow(Math.sin(t*m.lobes*Math.PI),2):1);
    for(let j=0;j<=sides;j++){
     const a=j/sides*TAU,c=Math.cos(a),s=Math.sin(a),width=w*.5*c;
     const relief=m.kind==='leaf'?(s>=0?depth*(.5*Math.pow(s,.7)+.5*m.ridge*(1-Math.abs(c))):s*depth*.22):s*depth*.5;
     positions.push(...wrap(V(p.x+side.x*width,p.y+side.y*width,p.z+relief),angle));const shade=(m.kind==='leaf'?.56:.7)+(m.kind==='leaf'?.44:.3)*Math.max(0,s);colors.push(shade,shade,shade);
    }
   }
   for(let i=0;i<steps;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+sides+1;indices.push(a,a+1,b,b,a+1,b+1);}
   for(const end of [0,1]){const base=end*steps*(sides+1),center=positions.length/3;positions.push(...wrap(centers[end?steps:0],angle));colors.push(.64,.64,.64);for(let j=0;j<sides;j++)indices.push(...(end?[center,base+j,base+j+1]:[center,base+j+1,base+j]));}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();const n=g.attributes.normal;
   for(let i=0;i<=steps;i++){const a=i*(sides+1),b=a+sides,v=V(n.getX(a)+n.getX(b),n.getY(a)+n.getY(b),n.getZ(a)+n.getZ(b)).normalize();n.setXYZ(a,...v);n.setXYZ(b,...v);}
   pieces.push(g);nodes.set(m.id,centers);
  }
 }
 const geometry=mergeGeometries(pieces);for(const g of pieces)g.dispose();
 if(geometry){const reliefMaterial=material.clone();reliefMaterial.vertexColors=true;reliefMaterial.envMapIntensity=.85;const mesh=new THREE.Mesh(geometry,reliefMaterial);mesh.userData.ownedMaterial=true;mesh.name='Authored openwork relief';parent.add(mesh);}
}
