import * as THREE from 'three';
import {buildOrnament} from './ornament-geometry.js';
import {headGirdle} from './ring-design.js';
const TAU=Math.PI*2,V=(x,y,z)=>new THREE.Vector3(x,y,z),rad=a=>a*Math.PI/180,clamp=THREE.MathUtils.clamp;
function sample(rows,angle,closed){
 let a=closed?((angle%360)+360)%360:clamp(angle,rows[0][0],rows.at(-1)[0]),i=rows.findIndex((r,j)=>j<rows.length-1&&a>=r[0]&&a<rows[j+1][0]);if(i<0)i=rows.length-1;
 const get=j=>{if(closed){const n=rows.length,index=((j%n)+n)%n;return [rows[index][0]+Math.floor(j/n)*360,...rows[index].slice(1)];}return rows[clamp(j,0,rows.length-1)];};
 if(!closed&&i===rows.length-1)return [...rows.at(-1)];
 const p0=get(i-1),p1=get(i),p2=get(i+1),p3=get(i+2),length=p2[0]-p1[0],t=(a-p1[0])/length,t2=t*t,t3=t2*t;
 return [a,...p1.slice(1).map((_,k)=>{const c=k+1,m1=(p2[c]-p0[c])/Math.max(.01,p2[0]-p0[0])*length,m2=(p3[c]-p1[c])/Math.max(.01,p3[0]-p1[0])*length;return (2*t3-3*t2+1)*p1[c]+(t3-2*t2+t)*m1+(-2*t3+3*t2)*p2[c]+(t3-t2)*m2;})];
}
export function freeBandFrame(d,band,angle){
 const f=d.freeform,rows=band.stations,p=sample(rows,angle,band.closed),width=clamp(p[3],.65,12)*d.width/f.basis.width,depth=clamp(p[4],.7,3)*d.thickness/f.basis.thickness,roll=rad(p[5]),c=Math.cos(roll),s=Math.sin(roll),vertices=band.profile.map(([u,v])=>[u*depth*.5*c-v*width*.5*s,u*depth*.5*s+v*width*.5*c]);
 const minU=Math.min(...vertices.map(v=>v[0])),maxU=Math.max(...vertices.map(v=>v[0])),top=vertices.reduce((a,b)=>a[0]>b[0]?a:b),r=d.ringSize*.5-minU+Math.max(0,p[1])*d.thickness/f.basis.thickness;
 let offset=p[2]*d.width/f.basis.width,center=r;
 if(!band.closed){const a=rows[0][0],b=rows.at(-1)[0],t=(angle-a)/(b-a),blend=THREE.MathUtils.smoothstep(Math.min(t,1-t),0,.12),base=f.shank.bands.find(b=>b.id===band.join),root=freeBandFrame(d,base,angle);center=Math.max(d.ringSize*.5-minU,THREE.MathUtils.lerp(root.r,r,blend));offset=THREE.MathUtils.lerp(root.offset,offset,blend);}
 return {r:center,offset,width,depth,vertices,surface:center+maxU,topOffset:offset+top[1],point:V(Math.cos(rad(angle))*center,Math.sin(rad(angle))*center,offset)};
}
function loftBand(d,band){
 const steps=192,positions=[],indices=[],profile=band.profile,m=profile.length,from=band.closed?0:band.stations[0][0],to=band.closed?360:band.stations.at(-1)[0];
 for(let i=0;i<=steps;i++){const angle=THREE.MathUtils.lerp(from,to,i/steps),frame=freeBandFrame(d,band,angle),c=Math.cos(rad(angle)),s=Math.sin(rad(angle));for(let j=0;j<=m;j++){const [u,v]=frame.vertices[j%m];positions.push(c*(frame.r+u),s*(frame.r+u),frame.offset+v);}}
 for(let i=0;i<steps;i++)for(let j=0;j<m;j++){const a=i*(m+1)+j,b=a+m+1;indices.push(a,b,a+1,b,b+1,a+1);}
 if(!band.closed){const tris=THREE.ShapeUtils.triangulateShape(profile.map(p=>new THREE.Vector2(...p)),[]);for(const face of tris){indices.push(...[...face].reverse());indices.push(...face.map(n=>steps*(m+1)+n));}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();const n=g.attributes.normal;
 const stitch=(a,b)=>{const normal=V(n.getX(a)+n.getX(b),n.getY(a)+n.getY(b),n.getZ(a)+n.getZ(b)).normalize();n.setXYZ(a,...normal);n.setXYZ(b,...normal);};
 for(let i=0;i<=steps;i++)stitch(i*(m+1),i*(m+1)+m);if(band.closed)for(let j=0;j<=m;j++)stitch(j,steps*(m+1)+j);return g;
}
export function radialScale(shape,y){
 const levels=['emerald','asscher'].includes(shape)?[[-.44,0],[-.30,.40],[-.14,.72],[-.015,1],[.015,1],[.13,.72],[.23,.56]]:[[-.44,0],[-.22,.64],[-.015,1],[.015,1],[.23,.57]];
 if(y<levels[0][0]||y>levels.at(-1)[0])return null;
 for(let i=1;i<levels.length;i++)if(y<=levels[i][0]){const a=levels[i-1],b=levels[i];return THREE.MathUtils.lerp(a[1],b[1],(y-a[0])/(b[0]-a[0]));}return null;
}
function sweep(points,radius,profile,parent,material,{tip=1,closed=false,guard=null}={}){
 const curve=new THREE.CatmullRomCurve3(points,closed,'centripetal'),count=closed?128:64,sampled=curve.getSpacedPoints(count).map((p,i)=>guard&&i>0&&i<count?guard(p,radius*THREE.MathUtils.lerp(1,tip,i/count)):p),path=new THREE.CatmullRomCurve3(sampled,closed,'centripetal'),frames=path.computeFrenetFrames(count,closed),positions=[],indices=[],m=profile.length;
 for(let i=0;i<=count;i++){const center=path.getPointAt(i/count),r=radius*THREE.MathUtils.lerp(1,tip,Math.pow(i/count,3));for(let j=0;j<=m;j++){const [u,v]=profile[j%m],p=center.clone().addScaledVector(frames.normals[i],u*r).addScaledVector(frames.binormals[i],v*r);positions.push(...p);}}
 for(let i=0;i<count;i++)for(let j=0;j<m;j++){const a=i*(m+1)+j,b=a+m+1;indices.push(a,b,a+1,b,b+1,a+1);}
 if(!closed)for(const face of THREE.ShapeUtils.triangulateShape(profile.map(p=>new THREE.Vector2(...p)),[])){indices.push(...[...face].reverse());indices.push(...face.map(n=>count*(m+1)+n));}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();const normals=g.attributes.normal;const stitch=(a,b)=>{const n=V(normals.getX(a)+normals.getX(b),normals.getY(a)+normals.getY(b),normals.getZ(a)+normals.getZ(b)).normalize();normals.setXYZ(a,...n);normals.setXYZ(b,...n);};for(let i=0;i<=count;i++)stitch(i*(m+1),i*(m+1)+m);if(closed)for(let j=0;j<=m;j++)stitch(j,count*(m+1)+j);const mesh=new THREE.Mesh(g,material);parent.add(mesh);return mesh;
}
const circle=Array.from({length:12},(_,i)=>[Math.cos(i/12*TAU),Math.sin(i/12*TAU)]);
export function fittedRimGeometry(contour,surfaceAt,shape,girdle,size,{from=0,to=360,depth=.19,wall=.36,height=.035}={}){
 const closed=to-from>=359.9,steps=Math.max(12,Math.ceil((to-from)/3)),positions=[],indices=[];
 // A continuous, pavilion-fitted wall with a rounded retaining lip and solid ends.
 const section=[[-depth,0],[-.015,0],[.015,0],[height,.025],[height,.62],[.015,1],[-.015,1],[-depth,.8]],m=section.length;
 for(let i=0;i<=steps;i++){
  const edge=surfaceAt(contour,rad(from+(to-from)*i/steps)),out=edge.clone().normalize();
  for(const [h,w] of section){const p=edge.clone().multiplyScalar(radialScale(shape,h)).addScaledVector(out,.025+wall*w);positions.push(p.x,girdle+h*size,p.y);}
 }
 for(let i=0;i<steps;i++)for(let j=0;j<m;j++){const a=i*m+j,b=i*m+(j+1)%m,c=a+m,e=b+m;indices.push(a,b,c,b,e,c);}
 if(!closed){const cap=THREE.ShapeUtils.triangulateShape(section.map(([h,w])=>new THREE.Vector2(h,w)),[]);for(const f of cap){indices.push(...[...f].reverse());indices.push(...f.map(j=>steps*m+j));}}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);
 // Outward winding, including caps; important for metal reflections and GLB exports.
 let volume=0;for(let i=0;i<indices.length;i+=3){const p=indices.slice(i,i+3).map(j=>V(...positions.slice(j*3,j*3+3)));volume+=p[0].dot(p[1].cross(p[2]));}
 if(volume<0)for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];
 geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
export function buildFreeMetal(d,dim,parent,material,{outline,surfaceAt,offsetContour}){
 const f=d.freeform,outer=d.ringSize*.5+d.thickness,girdle=headGirdle(d),scale=d.gemSize/f.basis.gemSize;
 // Use the same actual transformed gemstone contour as the ordinary renderer.
 const raw=outline(d.shape),nativeRatio=Math.max(...raw.map(p=>p.y))-Math.min(...raw.map(p=>p.y));
 const contour=raw.map(p=>{p.y*=d.gemRatio/nativeRatio;p.multiplyScalar(d.gemSize);return d.orientation==='east'?new THREE.Vector2(-p.y,p.x):p;});
 const surface=(angle,y)=>{const h=clamp(y,-.439,.229),r=radialScale(d.shape,h),p=surfaceAt(contour,rad(angle)).multiplyScalar(r);return V(p.x,girdle+h*d.gemSize,p.y);};
 const normal=(angle,y)=>{const tangent=surface(angle+.1,y).sub(surface(angle-.1,y)),vertical=surface(angle,y+.0002).sub(surface(angle,y-.0002));return vertical.cross(tangent).normalize();};
 const contact=(angle,y,r)=>surface(angle,y).addScaledVector(normal(angle,y),r*.82);
 const guard=(p,r)=>{const h=(p.y-girdle)/d.gemSize,k=radialScale(d.shape,h);if(k!==null){const angle=Math.atan2(p.z,p.x),edge=surfaceAt(contour,angle).multiplyScalar(k),length=Math.hypot(p.x,p.z),minimum=edge.length()+r*.82;if(length<minimum){p.x=Math.cos(angle)*minimum;p.z=Math.sin(angle)*minimum;}}if(p.y<outer){const length=Math.hypot(p.x,p.y),minimum=d.ringSize*.5+r;if(length<minimum){p.x*=minimum/Math.max(.001,length);p.y*=minimum/Math.max(.001,length);}}return p;};
 const point=([x,y,z])=>V(x*dim.spanX*.5,outer+y*(girdle-outer),z*dim.spanZ*.5);
 if(f.shank)for(const band of f.shank.bands)parent.add(new THREE.Mesh(loftBand(d,band),material));
 buildOrnament(d,parent,material,freeBandFrame);
 if(d.centerStone===false||!f.mount)return;
 const seat=f.mount.seat,seatRadius=clamp(seat.radius*scale,.13,.65),seatAt=angle=>contact(angle,-seat.depth,seatRadius),seatPoints=Array.from({length:64},(_,i)=>seatAt(i/64*360));
 sweep(seatPoints,seatRadius,circle,parent,material,{closed:true});
 for(const link of f.mount.links){const band=f.shank.bands.find(b=>b.id===link.band),start=freeBandFrame(d,band,link.at).point,end=seatAt(link.to);sweep([start,...link.controls.map(point),end],clamp(link.radius*scale,.16,1.1),link.profile,parent,material,{guard:(p,r)=>{p.y=Math.min(p.y,end.y);return guard(p,r);}});}
 if(!f.setting)return;
 for(const claw of f.setting.claws){const radius=clamp(claw.radius*scale,.15,.7),tipRadius=radius*claw.tip,start=seatAt(claw.root),end=contact(claw.angle,claw.contact,tipRadius);sweep([start,...claw.controls.map(point),end],radius,claw.profile,parent,material,{tip:claw.tip,guard:(p,r)=>{p.y=clamp(p.y,start.y,end.y);return guard(p,r);}});const cap=new THREE.Mesh(new THREE.SphereGeometry(tipRadius,12,10),material);cap.position.copy(end);parent.add(cap);}
 for(const rim of f.setting.rims){const radius=clamp(rim.radius*scale,.14,.65);parent.add(new THREE.Mesh(fittedRimGeometry(contour,surfaceAt,d.shape,girdle,d.gemSize,{from:rim.from,to:rim.to,depth:seat.depth,wall:radius*1.6,height:rim.height}),material));}
 if(d.halo!=='none'){
  const hidden=d.halo==='hidden',row=offsetContour(hidden?contour.map(p=>p.clone().multiplyScalar(radialScale(d.shape,-.20))):contour,d.haloSize*(hidden?.62:d.halo==='double'?1.79:.67)),y=(hidden?girdle-d.gemSize*.20:girdle+.08)-d.haloSize*.34;
  for(const angle of [0,90,180,270]){const start=seatAt(angle),edge=surfaceAt(row,rad(angle)),end=V(edge.x,y,edge.y);sweep([start,guard(start.clone().lerp(end,.55),.18),end],.18,circle,parent,material,{guard});}
 }
}
