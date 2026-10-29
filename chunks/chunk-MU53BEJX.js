import{A as mn,B as dn,C as yn,D as Zt,E as Kt,Ea as An,L as xn,P as K,Qa as wn,R as D,Ra as Bn,Wa as En,Z as q,ba as $t,ca as hn,d as De,da as rt,e as Xt,ea as W,f as an,ga as gt,ha as gn,ja as vn,l as it,ma as jt,oa as Tn,pa as Fe,pb as Sn,q as ln,qa as Re,r as Me,s as Ne,t as fn,ta as Nt,tb as j,u as un,v as Wt,w as ut,x as pt,xb as _n,y as pn,z as ht}from"./chunk-SSH4HTWW.js";var vt=Math.pow(2,-24),Ft=Symbol("SKIP_GENERATION"),Jt={strategy:0,maxDepth:40,targetLeafSize:10,useSharedArrayBuffer:!1,setBoundingBox:!0,onProgress:null,indirect:!1,verbose:!0,range:null,[Ft]:!1};function U(i,t,e){return e.min.x=t[i],e.min.y=t[i+1],e.min.z=t[i+2],e.max.x=t[i+3],e.max.y=t[i+4],e.max.z=t[i+5],e}function Rt(i){let t=-1,e=-1/0;for(let n=0;n<3;n++){let r=i[n+3]-i[n];r>e&&(e=r,t=n)}return t}function Ce(i,t){t.set(i)}function Oe(i,t,e){let n,r;for(let s=0;s<3;s++){let o=s+3;n=i[s],r=t[s],e[s]=n<r?n:r,n=i[o],r=t[o],e[o]=n>r?n:r}}function Ct(i,t,e){for(let n=0;n<3;n++){let r=t[i+2*n],s=t[i+2*n+1],o=r-s,f=r+s;o<e[n]&&(e[n]=o),f>e[n+3]&&(e[n+3]=f)}}function Tt(i){let t=i[3]-i[0],e=i[4]-i[1],n=i[5]-i[2];return 2*(t*e+e*n+n*t)}function F(i,t){return t[i+15]===65535}function C(i,t){return t[i+6]}function z(i,t){return t[i+14]}function O(i){return i+8}function L(i,t){let e=t[i+6];return i+e*8}function ot(i,t){return t[i+7]}function Qt(i,t,e,n,r){let s=1/0,o=1/0,f=1/0,c=-1/0,m=-1/0,u=-1/0,a=1/0,l=1/0,p=1/0,g=-1/0,v=-1/0,T=-1/0,A=i.offset||0;for(let d=(t-A)*6,y=(t+e-A)*6;d<y;d+=6){let h=i[d+0],x=i[d+1],E=h-x,w=h+x;E<s&&(s=E),w>c&&(c=w),h<a&&(a=h),h>g&&(g=h);let _=i[d+2],b=i[d+3],B=_-b,P=_+b;B<o&&(o=B),P>m&&(m=P),_<l&&(l=_),_>v&&(v=_);let S=i[d+4],I=i[d+5],M=S-I,N=S+I;M<f&&(f=M),N>u&&(u=N),S<p&&(p=S),S>T&&(T=S)}n[0]=s,n[1]=o,n[2]=f,n[3]=c,n[4]=m,n[5]=u,r[0]=a,r[1]=l,r[2]=p,r[3]=g,r[4]=v,r[5]=T}var et=32,Di=(i,t)=>i.candidate-t.candidate,st=new Array(et).fill().map(()=>({count:0,bounds:new Float32Array(6),rightCacheBounds:new Float32Array(6),leftCacheBounds:new Float32Array(6),candidate:0})),te=new Float32Array(6);function In(i,t,e,n,r,s){let o=-1,f=0;if(s===0)o=Rt(t),o!==-1&&(f=(t[o]+t[o+3])/2);else if(s===1)o=Rt(i),o!==-1&&(f=Mi(e,n,r,o));else if(s===2){let c=Tt(i),m=1.25*r,u=e.offset||0,a=(n-u)*6,l=(n+r-u)*6;for(let p=0;p<3;p++){let g=t[p],A=(t[p+3]-g)/et;if(r<et/4){let d=[...st];d.length=r;let y=0;for(let x=a;x<l;x+=6,y++){let E=d[y];E.candidate=e[x+2*p],E.count=0;let{bounds:w,leftCacheBounds:_,rightCacheBounds:b}=E;for(let B=0;B<3;B++)b[B]=1/0,b[B+3]=-1/0,_[B]=1/0,_[B+3]=-1/0,w[B]=1/0,w[B+3]=-1/0;Ct(x,e,w)}d.sort(Di);let h=r;for(let x=0;x<h;x++){let E=d[x];for(;x+1<h&&d[x+1].candidate===E.candidate;)d.splice(x+1,1),h--}for(let x=a;x<l;x+=6){let E=e[x+2*p];for(let w=0;w<h;w++){let _=d[w];E>=_.candidate?Ct(x,e,_.rightCacheBounds):(Ct(x,e,_.leftCacheBounds),_.count++)}}for(let x=0;x<h;x++){let E=d[x],w=E.count,_=r-E.count,b=E.leftCacheBounds,B=E.rightCacheBounds,P=0;w!==0&&(P=Tt(b)/c);let S=0;_!==0&&(S=Tt(B)/c);let I=1+1.25*(P*w+S*_);I<m&&(o=p,m=I,f=E.candidate)}}else{for(let h=0;h<et;h++){let x=st[h];x.count=0,x.candidate=g+A+h*A;let E=x.bounds;for(let w=0;w<3;w++)E[w]=1/0,E[w+3]=-1/0}for(let h=a;h<l;h+=6){let w=~~((e[h+2*p]-g)/A);w>=et&&(w=et-1);let _=st[w];_.count++,Ct(h,e,_.bounds)}let d=st[et-1];Ce(d.bounds,d.rightCacheBounds);for(let h=et-2;h>=0;h--){let x=st[h],E=st[h+1];Oe(x.bounds,E.rightCacheBounds,x.rightCacheBounds)}let y=0;for(let h=0;h<et-1;h++){let x=st[h],E=x.count,w=x.bounds,b=st[h+1].rightCacheBounds;E!==0&&(y===0?Ce(w,te):Oe(w,te,te)),y+=E;let B=0,P=0;y!==0&&(B=Tt(te)/c);let S=r-y;S!==0&&(P=Tt(b)/c);let I=1+1.25*(B*y+P*S);I<m&&(o=p,m=I,f=x.candidate)}}}}else console.warn(`BVH: Invalid build strategy value ${s} used.`);return{axis:o,pos:f}}function Mi(i,t,e,n){let r=0,s=i.offset;for(let o=t,f=t+e;o<f;o++)r+=i[(o-s)*6+n*2];return r/e}var At=class{constructor(){this.boundingData=new Float32Array(6)}};function Dn(i,t,e,n,r,s){let o=n,f=n+r-1,c=s.pos,m=s.axis*2,u=e.offset||0;for(;;){for(;o<=f&&e[(o-u)*6+m]<c;)o++;for(;o<=f&&e[(f-u)*6+m]>=c;)f--;if(o<f){for(let a=0;a<t;a++){let l=i[o*t+a];i[o*t+a]=i[f*t+a],i[f*t+a]=l}for(let a=0;a<6;a++){let l=o-u,p=f-u,g=e[l*6+a];e[l*6+a]=e[p*6+a],e[p*6+a]=g}o++,f--}else return o}}var Mn,ee,Le,Nn,Ni=Math.pow(2,32);function ne(i){return"count"in i?1:1+ne(i.left)+ne(i.right)}function Fn(i,t,e){return Mn=new Float32Array(e),ee=new Uint32Array(e),Le=new Uint16Array(e),Nn=new Uint8Array(e),ze(i,t)}function ze(i,t){let e=i/4,n=i/2,r="count"in t,s=t.boundingData;for(let o=0;o<6;o++)Mn[e+o]=s[o];if(r)return t.buffer?(Nn.set(new Uint8Array(t.buffer),i),i+t.buffer.byteLength):(ee[e+6]=t.offset,Le[n+14]=t.count,Le[n+15]=65535,i+32);{let{left:o,right:f,splitAxis:c}=t,m=i+32,u=ze(m,o),a=i/32,p=u/32-a;if(p>Ni)throw new Error("MeshBVH: Cannot store relative child node offset greater than 32 bits.");return ee[e+6]=p,ee[e+7]=c,ze(u,f)}}function Fi(i,t,e,n,r,s){let{maxDepth:o,verbose:f,targetLeafSize:c,_strictLeafSize:m=1/0,strategy:u,onProgress:a}=r,l=i.primitiveBuffer,p=i.primitiveBufferStride,g=new Float32Array(6),v=!1,T=new At;return Qt(t,e,n,T.boundingData,g),d(T,e,n,g),T;function A(y){a&&a((y-s.offset)/s.count)}function d(y,h,x,E=null,w=0){!v&&w>=o&&(v=!0,f&&console.warn(`BVH: Max depth of ${o} reached when generating BVH. Consider increasing maxDepth.`));let _=x>m;if(x<=c&&!_||w>=o)return A(h+x),y.offset=h,y.count=x,y;let b=In(y.boundingData,E,t,h,x,u),B=b.axis===-1?-1:Dn(l,p,t,h,x,b);if(b.axis===-1||B===h||B===h+x){if(!_)return A(h+x),y.offset=h,y.count=x,y;b.axis=Math.max(0,Rt(y.boundingData)),B=h+Math.max(1,Math.floor(x/2))}y.splitAxis=b.axis;let P=new At,S=h,I=B-h;y.left=P,Qt(t,S,I,P.boundingData,g),d(P,S,I,g,w+1);let M=new At,N=B,V=x-I;return y.right=M,Qt(t,N,V,M.boundingData,g),d(M,N,V,g,w+1),y}}function Rn(i,t){let e=t.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,n=i.getRootRanges(t.range),r=n[0],s=n[n.length-1],o={offset:r.offset,count:s.offset+s.count-r.offset},f=new Float32Array(6*o.count);f.offset=o.offset,i.computePrimitiveBounds(o.offset,o.count,f),i._roots=n.map(c=>{let m=Fi(i,f,c.offset,c.count,t,o),u=ne(m),a=new e(32*u);return Fn(0,m,a),a})}var ct=class{constructor(t){this._getNewPrimitive=t,this._primitives=[]}getPrimitive(){let t=this._primitives;return t.length===0?this._getNewPrimitive():t.pop()}releasePrimitive(t){this._primitives.push(t)}};var Ue=class{constructor(){this.float32Array=null,this.uint16Array=null,this.uint32Array=null;let t=[],e=null;this.setBuffer=n=>{e&&t.push(e),e=n,this.float32Array=new Float32Array(n),this.uint16Array=new Uint16Array(n),this.uint32Array=new Uint32Array(n)},this.clearBuffer=()=>{e=null,this.float32Array=null,this.uint16Array=null,this.uint32Array=null,t.length!==0&&this.setBuffer(t.pop())}}},R=new Ue;var at,Bt,wt=[],ie=new ct(()=>new W);function Cn(i,t,e,n,r,s){at=ie.getPrimitive(),Bt=ie.getPrimitive(),wt.push(at,Bt),R.setBuffer(i._roots[t]);let o=He(0,i.geometry,e,n,r,s);R.clearBuffer(),ie.releasePrimitive(at),ie.releasePrimitive(Bt),wt.pop(),wt.pop();let f=wt.length;return f>0&&(Bt=wt[f-1],at=wt[f-2]),o}function He(i,t,e,n,r=null,s=0,o=0){let{float32Array:f,uint16Array:c,uint32Array:m}=R,u=i*2;if(F(u,c)){let l=C(i,m),p=z(u,c);return U(i,f,at),n(l,p,!1,o,s+i/8,at)}else{let B=function(S){let{uint16Array:I,uint32Array:M}=R,N=S*2;for(;!F(N,I);)S=O(S),N=S*2;return C(S,M)},P=function(S){let{uint16Array:I,uint32Array:M}=R,N=S*2;for(;!F(N,I);)S=L(S,M),N=S*2;return C(S,M)+z(N,I)},l=O(i),p=L(i,m),g=l,v=p,T,A,d,y;if(r&&(d=at,y=Bt,U(g,f,d),U(v,f,y),T=r(d),A=r(y),A<T)){g=p,v=l;let S=T;T=A,A=S,d=y}d||(d=at,U(g,f,d));let h=F(g*2,c),x=e(d,h,T,o+1,s+g/8),E;if(x===2){let S=B(g),M=P(g)-S;E=n(S,M,!0,o+1,s+g/8,d)}else E=x&&He(g,t,e,n,r,s,o+1);if(E)return!0;y=Bt,U(v,f,y);let w=F(v*2,c),_=e(y,w,A,o+1,s+v/8),b;if(_===2){let S=B(v),M=P(v)-S;b=n(S,M,!0,o+1,s+v/8,y)}else b=_&&He(v,t,e,n,r,s,o+1);return!!b}}var Ot=new R.constructor,oe=new R.constructor,lt=new ct(()=>new W),Et=new W,St=new W,Ve=new W,Ge=new W,ke=!1;function On(i,t,e,n){if(ke)throw new Error("MeshBVH: Recursive calls to bvhcast not supported.");ke=!0;let r=i._roots,s=t._roots,o,f=0,c=0,m=new q().copy(e).invert();for(let u=0,a=r.length;u<a;u++){Ot.setBuffer(r[u]),c=0;let l=lt.getPrimitive();U(0,Ot.float32Array,l),l.applyMatrix4(m);for(let p=0,g=s.length;p<g&&(oe.setBuffer(s[p]),o=tt(0,0,e,m,n,f,c,0,0,l),oe.clearBuffer(),c+=s[p].byteLength/32,!o);p++);if(lt.releasePrimitive(l),Ot.clearBuffer(),f+=r[u].byteLength/32,o)break}return ke=!1,o}function tt(i,t,e,n,r,s=0,o=0,f=0,c=0,m=null,u=!1){let a,l;u?(a=oe,l=Ot):(a=Ot,l=oe);let p=a.float32Array,g=a.uint32Array,v=a.uint16Array,T=l.float32Array,A=l.uint32Array,d=l.uint16Array,y=i*2,h=t*2,x=F(y,v),E=F(h,d),w=!1;if(E&&x)u?w=r(C(t,A),z(t*2,d),C(i,g),z(i*2,v),c,o+t/8,f,s+i/8):w=r(C(i,g),z(i*2,v),C(t,A),z(t*2,d),f,s+i/8,c,o+t/8);else if(E){let _=lt.getPrimitive();U(t,T,_),_.applyMatrix4(e);let b=O(i),B=L(i,g);U(b,p,Et),U(B,p,St);let P=_.intersectsBox(Et),S=_.intersectsBox(St);w=P&&tt(t,b,n,e,r,o,s,c,f+1,_,!u)||S&&tt(t,B,n,e,r,o,s,c,f+1,_,!u),lt.releasePrimitive(_)}else{let _=O(t),b=L(t,A);U(_,T,Ve),U(b,T,Ge);let B=m.intersectsBox(Ve),P=m.intersectsBox(Ge);if(B&&P)w=tt(i,_,e,n,r,s,o,f,c+1,m,u)||tt(i,b,e,n,r,s,o,f,c+1,m,u);else if(B)if(x)w=tt(i,_,e,n,r,s,o,f,c+1,m,u);else{let S=lt.getPrimitive();S.copy(Ve).applyMatrix4(e);let I=O(i),M=L(i,g);U(I,p,Et),U(M,p,St);let N=S.intersectsBox(Et),V=S.intersectsBox(St);w=N&&tt(_,I,n,e,r,o,s,c,f+1,S,!u)||V&&tt(_,M,n,e,r,o,s,c,f+1,S,!u),lt.releasePrimitive(S)}else if(P)if(x)w=tt(i,b,e,n,r,s,o,f,c+1,m,u);else{let S=lt.getPrimitive();S.copy(Ge).applyMatrix4(e);let I=O(i),M=L(i,g);U(I,p,Et),U(M,p,St);let N=S.intersectsBox(Et),V=S.intersectsBox(St);w=N&&tt(b,I,n,e,r,o,s,c,f+1,S,!u)||V&&tt(b,M,n,e,r,o,s,c,f+1,S,!u),lt.releasePrimitive(S)}}return w}var se=new class{constructor(){let i=null,t=null,e=null,n=!1;this.root=null,this.buffer=null,this.uint32Array=null,this.uint16Array=null,this.setBVH=(s,o)=>{if(n)throw new Error("BVHTraversalHelper: cannot call setBVH during an active traversal.");this.root=o,this.buffer=i=s._roots[o],this.uint16Array=e=new Uint16Array(i),this.uint32Array=t=new Uint32Array(i)},this.reset=()=>{this.root=null,this.buffer=i=null,this.uint16Array=e=null,this.uint32Array=t=null},this.getRangeStart=s=>{let o=s*2;for(;!F(o,e);)s=O(s),o=s*2;return C(s,t)},this.getRangeEnd=s=>{let o=s*2;for(;!F(o,e);)s=L(s,t),o=s*2;return C(s,t)+z(o,e)};let r=(s,o,f)=>{let c=o*2,m=F(c,e);if(!s(f,m,o)&&!m){let a=O(o),l=L(o,t);r(s,a,f+1),r(s,l,f+1)}};this.traverseBuffer=s=>{if(n)throw new Error("BVHTraversalHelper: cannot start a traversal during an active traversal.");n=!0;try{r(s,0,0)}finally{n=!1}},this.traverse=s=>{this.traverseBuffer((o,f,c)=>{if(f){let m=c*2,u=t[c+6],a=e[m+14];return s(o,f,new Float32Array(i,c*4,6),u,a)}else{let m=ot(c,t);return s(o,f,new Float32Array(i,c*4,6),m)}})}}};var Ln=new W,_t=new Float32Array(6),ce=class{constructor(){this._roots=null,this.primitiveBuffer=null,this.primitiveBufferStride=null}init(t){t={...Jt,...t},"maxLeafSize"in t&&(console.warn('BVH: "maxLeafSize" option has been deprecated. Use "targetLeafSize", instead.'),t={...t,targetLeafSize:t.maxLeafSize}),Rn(this,t)}getRootRanges(){throw new Error("BVH: getRootRanges() not implemented")}writePrimitiveBounds(){throw new Error("BVH: writePrimitiveBounds() not implemented")}writePrimitiveRangeBounds(t,e,n,r){let s=1/0,o=1/0,f=1/0,c=-1/0,m=-1/0,u=-1/0;for(let a=t,l=t+e;a<l;a++){this.writePrimitiveBounds(a,_t,0);let[p,g,v,T,A,d]=_t;p<s&&(s=p),T>c&&(c=T),g<o&&(o=g),A>m&&(m=A),v<f&&(f=v),d>u&&(u=d)}return n[r+0]=s,n[r+1]=o,n[r+2]=f,n[r+3]=c,n[r+4]=m,n[r+5]=u,n}computePrimitiveBounds(t,e,n){let r=n.offset||0;for(let s=t,o=t+e;s<o;s++){this.writePrimitiveBounds(s,_t,0);let[f,c,m,u,a,l]=_t,p=(f+u)/2,g=(c+a)/2,v=(m+l)/2,T=(u-f)/2,A=(a-c)/2,d=(l-m)/2,y=(s-r)*6;n[y+0]=p,n[y+1]=T+(Math.abs(p)+T)*vt,n[y+2]=g,n[y+3]=A+(Math.abs(g)+A)*vt,n[y+4]=v,n[y+5]=d+(Math.abs(v)+d)*vt}return n}shiftPrimitiveOffsets(t){let e=this._indirectBuffer;if(e)for(let n=0,r=e.length;n<r;n++)e[n]+=t;else{let n=this._roots;for(let r=0;r<n.length;r++){let s=n[r],o=new Uint32Array(s),f=new Uint16Array(s),c=s.byteLength/32;for(let m=0;m<c;m++){let u=8*m,a=2*u;F(a,f)&&(o[u+6]+=t)}}}}traverse(t,e=0){se.setBVH(this,e),se.traverse(t),se.reset()}refit(){let t=this._roots;for(let e=0,n=t.length;e<n;e++){let r=t[e],s=new Uint32Array(r),o=new Uint16Array(r),f=new Float32Array(r),c=r.byteLength/32;for(let m=c-1;m>=0;m--){let u=m*8,a=u*2;if(F(a,o)){let p=C(u,s),g=z(a,o);this.writePrimitiveRangeBounds(p,g,_t,0),f.set(_t,u)}else{let p=O(u),g=L(u,s);for(let v=0;v<3;v++){let T=f[p+v],A=f[p+v+3],d=f[g+v],y=f[g+v+3];f[u+v]=T<d?T:d,f[u+v+3]=A>y?A:y}}}}}getBoundingBox(t){return t.makeEmpty(),this._roots.forEach(n=>{U(0,new Float32Array(n),Ln),t.union(Ln)}),t}shapecast(t){let{boundsTraverseOrder:e,intersectsBounds:n,intersectsRange:r,intersectsPrimitive:s,scratchPrimitive:o,iterate:f}=t;if(r&&s){let a=r;r=(l,p,g,v,T)=>a(l,p,g,v,T)?!0:f(l,p,this,s,g,v,o)}else r||(s?r=(a,l,p,g)=>f(a,l,this,s,p,g,o):r=(a,l,p)=>p);let c=!1,m=0,u=this._roots;for(let a=0,l=u.length;a<l;a++){let p=u[a];if(c=Cn(this,a,n,r,e,m),c)break;m+=p.byteLength/32}return c}bvhcast(t,e,n){let{intersectsRanges:r}=n;return On(this,t,e,r)}};function zn(){return typeof SharedArrayBuffer<"u"}function Lt(i){return i.index?i.index.count:i.attributes.position.count}function ft(i){return Lt(i)/3}function qe(i,t=ArrayBuffer){return i>65535?new Uint32Array(new t(4*i)):new Uint16Array(new t(2*i))}function Un(i,t){if(!i.index){let e=i.attributes.position.count,n=t.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,r=qe(e,n);i.setIndex(new gt(r,1));for(let s=0;s<e;s++)r[s]=s}}function Ci(i,t,e){let n=Lt(i)/e,r=t||i.drawRange,s=r.start/e,o=(r.start+r.count)/e,f=Math.max(0,s),c=Math.min(n,o)-f;return{offset:Math.floor(f),count:Math.floor(c)}}function Oi(i,t){return i.groups.map(e=>({offset:e.start/t,count:e.count/t}))}function Ye(i,t,e){let n=Ci(i,t,e),r=Oi(i,e);if(!r.length)return[n];let s=[],o=n.offset,f=n.offset+n.count,c=Lt(i)/e,m=[];for(let l of r){let{offset:p,count:g}=l,v=p,T=isFinite(g)?g:c-p,A=p+T;v<f&&A>o&&(m.push({pos:Math.max(o,v),isStart:!0}),m.push({pos:Math.min(f,A),isStart:!1}))}m.sort((l,p)=>l.pos!==p.pos?l.pos-p.pos:l.type==="end"?-1:1);let u=0,a=null;for(let l of m){let p=l.pos;u!==0&&p!==a&&s.push({offset:a,count:p-a}),u+=l.isStart?1:-1,a=p}return s}function Li(i,t){let e=i[i.length-1],n=e.offset+e.count>2**16,r=i.reduce((m,u)=>m+u.count,0),s=n?4:2,o=t?new SharedArrayBuffer(r*s):new ArrayBuffer(r*s),f=n?new Uint32Array(o):new Uint16Array(o),c=0;for(let m=0;m<i.length;m++){let{offset:u,count:a}=i[m];for(let l=0;l<a;l++)f[c+l]=u+l;c+=a}return f}var ae=class extends ce{get indirect(){return!!this._indirectBuffer}get primitiveStride(){return null}get primitiveBufferStride(){return this.indirect?1:this.primitiveStride}set primitiveBufferStride(t){}get primitiveBuffer(){return this.indirect?this._indirectBuffer:this.geometry.index.array}set primitiveBuffer(t){}constructor(t,e={}){if(t.isBufferGeometry){if(t.index&&t.index.isInterleavedBufferAttribute)throw new Error("BVH: InterleavedBufferAttribute is not supported for the index attribute.")}else throw new Error("BVH: Only BufferGeometries are supported.");if(e.useSharedArrayBuffer&&!zn())throw new Error("BVH: SharedArrayBuffer is not available.");super(),this.geometry=t,this.resolvePrimitiveIndex=e.indirect?n=>this._indirectBuffer[n]:n=>n,this.primitiveBuffer=null,this.primitiveBufferStride=null,this._indirectBuffer=null,e={...Jt,...e},e[Ft]||this.init(e)}init(t){let{geometry:e,primitiveStride:n}=this;if(t.indirect){let r=Ye(e,t.range,n),s=Li(r,t.useSharedArrayBuffer);this._indirectBuffer=s}else Un(e,t);super.init(t),!e.boundingBox&&t.setBoundingBox&&(e.boundingBox=this.getBoundingBox(new W))}getRootRanges(t){return this.indirect?[{offset:0,count:this._indirectBuffer.length}]:Ye(this.geometry,t,this.primitiveStride)}raycastObject3D(){throw new Error("BVH: raycastObject3D() not implemented")}};var $=class{constructor(){this.min=1/0,this.max=-1/0}setFromPointsField(t,e){let n=1/0,r=-1/0;for(let s=0,o=t.length;s<o;s++){let c=t[s][e];n=c<n?c:n,r=c>r?c:r}this.min=n,this.max=r}setFromPoints(t,e){let n=1/0,r=-1/0;for(let s=0,o=e.length;s<o;s++){let f=e[s],c=t.dot(f);n=c<n?c:n,r=c>r?c:r}this.min=n,this.max=r}isSeparated(t){return this.min>t.max||t.min>this.max}};$.prototype.setFromBox=(function(){let i=new D;return function(e,n){let r=n.min,s=n.max,o=1/0,f=-1/0;for(let c=0;c<=1;c++)for(let m=0;m<=1;m++)for(let u=0;u<=1;u++){i.x=r.x*c+s.x*(1-c),i.y=r.y*m+s.y*(1-m),i.z=r.z*u+s.z*(1-u);let a=e.dot(i);o=Math.min(a,o),f=Math.max(a,f)}this.min=o,this.max=f}})();var zi=(function(){let i=new D,t=new D,e=new D;return function(r,s,o){let f=r.start,c=i,m=s.start,u=t;e.subVectors(f,m),i.subVectors(r.end,r.start),t.subVectors(s.end,s.start);let a=e.dot(u),l=u.dot(c),p=u.dot(u),g=e.dot(c),T=c.dot(c)*p-l*l,A,d;T!==0?A=(a*l-g*p)/T:A=0,d=(a+A*l)/p,o.x=A,o.y=d}})(),zt=(function(){let i=new K,t=new D,e=new D;return function(r,s,o,f){zi(r,s,i);let c=i.x,m=i.y;if(c>=0&&c<=1&&m>=0&&m<=1){r.at(c,o),s.at(m,f);return}else if(c>=0&&c<=1){m<0?s.at(0,f):s.at(1,f),r.closestPointToPoint(f,!0,o);return}else if(m>=0&&m<=1){c<0?r.at(0,o):r.at(1,o),s.closestPointToPoint(o,!0,f);return}else{let u;c<0?u=r.start:u=r.end;let a;m<0?a=s.start:a=s.end;let l=t,p=e;if(r.closestPointToPoint(a,!0,t),s.closestPointToPoint(u,!0,e),l.distanceToSquared(a)<=p.distanceToSquared(u)){o.copy(l),f.copy(a);return}else{o.copy(u),f.copy(p);return}}}})(),Hn=(function(){let i=new D,t=new D,e=new jt,n=new j;return function(s,o){let{radius:f,center:c}=s,{a:m,b:u,c:a}=o;if(n.start=m,n.end=u,n.closestPointToPoint(c,!0,i).distanceTo(c)<=f||(n.start=m,n.end=a,n.closestPointToPoint(c,!0,i).distanceTo(c)<=f)||(n.start=u,n.end=a,n.closestPointToPoint(c,!0,i).distanceTo(c)<=f))return!0;let v=o.getPlane(e);if(Math.abs(v.distanceToPoint(c))<=f){let A=v.projectPoint(c,t);if(o.containsPoint(A))return!0}return!1}})();var Ui=["x","y","z"],nt=1e-15,Vn=nt*nt;function J(i){return Math.abs(i)<nt}var X=class extends rt{constructor(...t){super(...t),this.isExtendedTriangle=!0,this.satAxes=new Array(4).fill().map(()=>new D),this.satBounds=new Array(4).fill().map(()=>new $),this.points=[this.a,this.b,this.c],this.plane=new jt,this.isDegenerateIntoSegment=!1,this.isDegenerateIntoPoint=!1,this.degenerateSegment=new j,this.needsUpdate=!0}intersectsSphere(t){return Hn(t,this)}update(){let t=this.a,e=this.b,n=this.c,r=this.points,s=this.satAxes,o=this.satBounds,f=s[0],c=o[0];this.getNormal(f),c.setFromPoints(f,r);let m=s[1],u=o[1];m.subVectors(t,e),u.setFromPoints(m,r);let a=s[2],l=o[2];a.subVectors(e,n),l.setFromPoints(a,r);let p=s[3],g=o[3];p.subVectors(n,t),g.setFromPoints(p,r);let v=m.length(),T=a.length(),A=p.length();this.isDegenerateIntoPoint=!1,this.isDegenerateIntoSegment=!1,v<nt?T<nt||A<nt?this.isDegenerateIntoPoint=!0:(this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(t),this.degenerateSegment.end.copy(n)):T<nt?A<nt?this.isDegenerateIntoPoint=!0:(this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(e),this.degenerateSegment.end.copy(t)):A<nt&&(this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(n),this.degenerateSegment.end.copy(e)),this.plane.setFromNormalAndCoplanarPoint(f,t),this.needsUpdate=!1}};X.prototype.closestPointToSegment=(function(){let i=new D,t=new D,e=new j;return function(r,s=null,o=null){let{start:f,end:c}=r,m=this.points,u,a=1/0;for(let l=0;l<3;l++){let p=(l+1)%3;e.start.copy(m[l]),e.end.copy(m[p]),zt(e,r,i,t),u=i.distanceToSquared(t),u<a&&(a=u,s&&s.copy(i),o&&o.copy(t))}return this.closestPointToPoint(f,i),u=f.distanceToSquared(i),u<a&&(a=u,s&&s.copy(i),o&&o.copy(f)),this.closestPointToPoint(c,i),u=c.distanceToSquared(i),u<a&&(a=u,s&&s.copy(i),o&&o.copy(c)),Math.sqrt(a)}})();X.prototype.intersectsTriangle=(function(){let i=new X,t=new $,e=new $,n=new D,r=new D,s=new D,o=new D,f=new j,c=new j,m=new D,u=new K,a=new K;function l(y,h,x,E){let w=n;!y.isDegenerateIntoPoint&&!y.isDegenerateIntoSegment?w.copy(y.plane.normal):w.copy(h.plane.normal);let _=y.satBounds,b=y.satAxes;for(let S=1;S<4;S++){let I=_[S],M=b[S];if(t.setFromPoints(M,h.points),I.isSeparated(t)||(o.copy(w).cross(M),t.setFromPoints(o,y.points),e.setFromPoints(o,h.points),t.isSeparated(e)))return!1}let B=h.satBounds,P=h.satAxes;for(let S=1;S<4;S++){let I=B[S],M=P[S];if(t.setFromPoints(M,y.points),I.isSeparated(t)||(o.crossVectors(w,M),t.setFromPoints(o,y.points),e.setFromPoints(o,h.points),t.isSeparated(e)))return!1}return x&&(E||console.warn("ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0."),x.start.set(0,0,0),x.end.set(0,0,0)),!0}function p(y,h,x,E,w,_,b,B,P,S,I){let M=b/(b-B);S.x=E+(w-E)*M,I.start.subVectors(h,y).multiplyScalar(M).add(y),M=b/(b-P),S.y=E+(_-E)*M,I.end.subVectors(x,y).multiplyScalar(M).add(y)}function g(y,h,x,E,w,_,b,B,P,S,I){if(w>0)p(y.c,y.a,y.b,E,h,x,P,b,B,S,I);else if(_>0)p(y.b,y.a,y.c,x,h,E,B,b,P,S,I);else if(B*P>0||b!=0)p(y.a,y.b,y.c,h,x,E,b,B,P,S,I);else if(B!=0)p(y.b,y.a,y.c,x,h,E,B,b,P,S,I);else if(P!=0)p(y.c,y.a,y.b,E,h,x,P,b,B,S,I);else return!0;return!1}function v(y,h,x,E){let w=h.degenerateSegment,_=y.plane.distanceToPoint(w.start),b=y.plane.distanceToPoint(w.end);return J(_)?J(b)?l(y,h,x,E):(x&&(x.start.copy(w.start),x.end.copy(w.start)),y.containsPoint(w.start)):J(b)?(x&&(x.start.copy(w.end),x.end.copy(w.end)),y.containsPoint(w.end)):y.plane.intersectLine(w,n)!=null?(x&&(x.start.copy(n),x.end.copy(n)),y.containsPoint(n)):!1}function T(y,h,x){let E=h.a;return J(y.plane.distanceToPoint(E))&&y.containsPoint(E)?(x&&(x.start.copy(E),x.end.copy(E)),!0):!1}function A(y,h,x){let E=y.degenerateSegment,w=h.a;return E.closestPointToPoint(w,!0,n),w.distanceToSquared(n)<Vn?(x&&(x.start.copy(w),x.end.copy(w)),!0):!1}function d(y,h,x,E){if(y.isDegenerateIntoSegment)if(h.isDegenerateIntoSegment){let w=y.degenerateSegment,_=h.degenerateSegment,b=r,B=s;w.delta(b),_.delta(B);let P=n.subVectors(_.start,w.start),S=b.x*B.y-b.y*B.x;if(J(S))return!1;let I=(P.x*B.y-P.y*B.x)/S,M=-(b.x*P.y-b.y*P.x)/S;if(I<0||I>1||M<0||M>1)return!1;let N=w.start.z+b.z*I,V=_.start.z+B.z*M;return J(N-V)?(x&&(x.start.copy(w.start).addScaledVector(b,I),x.end.copy(w.start).addScaledVector(b,I)),!0):!1}else return h.isDegenerateIntoPoint?A(y,h,x):v(h,y,x,E);else{if(y.isDegenerateIntoPoint)return h.isDegenerateIntoPoint?h.a.distanceToSquared(y.a)<Vn?(x&&(x.start.copy(y.a),x.end.copy(y.a)),!0):!1:h.isDegenerateIntoSegment?A(h,y,x):T(h,y,x);if(h.isDegenerateIntoPoint)return T(y,h,x);if(h.isDegenerateIntoSegment)return v(y,h,x,E)}}return function(h,x=null,E=!1){this.needsUpdate&&this.update(),h.isExtendedTriangle?h.needsUpdate&&h.update():(i.copy(h),i.update(),h=i);let w=d(this,h,x,E);if(w!==void 0)return w;let _=this.plane,b=h.plane,B=b.distanceToPoint(this.a),P=b.distanceToPoint(this.b),S=b.distanceToPoint(this.c);J(B)&&(B=0),J(P)&&(P=0),J(S)&&(S=0);let I=B*P,M=B*S;if(I>0&&M>0)return!1;let N=_.distanceToPoint(h.a),V=_.distanceToPoint(h.b),Yt=_.distanceToPoint(h.c);J(N)&&(N=0),J(V)&&(V=0),J(Yt)&&(Yt=0);let on=N*V,sn=N*Yt;if(on>0&&sn>0)return!1;r.copy(_.normal),s.copy(b.normal);let _e=r.cross(s),be=0,Pe=Math.abs(_e.x),cn=Math.abs(_e.y);cn>Pe&&(Pe=cn,be=1),Math.abs(_e.z)>Pe&&(be=2);let xt=Ui[be],wi=this.a[xt],Bi=this.b[xt],Ei=this.c[xt],Si=h.a[xt],_i=h.b[xt],bi=h.c[xt];if(g(this,wi,Bi,Ei,I,M,B,P,S,u,f))return l(this,h,x,E);if(g(h,Si,_i,bi,on,sn,N,V,Yt,a,c))return l(this,h,x,E);if(u.y<u.x){let Ie=u.y;u.y=u.x,u.x=Ie,m.copy(f.start),f.start.copy(f.end),f.end.copy(m)}if(a.y<a.x){let Ie=a.y;a.y=a.x,a.x=Ie,m.copy(c.start),c.start.copy(c.end),c.end.copy(m)}return u.y<a.x||a.y<u.x?!1:(x&&(a.x>u.x?x.start.copy(c.start):x.start.copy(f.start),a.y<u.y?x.end.copy(c.end):x.end.copy(f.end)),!0)}})();X.prototype.distanceToPoint=(function(){let i=new D;return function(e){return this.closestPointToPoint(e,i),e.distanceTo(i)}})();X.prototype.distanceToTriangle=(function(){let i=new D,t=new D,e=["a","b","c"],n=new j,r=new j;return function(o,f=null,c=null){let m=f||c?n:null;if(this.intersectsTriangle(o,m,!0))return(f||c)&&(f&&m.getCenter(f),c&&m.getCenter(c)),0;let u=1/0;for(let a=0;a<3;a++){let l,p=e[a],g=o[p];this.closestPointToPoint(g,i),l=g.distanceToSquared(i),l<u&&(u=l,f&&f.copy(i),c&&c.copy(g));let v=this[p];o.closestPointToPoint(v,i),l=v.distanceToSquared(i),l<u&&(u=l,f&&f.copy(v),c&&c.copy(i))}for(let a=0;a<3;a++){let l=e[a],p=e[(a+1)%3];n.set(this[l],this[p]);for(let g=0;g<3;g++){let v=e[g],T=e[(g+1)%3];r.set(o[v],o[T]),zt(n,r,i,t);let A=i.distanceToSquared(t);A<u&&(u=A,f&&f.copy(i),c&&c.copy(t))}}return Math.sqrt(u)}})();var G=class{constructor(t,e,n){this.isOrientedBox=!0,this.min=new D,this.max=new D,this.matrix=new q,this.invMatrix=new q,this.points=new Array(8).fill().map(()=>new D),this.satAxes=new Array(3).fill().map(()=>new D),this.satBounds=new Array(3).fill().map(()=>new $),this.alignedSatBounds=new Array(3).fill().map(()=>new $),this.needsUpdate=!1,t&&this.min.copy(t),e&&this.max.copy(e),n&&this.matrix.copy(n)}set(t,e,n){this.min.copy(t),this.max.copy(e),this.matrix.copy(n),this.needsUpdate=!0}copy(t){this.min.copy(t.min),this.max.copy(t.max),this.matrix.copy(t.matrix),this.needsUpdate=!0}};G.prototype.update=(function(){return function(){let t=this.matrix,e=this.min,n=this.max,r=this.points;for(let m=0;m<=1;m++)for(let u=0;u<=1;u++)for(let a=0;a<=1;a++){let l=1*m|2*u|4*a,p=r[l];p.x=m?n.x:e.x,p.y=u?n.y:e.y,p.z=a?n.z:e.z,p.applyMatrix4(t)}let s=this.satBounds,o=this.satAxes,f=r[0];for(let m=0;m<3;m++){let u=o[m],a=s[m],l=1<<m,p=r[l];u.subVectors(f,p),a.setFromPoints(u,r)}let c=this.alignedSatBounds;c[0].setFromPointsField(r,"x"),c[1].setFromPointsField(r,"y"),c[2].setFromPointsField(r,"z"),this.invMatrix.copy(this.matrix).invert(),this.needsUpdate=!1}})();G.prototype.intersectsBox=(function(){let i=new $;return function(e){this.needsUpdate&&this.update();let n=e.min,r=e.max,s=this.satBounds,o=this.satAxes,f=this.alignedSatBounds;if(i.min=n.x,i.max=r.x,f[0].isSeparated(i)||(i.min=n.y,i.max=r.y,f[1].isSeparated(i))||(i.min=n.z,i.max=r.z,f[2].isSeparated(i)))return!1;for(let c=0;c<3;c++){let m=o[c],u=s[c];if(i.setFromBox(m,e),u.isSeparated(i))return!1}return!0}})();G.prototype.intersectsTriangle=(function(){let i=new X,t=new Array(3),e=new $,n=new $,r=new D;return function(o){this.needsUpdate&&this.update(),o.isExtendedTriangle?o.needsUpdate&&o.update():(i.copy(o),i.update(),o=i);let f=this.satBounds,c=this.satAxes;t[0]=o.a,t[1]=o.b,t[2]=o.c;for(let l=0;l<3;l++){let p=f[l],g=c[l];if(e.setFromPoints(g,t),p.isSeparated(e))return!1}let m=o.satBounds,u=o.satAxes,a=this.points;for(let l=0;l<3;l++){let p=m[l],g=u[l];if(e.setFromPoints(g,a),p.isSeparated(e))return!1}for(let l=0;l<3;l++){let p=c[l];for(let g=0;g<4;g++){let v=u[g];if(r.crossVectors(p,v),e.setFromPoints(r,t),n.setFromPoints(r,a),e.isSeparated(n))return!1}}return!0}})();G.prototype.closestPointToPoint=(function(){return function(t,e){return this.needsUpdate&&this.update(),e.copy(t).applyMatrix4(this.invMatrix).clamp(this.min,this.max).applyMatrix4(this.matrix),e}})();G.prototype.distanceToPoint=(function(){let i=new D;return function(e){return this.closestPointToPoint(e,i),e.distanceTo(i)}})();G.prototype.distanceToBox=(function(){let i=["x","y","z"],t=new Array(12).fill().map(()=>new j),e=new Array(12).fill().map(()=>new j),n=new D,r=new D;return function(o,f=0,c=null,m=null){if(this.needsUpdate&&this.update(),this.intersectsBox(o))return(c||m)&&(o.getCenter(r),this.closestPointToPoint(r,n),o.closestPointToPoint(n,r),c&&c.copy(n),m&&m.copy(r)),0;let u=f*f,a=o.min,l=o.max,p=this.points,g=1/0;for(let T=0;T<8;T++){let A=p[T];r.copy(A).clamp(a,l);let d=A.distanceToSquared(r);if(d<g&&(g=d,c&&c.copy(A),m&&m.copy(r),d<u))return Math.sqrt(d)}let v=0;for(let T=0;T<3;T++)for(let A=0;A<=1;A++)for(let d=0;d<=1;d++){let y=(T+1)%3,h=(T+2)%3,x=A<<y|d<<h,E=1<<T|A<<y|d<<h,w=p[x],_=p[E];t[v].set(w,_);let B=i[T],P=i[y],S=i[h],I=e[v],M=I.start,N=I.end;M[B]=a[B],M[P]=A?a[P]:l[P],M[S]=d?a[S]:l[P],N[B]=l[B],N[P]=A?a[P]:l[P],N[S]=d?a[S]:l[P],v++}for(let T=0;T<=1;T++)for(let A=0;A<=1;A++)for(let d=0;d<=1;d++){r.x=T?l.x:a.x,r.y=A?l.y:a.y,r.z=d?l.z:a.z,this.closestPointToPoint(r,n);let y=r.distanceToSquared(n);if(y<g&&(g=y,c&&c.copy(n),m&&m.copy(r),y<u))return Math.sqrt(y)}for(let T=0;T<12;T++){let A=t[T];for(let d=0;d<12;d++){let y=e[d];zt(A,y,n,r);let h=n.distanceToSquared(r);if(h<g&&(g=h,c&&c.copy(n),m&&m.copy(r),h<u))return Math.sqrt(h)}}return Math.sqrt(g)}})();var Xe=class extends ct{constructor(){super(()=>new X)}},Z=new Xe;var Ut=new D,We=new D;function Gn(i,t,e={},n=0,r=1/0){let s=n*n,o=r*r,f=1/0,c=null;if(i.shapecast({boundsTraverseOrder:u=>(Ut.copy(t).clamp(u.min,u.max),Ut.distanceToSquared(t)),intersectsBounds:(u,a,l)=>l<f&&l<o,intersectsTriangle:(u,a)=>{u.closestPointToPoint(t,Ut);let l=t.distanceToSquared(Ut);return l<f&&(We.copy(Ut),f=l,c=a),l<s}}),f===1/0)return null;let m=Math.sqrt(f);return e.point?e.point.copy(We):e.point=We.clone(),e.distance=m,e.faceIndex=c,e}var le=parseInt("186")>=169,Hi=parseInt("186")<=161,mt=new D,dt=new D,yt=new D,fe=new K,ue=new K,pe=new K,kn=new D,qn=new D,Yn=new D,Ht=new D;function Vi(i,t,e,n,r,s,o,f){let c;if(s===Xt?c=i.intersectTriangle(n,e,t,!0,r):c=i.intersectTriangle(t,e,n,s!==an,r),c===null)return null;let m=i.origin.distanceTo(r);return m<o||m>f?null:{distance:m,point:r.clone()}}function Xn(i,t,e,n,r,s,o,f,c,m,u){mt.fromBufferAttribute(t,s),dt.fromBufferAttribute(t,o),yt.fromBufferAttribute(t,f);let a=Vi(i,mt,dt,yt,Ht,c,m,u);if(a){if(n){fe.fromBufferAttribute(n,s),ue.fromBufferAttribute(n,o),pe.fromBufferAttribute(n,f),a.uv=new K;let p=rt.getInterpolation(Ht,mt,dt,yt,fe,ue,pe,a.uv);le||(a.uv=p)}if(r){fe.fromBufferAttribute(r,s),ue.fromBufferAttribute(r,o),pe.fromBufferAttribute(r,f),a.uv1=new K;let p=rt.getInterpolation(Ht,mt,dt,yt,fe,ue,pe,a.uv1);le||(a.uv1=p),Hi&&(a.uv2=a.uv1)}if(e){kn.fromBufferAttribute(e,s),qn.fromBufferAttribute(e,o),Yn.fromBufferAttribute(e,f),a.normal=new D;let p=rt.getInterpolation(Ht,mt,dt,yt,kn,qn,Yn,a.normal);a.normal.dot(i.direction)>0&&a.normal.multiplyScalar(-1),le||(a.normal=p)}let l={a:s,b:o,c:f,normal:new D,materialIndex:0};if(rt.getNormal(mt,dt,yt,l.normal),a.face=l,a.faceIndex=s,le){let p=new D;rt.getBarycoord(Ht,mt,dt,yt,p),a.barycoord=p}}return a}function Wn(i){return i&&i.isMaterial?i.side:i}function bt(i,t,e,n,r,s,o){let f=n*3,c=f+0,m=f+1,u=f+2,{index:a,groups:l}=i;i.index&&(c=a.getX(c),m=a.getX(m),u=a.getX(u));let{position:p,normal:g,uv:v,uv1:T}=i.attributes;if(Array.isArray(t)){let A=n*3;for(let d=0,y=l.length;d<y;d++){let{start:h,count:x,materialIndex:E}=l[d];if(A>=h&&A<h+x){let w=Wn(t[E]),_=Xn(e,p,g,v,T,c,m,u,w,s,o);if(_)if(_.faceIndex=n,_.face.materialIndex=E,r)r.push(_);else return _}}}else{let A=Wn(t),d=Xn(e,p,g,v,T,c,m,u,A,s,o);if(d)if(d.faceIndex=n,d.face.materialIndex=0,r)r.push(d);else return d}return null}function H(i,t,e,n){let r=i.a,s=i.b,o=i.c,f=t,c=t+1,m=t+2;e&&(f=e.getX(f),c=e.getX(c),m=e.getX(m)),r.x=n.getX(f),r.y=n.getY(f),r.z=n.getZ(f),s.x=n.getX(c),s.y=n.getY(c),s.z=n.getZ(c),o.x=n.getX(m),o.y=n.getY(m),o.z=n.getZ(m)}function Kn(i,t,e,n,r,s,o,f){let{geometry:c,_indirectBuffer:m}=i;for(let u=n,a=n+r;u<a;u++)bt(c,t,e,u,s,o,f)}function $n(i,t,e,n,r,s,o){let{geometry:f,_indirectBuffer:c}=i,m=1/0,u=null;for(let a=n,l=n+r;a<l;a++){let p;p=bt(f,t,e,a,null,s,o),p&&p.distance<m&&(u=p,m=p.distance)}return u}function jn(i,t,e,n,r,s,o){let{geometry:f}=e,{index:c}=f,m=f.attributes.position;for(let u=i,a=t+i;u<a;u++){let l;if(l=u,H(o,l*3,c,m),o.needsUpdate=!0,n(o,l,r,s))return!0}return!1}function Jn(i,t=null){t&&Array.isArray(t)&&(t=new Set(t));let e=i.geometry,n=e.index?e.index.array:null,r=e.attributes.position,s,o,f,c,m=0,u=i._roots;for(let l=0,p=u.length;l<p;l++)s=u[l],o=new Uint32Array(s),f=new Uint16Array(s),c=new Float32Array(s),a(0,m),m+=s.byteLength;function a(l,p,g=!1){let v=l*2;if(F(v,f)){let T=C(l,o),A=z(v,f),d=1/0,y=1/0,h=1/0,x=-1/0,E=-1/0,w=-1/0;for(let _=3*T,b=3*(T+A);_<b;_++){let B=n[_],P=r.getX(B),S=r.getY(B),I=r.getZ(B);P<d&&(d=P),P>x&&(x=P),S<y&&(y=S),S>E&&(E=S),I<h&&(h=I),I>w&&(w=I)}return c[l+0]!==d||c[l+1]!==y||c[l+2]!==h||c[l+3]!==x||c[l+4]!==E||c[l+5]!==w?(c[l+0]=d,c[l+1]=y,c[l+2]=h,c[l+3]=x,c[l+4]=E,c[l+5]=w,!0):!1}else{let T=O(l),A=L(l,o),d=g,y=!1,h=!1;if(t){if(!d){let B=T/8+p/32,P=A/8+p/32;y=t.has(B),h=t.has(P),d=!y&&!h}}else y=!0,h=!0;let x=d||y,E=d||h,w=!1;x&&(w=a(T,p,d));let _=!1;E&&(_=a(A,p,d));let b=w||_;if(b)for(let B=0;B<3;B++){let P=T+B,S=A+B,I=c[P],M=c[P+3],N=c[S],V=c[S+3];c[l+B]=I<N?I:N,c[l+B+3]=M>V?M:V}return b}}}function Q(i,t,e,n,r){let s,o,f,c,m,u,a=1/e.direction.x,l=1/e.direction.y,p=1/e.direction.z,g=e.origin.x,v=e.origin.y,T=e.origin.z,A=t[i],d=t[i+3],y=t[i+1],h=t[i+3+1],x=t[i+2],E=t[i+3+2];return a>=0?(s=(A-g)*a,o=(d-g)*a):(s=(d-g)*a,o=(A-g)*a),l>=0?(f=(y-v)*l,c=(h-v)*l):(f=(h-v)*l,c=(y-v)*l),s>c||f>o||((f>s||isNaN(s))&&(s=f),(c<o||isNaN(o))&&(o=c),p>=0?(m=(x-T)*p,u=(E-T)*p):(m=(E-T)*p,u=(x-T)*p),s>u||m>o)?!1:((m>s||s!==s)&&(s=m),(u<o||o!==o)&&(o=u),s<=r&&o>=n)}function Qn(i,t,e,n,r,s,o,f){let{geometry:c,_indirectBuffer:m}=i;for(let u=n,a=n+r;u<a;u++){let l=m?m[u]:u;bt(c,t,e,l,s,o,f)}}function ti(i,t,e,n,r,s,o){let{geometry:f,_indirectBuffer:c}=i,m=1/0,u=null;for(let a=n,l=n+r;a<l;a++){let p;p=bt(f,t,e,c?c[a]:a,null,s,o),p&&p.distance<m&&(u=p,m=p.distance)}return u}function ei(i,t,e,n,r,s,o){let{geometry:f}=e,{index:c}=f,m=f.attributes.position;for(let u=i,a=t+i;u<a;u++){let l;if(l=e.resolveTriangleIndex(u),H(o,l*3,c,m),o.needsUpdate=!0,n(o,l,r,s))return!0}return!1}function ni(i,t,e,n,r,s,o){R.setBuffer(i._roots[t]),Ze(0,i,e,n,r,s,o),R.clearBuffer()}function Ze(i,t,e,n,r,s,o){let{float32Array:f,uint16Array:c,uint32Array:m}=R,u=i*2;if(F(u,c)){let l=C(i,m),p=z(u,c);Kn(t,e,n,l,p,r,s,o)}else{let l=O(i);Q(l,f,n,s,o)&&Ze(l,t,e,n,r,s,o);let p=L(i,m);Q(p,f,n,s,o)&&Ze(p,t,e,n,r,s,o)}}var Gi=["x","y","z"];function ii(i,t,e,n,r,s){R.setBuffer(i._roots[t]);let o=Ke(0,i,e,n,r,s);return R.clearBuffer(),o}function Ke(i,t,e,n,r,s){let{float32Array:o,uint16Array:f,uint32Array:c}=R,m=i*2;if(F(m,f)){let a=C(i,c),l=z(m,f);return $n(t,e,n,a,l,r,s)}else{let a=ot(i,c),l=Gi[a],g=n.direction[l]>=0,v,T;g?(v=O(i),T=L(i,c)):(v=L(i,c),T=O(i));let d=Q(v,o,n,r,s)?Ke(v,t,e,n,r,s):null;if(d){let x=d.point[l];if(g?x<=o[T+a]:x>=o[T+a+3])return d}let h=Q(T,o,n,r,s)?Ke(T,t,e,n,r,s):null;return d&&h?d.distance<=h.distance?d:h:d||h||null}}var me=new W,Pt=new X,It=new X,Vt=new q,ri=new G,de=new G;function oi(i,t,e,n){R.setBuffer(i._roots[t]);let r=$e(0,i,e,n);return R.clearBuffer(),r}function $e(i,t,e,n,r=null){let{float32Array:s,uint16Array:o,uint32Array:f}=R,c=i*2;if(r===null&&(e.boundingBox||e.computeBoundingBox(),ri.set(e.boundingBox.min,e.boundingBox.max,n),r=ri),F(c,o)){let u=t.geometry,a=u.index,l=u.attributes.position,p=e.index,g=e.attributes.position,v=C(i,f),T=z(c,o);if(Vt.copy(n).invert(),e.boundsTree)return U(i,s,de),de.matrix.copy(Vt),de.needsUpdate=!0,e.boundsTree.shapecast({intersectsBounds:d=>de.intersectsBox(d),intersectsTriangle:d=>{d.a.applyMatrix4(n),d.b.applyMatrix4(n),d.c.applyMatrix4(n),d.needsUpdate=!0;for(let y=v*3,h=(T+v)*3;y<h;y+=3)if(H(It,y,a,l),It.needsUpdate=!0,d.intersectsTriangle(It))return!0;return!1}});{let A=ft(e);for(let d=v*3,y=(T+v)*3;d<y;d+=3){H(Pt,d,a,l),Pt.a.applyMatrix4(Vt),Pt.b.applyMatrix4(Vt),Pt.c.applyMatrix4(Vt),Pt.needsUpdate=!0;for(let h=0,x=A*3;h<x;h+=3)if(H(It,h,p,g),It.needsUpdate=!0,Pt.intersectsTriangle(It))return!0}}}else{let u=O(i),a=L(i,f);return U(u,s,me),!!(r.intersectsBox(me)&&$e(u,t,e,n,r)||(U(a,s,me),r.intersectsBox(me)&&$e(a,t,e,n,r)))}}var ye=new q,je=new G,Gt=new G,ki=new D,qi=new D,Yi=new D,Xi=new D;function si(i,t,e,n={},r={},s=0,o=1/0){t.boundingBox||t.computeBoundingBox(),je.set(t.boundingBox.min,t.boundingBox.max,e),je.needsUpdate=!0;let f=i.geometry,c=f.attributes.position,m=f.index,u=t.attributes.position,a=t.index,l=Z.getPrimitive(),p=Z.getPrimitive(),g=ki,v=qi,T=null,A=null;r&&(T=Yi,A=Xi);let d=1/0,y=null,h=null;return ye.copy(e).invert(),Gt.matrix.copy(ye),i.shapecast({boundsTraverseOrder:x=>je.distanceToBox(x),intersectsBounds:(x,E,w)=>w<d&&w<o?(E&&(Gt.min.copy(x.min),Gt.max.copy(x.max),Gt.needsUpdate=!0),!0):!1,intersectsRange:(x,E)=>{if(t.boundsTree)return t.boundsTree.shapecast({boundsTraverseOrder:_=>Gt.distanceToBox(_),intersectsBounds:(_,b,B)=>B<d&&B<o,intersectsRange:(_,b)=>{for(let B=_,P=_+b;B<P;B++){H(p,3*B,a,u),p.a.applyMatrix4(e),p.b.applyMatrix4(e),p.c.applyMatrix4(e),p.needsUpdate=!0;for(let S=x,I=x+E;S<I;S++){H(l,3*S,m,c),l.needsUpdate=!0;let M=l.distanceToTriangle(p,g,T);if(M<d&&(v.copy(g),A&&A.copy(T),d=M,y=S,h=B),M<s)return!0}}}});{let w=ft(t);for(let _=0,b=w;_<b;_++){H(p,3*_,a,u),p.a.applyMatrix4(e),p.b.applyMatrix4(e),p.c.applyMatrix4(e),p.needsUpdate=!0;for(let B=x,P=x+E;B<P;B++){H(l,3*B,m,c),l.needsUpdate=!0;let S=l.distanceToTriangle(p,g,T);if(S<d&&(v.copy(g),A&&A.copy(T),d=S,y=B,h=_),S<s)return!0}}}}}),Z.releasePrimitive(l),Z.releasePrimitive(p),d===1/0?null:(n.point?n.point.copy(v):n.point=v.clone(),n.distance=d,n.faceIndex=y,r&&(r.point?r.point.copy(A):r.point=A.clone(),r.point.applyMatrix4(ye),v.applyMatrix4(ye),r.distance=v.sub(r.point).length(),r.faceIndex=h),n)}function ci(i,t=null){t&&Array.isArray(t)&&(t=new Set(t));let e=i.geometry,n=e.index?e.index.array:null,r=e.attributes.position,s,o,f,c,m=0,u=i._roots;for(let l=0,p=u.length;l<p;l++)s=u[l],o=new Uint32Array(s),f=new Uint16Array(s),c=new Float32Array(s),a(0,m),m+=s.byteLength;function a(l,p,g=!1){let v=l*2;if(F(v,f)){let T=C(l,o),A=z(v,f),d=1/0,y=1/0,h=1/0,x=-1/0,E=-1/0,w=-1/0;for(let _=T,b=T+A;_<b;_++){let B=3*i.resolveTriangleIndex(_);for(let P=0;P<3;P++){let S=B+P;S=n?n[S]:S;let I=r.getX(S),M=r.getY(S),N=r.getZ(S);I<d&&(d=I),I>x&&(x=I),M<y&&(y=M),M>E&&(E=M),N<h&&(h=N),N>w&&(w=N)}}return c[l+0]!==d||c[l+1]!==y||c[l+2]!==h||c[l+3]!==x||c[l+4]!==E||c[l+5]!==w?(c[l+0]=d,c[l+1]=y,c[l+2]=h,c[l+3]=x,c[l+4]=E,c[l+5]=w,!0):!1}else{let T=O(l),A=L(l,o),d=g,y=!1,h=!1;if(t){if(!d){let B=T/8+p/32,P=A/8+p/32;y=t.has(B),h=t.has(P),d=!y&&!h}}else y=!0,h=!0;let x=d||y,E=d||h,w=!1;x&&(w=a(T,p,d));let _=!1;E&&(_=a(A,p,d));let b=w||_;if(b)for(let B=0;B<3;B++){let P=T+B,S=A+B,I=c[P],M=c[P+3],N=c[S],V=c[S+3];c[l+B]=I<N?I:N,c[l+B+3]=M>V?M:V}return b}}}function ai(i,t,e,n,r,s,o){R.setBuffer(i._roots[t]),Je(0,i,e,n,r,s,o),R.clearBuffer()}function Je(i,t,e,n,r,s,o){let{float32Array:f,uint16Array:c,uint32Array:m}=R,u=i*2;if(F(u,c)){let l=C(i,m),p=z(u,c);Qn(t,e,n,l,p,r,s,o)}else{let l=O(i);Q(l,f,n,s,o)&&Je(l,t,e,n,r,s,o);let p=L(i,m);Q(p,f,n,s,o)&&Je(p,t,e,n,r,s,o)}}var Wi=["x","y","z"];function li(i,t,e,n,r,s){R.setBuffer(i._roots[t]);let o=Qe(0,i,e,n,r,s);return R.clearBuffer(),o}function Qe(i,t,e,n,r,s){let{float32Array:o,uint16Array:f,uint32Array:c}=R,m=i*2;if(F(m,f)){let a=C(i,c),l=z(m,f);return ti(t,e,n,a,l,r,s)}else{let a=ot(i,c),l=Wi[a],g=n.direction[l]>=0,v,T;g?(v=O(i),T=L(i,c)):(v=L(i,c),T=O(i));let d=Q(v,o,n,r,s)?Qe(v,t,e,n,r,s):null;if(d){let x=d.point[l];if(g?x<=o[T+a]:x>=o[T+a+3])return d}let h=Q(T,o,n,r,s)?Qe(T,t,e,n,r,s):null;return d&&h?d.distance<=h.distance?d:h:d||h||null}}var xe=new W,Dt=new X,Mt=new X,kt=new q,fi=new G,he=new G;function ui(i,t,e,n){R.setBuffer(i._roots[t]);let r=tn(0,i,e,n);return R.clearBuffer(),r}function tn(i,t,e,n,r=null){let{float32Array:s,uint16Array:o,uint32Array:f}=R,c=i*2;if(r===null&&(e.boundingBox||e.computeBoundingBox(),fi.set(e.boundingBox.min,e.boundingBox.max,n),r=fi),F(c,o)){let u=t.geometry,a=u.index,l=u.attributes.position,p=e.index,g=e.attributes.position,v=C(i,f),T=z(c,o);if(kt.copy(n).invert(),e.boundsTree)return U(i,s,he),he.matrix.copy(kt),he.needsUpdate=!0,e.boundsTree.shapecast({intersectsBounds:d=>he.intersectsBox(d),intersectsTriangle:d=>{d.a.applyMatrix4(n),d.b.applyMatrix4(n),d.c.applyMatrix4(n),d.needsUpdate=!0;for(let y=v,h=T+v;y<h;y++)if(H(Mt,3*t.resolveTriangleIndex(y),a,l),Mt.needsUpdate=!0,d.intersectsTriangle(Mt))return!0;return!1}});{let A=ft(e);for(let d=v,y=T+v;d<y;d++){let h=t.resolveTriangleIndex(d);H(Dt,3*h,a,l),Dt.a.applyMatrix4(kt),Dt.b.applyMatrix4(kt),Dt.c.applyMatrix4(kt),Dt.needsUpdate=!0;for(let x=0,E=A*3;x<E;x+=3)if(H(Mt,x,p,g),Mt.needsUpdate=!0,Dt.intersectsTriangle(Mt))return!0}}}else{let u=O(i),a=L(i,f);return U(u,s,xe),!!(r.intersectsBox(xe)&&tn(u,t,e,n,r)||(U(a,s,xe),r.intersectsBox(xe)&&tn(a,t,e,n,r)))}}var ge=new q,en=new G,qt=new G,Zi=new D,Ki=new D,$i=new D,ji=new D;function pi(i,t,e,n={},r={},s=0,o=1/0){t.boundingBox||t.computeBoundingBox(),en.set(t.boundingBox.min,t.boundingBox.max,e),en.needsUpdate=!0;let f=i.geometry,c=f.attributes.position,m=f.index,u=t.attributes.position,a=t.index,l=Z.getPrimitive(),p=Z.getPrimitive(),g=Zi,v=Ki,T=null,A=null;r&&(T=$i,A=ji);let d=1/0,y=null,h=null;return ge.copy(e).invert(),qt.matrix.copy(ge),i.shapecast({boundsTraverseOrder:x=>en.distanceToBox(x),intersectsBounds:(x,E,w)=>w<d&&w<o?(E&&(qt.min.copy(x.min),qt.max.copy(x.max),qt.needsUpdate=!0),!0):!1,intersectsRange:(x,E)=>{if(t.boundsTree){let w=t.boundsTree;return w.shapecast({boundsTraverseOrder:_=>qt.distanceToBox(_),intersectsBounds:(_,b,B)=>B<d&&B<o,intersectsRange:(_,b)=>{for(let B=_,P=_+b;B<P;B++){let S=w.resolveTriangleIndex(B);H(p,3*S,a,u),p.a.applyMatrix4(e),p.b.applyMatrix4(e),p.c.applyMatrix4(e),p.needsUpdate=!0;for(let I=x,M=x+E;I<M;I++){let N=i.resolveTriangleIndex(I);H(l,3*N,m,c),l.needsUpdate=!0;let V=l.distanceToTriangle(p,g,T);if(V<d&&(v.copy(g),A&&A.copy(T),d=V,y=I,h=B),V<s)return!0}}}})}else{let w=ft(t);for(let _=0,b=w;_<b;_++){H(p,3*_,a,u),p.a.applyMatrix4(e),p.b.applyMatrix4(e),p.c.applyMatrix4(e),p.needsUpdate=!0;for(let B=x,P=x+E;B<P;B++){let S=i.resolveTriangleIndex(B);H(l,3*S,m,c),l.needsUpdate=!0;let I=l.distanceToTriangle(p,g,T);if(I<d&&(v.copy(g),A&&A.copy(T),d=I,y=B,h=_),I<s)return!0}}}}}),Z.releasePrimitive(l),Z.releasePrimitive(p),d===1/0?null:(n.point?n.point.copy(v):n.point=v.clone(),n.distance=d,n.faceIndex=y,r&&(r.point?r.point.copy(A):r.point=A.clone(),r.point.applyMatrix4(ge),v.applyMatrix4(ge),r.distance=v.sub(r.point).length(),r.faceIndex=h),n)}function nn(i,t,e){return i===null?null:(i.point.applyMatrix4(t.matrixWorld),i.distance=i.point.distanceTo(e.ray.origin),i.object=t,i)}var ve=new G,Te=new Tn,mi=new D,di=new q,yi=new D,rn=["getX","getY","getZ"],Ae=class i extends ae{static serialize(t,e={}){e={cloneBuffers:!0,...e};let n=t.geometry,r=t._roots,s=t._indirectBuffer,o=n.getIndex(),f={version:1,roots:null,index:null,indirectBuffer:null};return e.cloneBuffers?(f.roots=r.map(c=>c.slice()),f.index=o?o.array.slice():null,f.indirectBuffer=s?s.slice():null):(f.roots=r,f.index=o?o.array:null,f.indirectBuffer=s),f}static deserialize(t,e,n={}){n={setIndex:!0,indirect:!!t.indirectBuffer,...n};let{index:r,roots:s,indirectBuffer:o}=t;t.version||(console.warn("MeshBVH.deserialize: Serialization format has been changed and will be fixed up. It is recommended to regenerate any stored serialized data."),c(s));let f=new i(e,{...n,[Ft]:!0});if(f._roots=s,f._indirectBuffer=o||null,n.setIndex){let m=e.getIndex();if(m===null){let u=new gt(t.index,1,!1);e.setIndex(u)}else m.array!==r&&(m.array.set(r),m.needsUpdate=!0)}return f;function c(m){for(let u=0;u<m.length;u++){let a=m[u],l=new Uint32Array(a),p=new Uint16Array(a);for(let g=0,v=a.byteLength/32;g<v;g++){let T=8*g,A=2*T;F(A,p)||(l[T+6]=l[T+6]/8-g)}}}}get primitiveStride(){return 3}get resolveTriangleIndex(){return this.resolvePrimitiveIndex}constructor(t,e={}){e.maxLeafTris&&(console.warn('MeshBVH: "maxLeafTris" option has been deprecated. Use "targetLeafSize", instead.'),e={...e,targetLeafSize:e.maxLeafTris}),super(t,e)}shiftTriangleOffsets(t){return super.shiftPrimitiveOffsets(t)}writePrimitiveBounds(t,e,n){let r=this.geometry,s=this._indirectBuffer,o=r.attributes.position,f=r.index?r.index.array:null,m=(s?s[t]:t)*3,u=m+0,a=m+1,l=m+2;f&&(u=f[u],a=f[a],l=f[l]);for(let p=0;p<3;p++){let g=o[rn[p]](u),v=o[rn[p]](a),T=o[rn[p]](l),A=g;v<A&&(A=v),T<A&&(A=T);let d=g;v>d&&(d=v),T>d&&(d=T),e[n+p]=A,e[n+p+3]=d}return e}computePrimitiveBounds(t,e,n){let r=this.geometry,s=this._indirectBuffer,o=r.attributes.position,f=r.index?r.index.array:null,c=o.normalized;if(t<0||e+t-n.offset>n.length/6)throw new Error("MeshBVH: compute triangle bounds range is invalid.");let m=o.array,u=o.offset||0,a=3;o.isInterleavedBufferAttribute&&(a=o.data.stride);let l=["getX","getY","getZ"],p=n.offset;for(let g=t,v=t+e;g<v;g++){let A=(s?s[g]:g)*3,d=(g-p)*6,y=A+0,h=A+1,x=A+2;f&&(y=f[y],h=f[h],x=f[x]),c||(y=y*a+u,h=h*a+u,x=x*a+u);for(let E=0;E<3;E++){let w,_,b;c?(w=o[l[E]](y),_=o[l[E]](h),b=o[l[E]](x)):(w=m[y+E],_=m[h+E],b=m[x+E]);let B=w;_<B&&(B=_),b<B&&(B=b);let P=w;_>P&&(P=_),b>P&&(P=b);let S=(P-B)/2,I=E*2;n[d+I+0]=B+S,n[d+I+1]=S+(Math.abs(B)+S)*vt}}return n}raycastObject3D(t,e,n=[]){let{material:r}=t;if(r===void 0)return;di.copy(t.matrixWorld).invert(),Te.copy(e.ray).applyMatrix4(di),yi.setFromMatrixScale(t.matrixWorld),mi.copy(Te.direction).multiply(yi);let s=mi.length(),o=e.near/s,f=e.far/s;if(e.firstHitOnly===!0){let c=this.raycastFirst(Te,r,o,f);c=nn(c,t,e),c&&n.push(c)}else{let c=this.raycast(Te,r,o,f);for(let m=0,u=c.length;m<u;m++){let a=nn(c[m],t,e);a&&n.push(a)}}return n}refit(t=null){return(this.indirect?ci:Jn)(this,t)}raycast(t,e=De,n=0,r=1/0){let s=this._roots,o=[],f=this.indirect?ai:ni;for(let c=0,m=s.length;c<m;c++)f(this,c,e,t,o,n,r);return o}raycastFirst(t,e=De,n=0,r=1/0){let s=this._roots,o=null,f=this.indirect?li:ii;for(let c=0,m=s.length;c<m;c++){let u=f(this,c,e,t,n,r);u!=null&&(o==null||u.distance<o.distance)&&(o=u)}return o}intersectsGeometry(t,e){let n=!1,r=this._roots,s=this.indirect?ui:oi;for(let o=0,f=r.length;o<f&&(n=s(this,o,t,e),!n);o++);return n}shapecast(t){let e=Z.getPrimitive(),n=super.shapecast({...t,intersectsPrimitive:t.intersectsTriangle,scratchPrimitive:e,iterate:this.indirect?ei:jn});return Z.releasePrimitive(e),n}bvhcast(t,e,n){let{intersectsRanges:r,intersectsTriangles:s}=n,o=Z.getPrimitive(),f=this.geometry.index,c=this.geometry.attributes.position,m=this.indirect?g=>{let v=this.resolveTriangleIndex(g);H(o,v*3,f,c)}:g=>{H(o,g*3,f,c)},u=Z.getPrimitive(),a=t.geometry.index,l=t.geometry.attributes.position,p=t.indirect?g=>{let v=t.resolveTriangleIndex(g);H(u,v*3,a,l)}:g=>{H(u,g*3,a,l)};if(s){if(!(t instanceof i))throw new Error('MeshBVH: "intersectsTriangles" callback can only be used with another MeshBVH.');let g=(v,T,A,d,y,h,x,E)=>{for(let w=A,_=A+d;w<_;w++){p(w),u.a.applyMatrix4(e),u.b.applyMatrix4(e),u.c.applyMatrix4(e),u.needsUpdate=!0;for(let b=v,B=v+T;b<B;b++)if(m(b),o.needsUpdate=!0,s(o,u,b,w,y,h,x,E))return!0}return!1};if(r){let v=r;r=function(T,A,d,y,h,x,E,w){return v(T,A,d,y,h,x,E,w)?!0:g(T,A,d,y,h,x,E,w)}}else r=g}return super.bvhcast(t,e,{intersectsRanges:r})}intersectsBox(t,e){return ve.set(t.min,t.max,e),ve.needsUpdate=!0,this.shapecast({intersectsBounds:n=>ve.intersectsBox(n),intersectsTriangle:n=>ve.intersectsTriangle(n)})}intersectsSphere(t){return this.shapecast({intersectsBounds:e=>t.intersectsBox(e),intersectsTriangle:e=>e.intersectsSphere(t)})}closestPointToGeometry(t,e,n={},r={},s=0,o=1/0){return(this.indirect?pi:si)(this,t,e,n,r,s,o)}closestPointToPoint(t,e={},n=0,r=1/0){return Gn(this,t,e,n,r)}};function Ji(i){switch(i){case 1:return"R";case 2:return"RG";case 3:return"RGBA";case 4:return"RGBA"}throw new Error}function Qi(i){switch(i){case 1:return mn;case 2:return yn;case 3:return ht;case 4:return ht}}function xi(i){switch(i){case 1:return dn;case 2:return Zt;case 3:return Kt;case 4:return Kt}}var we=class extends Nt{constructor(){super(),this.minFilter=it,this.magFilter=it,this.generateMipmaps=!1,this.overrideItemSize=null,this._forcedType=null}updateFrom(t){let e=this.overrideItemSize,n=t.itemSize,r=t.count;if(e!==null){if(n*r%e!==0)throw new Error("VertexAttributeTexture: overrideItemSize must divide evenly into buffer length.");t.itemSize=e,t.count=r*n/e}let s=t.itemSize,o=t.count,f=t.normalized,c=t.array.constructor,m=c.BYTES_PER_ELEMENT,u=this._forcedType,a=s;if(u===null)switch(c){case Float32Array:u=pt;break;case Uint8Array:case Uint16Array:case Uint32Array:u=ut;break;case Int8Array:case Int16Array:case Int32Array:u=Wt;break}let l,p,g,v,T=Ji(s);switch(u){case pt:g=1,p=Qi(s),f&&m===1?(v=c,T+="8",c===Uint8Array?l=Me:(l=Ne,T+="_SNORM")):(v=Float32Array,T+="32F",l=pt);break;case Wt:T+=m*8+"I",g=f?Math.pow(2,c.BYTES_PER_ELEMENT*8-1):1,p=xi(s),m===1?(v=Int8Array,l=Ne):m===2?(v=Int16Array,l=fn):(v=Int32Array,l=Wt);break;case ut:T+=m*8+"UI",g=f?Math.pow(2,c.BYTES_PER_ELEMENT*8-1):1,p=xi(s),m===1?(v=Uint8Array,l=Me):m===2?(v=Uint16Array,l=un):(v=Uint32Array,l=ut);break}a===3&&(p===ht||p===Kt)&&(a=4);let A=Math.ceil(Math.sqrt(o))||1,d=a*A*A,y=new v(d),h=t.normalized;t.normalized=!1;for(let x=0;x<o;x++){let E=a*x;y[E]=t.getX(x)/g,s>=2&&(y[E+1]=t.getY(x)/g),s>=3&&(y[E+2]=t.getZ(x)/g,a===4&&(y[E+3]=1)),s>=4&&(y[E+3]=t.getW(x)/g)}t.normalized=h,this.internalFormat=T,this.format=p,this.type=l,this.image.width=A,this.image.height=A,this.image.data=y,this.needsUpdate=!0,this.dispose(),t.itemSize=n,t.count=r}},Be=class extends we{constructor(){super(),this._forcedType=ut}};var Ee=class extends we{constructor(){super(),this._forcedType=pt}};var Se=class{constructor(){this.index=new Be,this.position=new Ee,this.bvhBounds=new Nt,this.bvhContents=new Nt,this._cachedIndexAttr=null,this.index.overrideItemSize=3}updateFrom(t){let{geometry:e}=t;if(er(t,this.bvhBounds,this.bvhContents),this.position.updateFrom(e.attributes.position),t.indirect){let n=t._indirectBuffer;if(this._cachedIndexAttr===null||this._cachedIndexAttr.count!==n.length)if(e.index)this._cachedIndexAttr=e.index.clone();else{let r=qe(Lt(e));this._cachedIndexAttr=new gt(r,1,!1)}tr(e,n,this._cachedIndexAttr),this.index.updateFrom(this._cachedIndexAttr)}else this.index.updateFrom(e.index)}dispose(){let{index:t,position:e,bvhBounds:n,bvhContents:r}=this;t&&t.dispose(),e&&e.dispose(),n&&n.dispose(),r&&r.dispose()}};function tr(i,t,e){let n=e.array,r=i.index?i.index.array:null;for(let s=0,o=t.length;s<o;s++){let f=3*s,c=3*t[s];for(let m=0;m<3;m++)n[f+m]=r?r[c+m]:c+m}}function er(i,t,e){let n=i._roots;if(n.length!==1)throw new Error("MeshBVHUniformStruct: Multi-root BVHs not supported.");let r=n[0],s=new Uint16Array(r),o=new Uint32Array(r),f=new Float32Array(r),c=r.byteLength/32,m=2*Math.ceil(Math.sqrt(c/2)),u=new Float32Array(4*m*m),a=Math.ceil(Math.sqrt(c)),l=new Uint32Array(2*a*a);for(let p=0;p<c;p++){let g=p*32/4,v=g*2,T=g;for(let A=0;A<3;A++)u[8*p+0+A]=f[T+0+A],u[8*p+4+A]=f[T+3+A];if(F(v,s)){let A=z(v,s),d=C(g,o),y=-65536|A;l[p*2+0]=y,l[p*2+1]=d}else{let A=o[g+6],d=ot(g,o);l[p*2+0]=d,l[p*2+1]=A}}t.image.data=u,t.image.width=m,t.image.height=m,t.format=ht,t.type=pt,t.internalFormat="RGBA32F",t.minFilter=it,t.magFilter=it,t.generateMipmaps=!1,t.needsUpdate=!0,t.dispose(),e.image.data=l,e.image.width=a,e.image.height=a,e.format=Zt,e.type=ut,e.internalFormat="RG32UI",e.minFilter=it,e.magFilter=it,e.generateMipmaps=!1,e.needsUpdate=!0,e.dispose()}var hi=`

// A stack of uint32 indices can can store the indices for
// a perfectly balanced tree with a depth up to 31. Lower stack
// depth gets higher performance.
//
// However not all trees are balanced. Best value to set this to
// is the trees max depth.
#ifndef BVH_STACK_DEPTH
#define BVH_STACK_DEPTH 60
#endif

#ifndef INFINITY
#define INFINITY 1e20
#endif

// Utilities
uvec4 uTexelFetch1D( usampler2D tex, uint index ) {

	uint width = uint( textureSize( tex, 0 ).x );
	uvec2 uv;
	uv.x = index % width;
	uv.y = index / width;

	return texelFetch( tex, ivec2( uv ), 0 );

}

ivec4 iTexelFetch1D( isampler2D tex, uint index ) {

	uint width = uint( textureSize( tex, 0 ).x );
	uvec2 uv;
	uv.x = index % width;
	uv.y = index / width;

	return texelFetch( tex, ivec2( uv ), 0 );

}

vec4 texelFetch1D( sampler2D tex, uint index ) {

	uint width = uint( textureSize( tex, 0 ).x );
	uvec2 uv;
	uv.x = index % width;
	uv.y = index / width;

	return texelFetch( tex, ivec2( uv ), 0 );

}

vec4 textureSampleBarycoord( sampler2D tex, vec3 barycoord, uvec3 faceIndices ) {

	return
		barycoord.x * texelFetch1D( tex, faceIndices.x ) +
		barycoord.y * texelFetch1D( tex, faceIndices.y ) +
		barycoord.z * texelFetch1D( tex, faceIndices.z );

}

void ndcToCameraRay(
	vec2 coord, mat4 cameraWorld, mat4 invProjectionMatrix,
	out vec3 rayOrigin, out vec3 rayDirection
) {

	// get camera look direction and near plane for camera clipping
	vec4 lookDirection = cameraWorld * vec4( 0.0, 0.0, - 1.0, 0.0 );
	vec4 nearVector = invProjectionMatrix * vec4( 0.0, 0.0, - 1.0, 1.0 );
	float near = abs( nearVector.z / nearVector.w );

	// get the camera direction and position from camera matrices
	vec4 origin = cameraWorld * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec4 direction = invProjectionMatrix * vec4( coord, 0.5, 1.0 );
	direction /= direction.w;
	direction = cameraWorld * direction - origin;

	// slide the origin along the ray until it sits at the near clip plane position
	origin.xyz += direction.xyz * near / dot( direction, lookDirection );

	rayOrigin = origin.xyz;
	rayDirection = direction.xyz;

}
`;var gi=`

#ifndef TRI_INTERSECT_EPSILON
#define TRI_INTERSECT_EPSILON 1e-5
#endif

// Raycasting
bool intersectsBounds( vec3 rayOrigin, vec3 rayDirection, vec3 boundsMin, vec3 boundsMax, out float dist ) {

	// https://www.reddit.com/r/opengl/comments/8ntzz5/fast_glsl_ray_box_intersection/
	// https://tavianator.com/2011/ray_box.html
	vec3 invDir = 1.0 / rayDirection;

	// find intersection distances for each plane
	vec3 tMinPlane = invDir * ( boundsMin - rayOrigin );
	vec3 tMaxPlane = invDir * ( boundsMax - rayOrigin );

	// get the min and max distances from each intersection
	vec3 tMinHit = min( tMaxPlane, tMinPlane );
	vec3 tMaxHit = max( tMaxPlane, tMinPlane );

	// get the furthest hit distance
	vec2 t = max( tMinHit.xx, tMinHit.yz );
	float t0 = max( t.x, t.y );

	// get the minimum hit distance
	t = min( tMaxHit.xx, tMaxHit.yz );
	float t1 = min( t.x, t.y );

	// set distance to 0.0 if the ray starts inside the box
	dist = max( t0, 0.0 );

	return t1 >= dist;

}

bool intersectsTriangle(
	vec3 rayOrigin, vec3 rayDirection, vec3 a, vec3 b, vec3 c,
	out vec3 barycoord, out vec3 norm, out float dist, out float side
) {

	// https://stackoverflow.com/questions/42740765/intersection-between-line-and-triangle-in-3d
	vec3 edge1 = b - a;
	vec3 edge2 = c - a;
	norm = cross( edge1, edge2 );

	float det = - dot( rayDirection, norm );
	float invdet = 1.0 / det;

	vec3 AO = rayOrigin - a;
	vec3 DAO = cross( AO, rayDirection );

	vec4 uvt;
	uvt.x = dot( edge2, DAO ) * invdet;
	uvt.y = - dot( edge1, DAO ) * invdet;
	uvt.z = dot( AO, norm ) * invdet;
	uvt.w = 1.0 - uvt.x - uvt.y;

	// set the hit information
	barycoord = uvt.wxy; // arranged in A, B, C order
	dist = uvt.z;
	side = sign( det );
	norm = side * normalize( norm );

	// add an epsilon to avoid misses between triangles
	uvt += vec4( TRI_INTERSECT_EPSILON );

	return all( greaterThanEqual( uvt, vec4( 0.0 ) ) );

}

bool intersectTriangles(
	// geometry info and triangle range
	sampler2D positionAttr, usampler2D indexAttr, uint offset, uint count,

	// ray
	vec3 rayOrigin, vec3 rayDirection,

	// outputs
	inout float minDistance, inout uvec4 faceIndices, inout vec3 faceNormal, inout vec3 barycoord,
	inout float side, inout float dist
) {

	bool found = false;
	vec3 localBarycoord, localNormal;
	float localDist, localSide;
	for ( uint i = offset, l = offset + count; i < l; i ++ ) {

		uvec3 indices = uTexelFetch1D( indexAttr, i ).xyz;
		vec3 a = texelFetch1D( positionAttr, indices.x ).rgb;
		vec3 b = texelFetch1D( positionAttr, indices.y ).rgb;
		vec3 c = texelFetch1D( positionAttr, indices.z ).rgb;

		if (
			intersectsTriangle( rayOrigin, rayDirection, a, b, c, localBarycoord, localNormal, localDist, localSide )
			&& localDist < minDistance
		) {

			found = true;
			minDistance = localDist;

			faceIndices = uvec4( indices.xyz, i );
			faceNormal = localNormal;

			side = localSide;
			barycoord = localBarycoord;
			dist = localDist;

		}

	}

	return found;

}

bool intersectsBVHNodeBounds( vec3 rayOrigin, vec3 rayDirection, sampler2D bvhBounds, uint currNodeIndex, out float dist ) {

	uint cni2 = currNodeIndex * 2u;
	vec3 boundsMin = texelFetch1D( bvhBounds, cni2 ).xyz;
	vec3 boundsMax = texelFetch1D( bvhBounds, cni2 + 1u ).xyz;
	return intersectsBounds( rayOrigin, rayDirection, boundsMin, boundsMax, dist );

}

// use a macro to hide the fact that we need to expand the struct into separate fields
#define	bvhIntersectFirstHit(		bvh,		rayOrigin, rayDirection, faceIndices, faceNormal, barycoord, side, dist	)	_bvhIntersectFirstHit(		bvh.position, bvh.index, bvh.bvhBounds, bvh.bvhContents,		rayOrigin, rayDirection, faceIndices, faceNormal, barycoord, side, dist	)

bool _bvhIntersectFirstHit(
	// bvh info
	sampler2D bvh_position, usampler2D bvh_index, sampler2D bvh_bvhBounds, usampler2D bvh_bvhContents,

	// ray
	vec3 rayOrigin, vec3 rayDirection,

	// output variables split into separate variables due to output precision
	inout uvec4 faceIndices, inout vec3 faceNormal, inout vec3 barycoord,
	inout float side, inout float dist
) {

	// stack needs to be twice as long as the deepest tree we expect because
	// we push both the left and right child onto the stack every traversal
	int pointer = 0;
	uint stack[ BVH_STACK_DEPTH ];
	stack[ 0 ] = 0u;

	float triangleDistance = INFINITY;
	bool found = false;
	while ( pointer > - 1 && pointer < BVH_STACK_DEPTH ) {

		uint currNodeIndex = stack[ pointer ];
		pointer --;

		// check if we intersect the current bounds
		float boundsHitDistance;
		if (
			! intersectsBVHNodeBounds( rayOrigin, rayDirection, bvh_bvhBounds, currNodeIndex, boundsHitDistance )
			|| boundsHitDistance > triangleDistance
		) {

			continue;

		}

		uvec2 boundsInfo = uTexelFetch1D( bvh_bvhContents, currNodeIndex ).xy;
		bool isLeaf = bool( boundsInfo.x & 0xffff0000u );

		if ( isLeaf ) {

			uint count = boundsInfo.x & 0x0000ffffu;
			uint offset = boundsInfo.y;

			found = intersectTriangles(
				bvh_position, bvh_index, offset, count,
				rayOrigin, rayDirection, triangleDistance,
				faceIndices, faceNormal, barycoord, side, dist
			) || found;

		} else {

			uint leftIndex = currNodeIndex + 1u;
			uint splitAxis = boundsInfo.x & 0x0000ffffu;
			uint rightIndex = currNodeIndex + boundsInfo.y;

			bool leftToRight = rayDirection[ splitAxis ] >= 0.0;
			uint c1 = leftToRight ? leftIndex : rightIndex;
			uint c2 = leftToRight ? rightIndex : leftIndex;

			// set c2 in the stack so we traverse it later. We need to keep track of a pointer in
			// the stack while we traverse. The second pointer added is the one that will be
			// traversed first
			pointer ++;
			stack[ pointer ] = c2;

			pointer ++;
			stack[ pointer ] = c1;

		}

	}

	return found;

}
`;var vi=`
struct BVH {

	usampler2D index;
	sampler2D position;

	sampler2D bvhBounds;
	usampler2D bvhContents;

};
`;var Ti=vi;var Ai=`
	${hi}
	${gi}
`;function Dc(i,t){let e=new Se;return e.updateFrom(new Ae(i.clone(),{strategy:2})),new En({defines:{ENVMAP_TYPE_CUBEM:"",CHROMATIC_ABERRATIONS:"",FAST_CHROMA:""},uniforms:{lightDirection:{value:new D(0,1,1).normalize()},lightStrength:{value:0},envMap:{value:t},bounces:{value:5},ior:{value:2.417},correctMips:{value:!0},aberrationStrength:{value:.018},fresnel:{value:.12},bvh:{value:e},color:{value:new $t("#f8fbff")},opacity:{value:1},resolution:{value:new K(1600,1e3)},viewMatrixInverse:{value:new q},projectionMatrixInverse:{value:new q}},vertexShader:`
  uniform mat4 viewMatrixInverse;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying mat4 vModelMatrixInverse;

  #include <color_pars_vertex>

  void main() {
    #include <color_vertex>

    vec4 transformedNormal = vec4(normal, 0.0);
    vec4 transformedPosition = vec4(position, 1.0);
    #ifdef USE_INSTANCING
      transformedNormal = instanceMatrix * transformedNormal;
      transformedPosition = instanceMatrix * transformedPosition;
    #endif

    #ifdef USE_INSTANCING
      vModelMatrixInverse = inverse(modelMatrix * instanceMatrix);
    #else
      vModelMatrixInverse = inverse(modelMatrix);
    #endif

    vWorldPosition = (modelMatrix * transformedPosition).xyz;
    vNormal = normalize((viewMatrixInverse * vec4(normalMatrix * transformedNormal.xyz, 0.0)).xyz);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * transformedPosition;
  }`,fragmentShader:`
  
  precision highp isampler2D;
  precision highp usampler2D;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying mat4 vModelMatrixInverse;

  #include <color_pars_fragment>

  #ifdef ENVMAP_TYPE_CUBEM
    uniform samplerCube envMap;
  #else
    uniform sampler2D envMap;
  #endif

  uniform float bounces;
  ${Ti}
  ${Ai}
  uniform BVH bvh;
  uniform float ior;
  uniform bool correctMips;
  uniform vec2 resolution;
  uniform float fresnel;
  uniform mat4 modelMatrix;
  uniform mat4 projectionMatrixInverse;
  uniform mat4 viewMatrixInverse;
  uniform float aberrationStrength;
  uniform vec3 color;
  uniform float opacity;
  uniform vec3 lightDirection;
  uniform float lightStrength;

  float fresnelFunc(vec3 viewDirection, vec3 worldNormal) {
    return pow( 1.0 + dot( viewDirection, worldNormal), 10.0 );
  }

  vec3 totalInternalReflection(vec3 ro, vec3 rd, vec3 normal, float ior, mat4 modelMatrixInverse) {
    vec3 rayOrigin = ro;
    vec3 rayDirection = rd;
    rayDirection = refract(rayDirection, normal, 1.0 / ior);
    rayOrigin = vWorldPosition + rayDirection * 0.001;
    rayOrigin = (modelMatrixInverse * vec4(rayOrigin, 1.0)).xyz;
    rayDirection = normalize((modelMatrixInverse * vec4(rayDirection, 0.0)).xyz);
    for(float i = 0.0; i < bounces; i++) {
      uvec4 faceIndices = uvec4( 0u );
      vec3 faceNormal = vec3( 0.0, 0.0, 1.0 );
      vec3 barycoord = vec3( 0.0 );
      float side = 1.0;
      float dist = 0.0;
      bvhIntersectFirstHit( bvh, rayOrigin, rayDirection, faceIndices, faceNormal, barycoord, side, dist );
      vec3 hitPos = rayOrigin + rayDirection * max(dist - 0.001, 0.0);
      vec3 tempDir = refract(rayDirection, faceNormal, ior);
      if (length(tempDir) != 0.0) {
        rayDirection = tempDir;
        break;
      }
      rayDirection = reflect(rayDirection, faceNormal);
      rayOrigin = hitPos + rayDirection * 0.01;
    }
    rayDirection = normalize((modelMatrix * vec4(rayDirection, 0.0)).xyz);
    return rayDirection;
  }

  #include <common>
  

  #ifdef ENVMAP_TYPE_CUBEM
    vec4 textureGradient(samplerCube envMap, vec3 rayDirection, vec3 directionCamPerfect) {
      return textureGrad(envMap, rayDirection, dFdx(correctMips ? directionCamPerfect: rayDirection), dFdy(correctMips ? directionCamPerfect: rayDirection));
    }
  #else
    vec4 textureGradient(sampler2D envMap, vec3 rayDirection, vec3 directionCamPerfect) {
      vec2 uvv = equirectUv( rayDirection );
      vec2 smoothUv = equirectUv( directionCamPerfect );
      return textureGrad(envMap, uvv, dFdx(correctMips ? smoothUv : uvv), dFdy(correctMips ? smoothUv : uvv));
    }
  #endif

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec3 directionCamPerfect = (projectionMatrixInverse * vec4(uv * 2.0 - 1.0, 0.0, 1.0)).xyz;
    directionCamPerfect = (viewMatrixInverse * vec4(directionCamPerfect, 0.0)).xyz;
    directionCamPerfect = normalize(directionCamPerfect);
    vec3 normal = vNormal;
    vec3 rayOrigin = cameraPosition;
    vec3 rayDirection = normalize(vWorldPosition - cameraPosition);

    vec4 diffuseColor = vec4(color, opacity);
    #include <color_fragment>

    #ifdef CHROMATIC_ABERRATIONS
      vec3 rayDirectionG = totalInternalReflection(rayOrigin, rayDirection, normal, max(ior, 1.0), vModelMatrixInverse);
      #ifdef FAST_CHROMA
        vec3 rayDirectionR = normalize(rayDirectionG + 1.0 * vec3(aberrationStrength / 2.0));
        vec3 rayDirectionB = normalize(rayDirectionG - 1.0 * vec3(aberrationStrength / 2.0));
      #else
        vec3 rayDirectionR = totalInternalReflection(rayOrigin, rayDirection, normal, max(ior * (1.0 - aberrationStrength), 1.0), vModelMatrixInverse);
        vec3 rayDirectionB = totalInternalReflection(rayOrigin, rayDirection, normal, max(ior * (1.0 + aberrationStrength), 1.0), vModelMatrixInverse);
      #endif
      float finalColorR = textureGradient(envMap, rayDirectionR, directionCamPerfect).r;
      float finalColorG = textureGradient(envMap, rayDirectionG, directionCamPerfect).g;
      float finalColorB = textureGradient(envMap, rayDirectionB, directionCamPerfect).b;
      diffuseColor.rgb *= vec3(finalColorR, finalColorG, finalColorB);
    #else
      rayDirection = totalInternalReflection(rayOrigin, rayDirection, normal, max(ior, 1.0), vModelMatrixInverse);
      diffuseColor.rgb *= textureGradient(envMap, rayDirection, directionCamPerfect).rgb;
    #endif

    vec3 viewDirection = normalize(vWorldPosition - cameraPosition);
    float nFresnel = fresnelFunc(viewDirection, normal) * fresnel;
    vec3 surface=mix(diffuseColor.rgb,vec3(1.0),nFresnel);
    vec3 halfVector=normalize(lightDirection-viewDirection);
    float movingLight=pow(max(0.,dot(normalize(normal),halfVector)),85.);
    surface+=vec3(1.,.96,.84)*movingLight*lightStrength;
    surface*=1.+lightStrength*.18*dot(normalize(normal),lightDirection);
    gl_FragColor = vec4(surface, diffuseColor.a);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`})}function Nc(){let i=[],t=(a,l,p)=>new D(Math.cos(p)*a,l,Math.sin(p)*a);function e(...a){let l=a[1].clone().sub(a[0]).cross(a[2].clone().sub(a[0])),p=a.reduce((g,v)=>g.add(v),new D).divideScalar(a.length);p.y+=.1,l.dot(p)<0&&a.reverse();for(let g=1;g<a.length-1;g++)i.push(...a[0].toArray(),...a[g].toArray(),...a[g+1].toArray())}let n=[],r=[],s=[],o=[],f=[],c=.22+(.014-.22)*(.48*Math.cos(Math.PI/8)-.36)/(.64-.36),m=-.53+(.53-.014)*.43*Math.cos(Math.PI/8)/.64;for(let a=0;a<8;a++){let l=a*Math.PI/4;n.push(t(.36,.22,l)),r.push(t(.48,c,l+Math.PI/8)),f.push(t(.43,m,l+Math.PI/8))}for(let a=0;a<16;a++)s.push(t(.64,.014,a*Math.PI/8)),o.push(t(.64,-.014,a*Math.PI/8));e(...n);for(let a=0;a<8;a++){let l=(a+1)%8,p=(a+7)%8,g=a*2,v=(g+1)%16,T=(g+2)%16;e(n[a],n[l],r[a]),e(n[a],r[a],s[g],r[p]),e(r[a],s[v],s[g]),e(r[a],s[T],s[v]),e(t(0,-.53,0),f[p],o[g],f[a]),e(f[a],o[g],o[v]),e(f[a],o[v],o[T])}for(let a=0;a<16;a++)e(s[a],o[a],o[(a+1)%16],s[(a+1)%16]);let u=new vn;return u.setAttribute("position",new gn(i,3)),u.computeVertexNormals(),u}function Fc(i){let t=new hn;t.background=new $t("#8e98a7");let e=document.createElement("canvas");e.width=1024,e.height=512;let n=e.getContext("2d");n.fillStyle="#d8d9dc",n.fillRect(0,0,1024,512);let r=["#fafcff","#343b47","#c2c5cc","#ffffff","#747b85","#f9f7ef"];for(let c=0;c<36;c++){n.fillStyle=r[c%r.length];let m=c*167%1024,u=c*79%512;n.fillRect(m,u,40+c*31%180,70+c*23%230)}let s=new An(e);s.colorSpace=xn,t.add(new Re(new Bn(15,48,32),new Fe({map:s,side:Xt})));for(let[c,m,u,a,l,p]of[[-3,3,3,3,5,16777215],[3,1,3,1,4,13030115],[0,4,0,5,2,16777215],[1,-3,2,2,2,15787728],[-3,0,-2,2,5,9475487],[3,3,-3,2,2,16777215]]){let g=new Re(new wn(a,l),new Fe({color:p}));g.position.set(c,m,u),g.lookAt(0,0,0),t.add(g)}let o=new _n(512,{generateMipmaps:!0,minFilter:ln,type:pn});return new Sn(.1,30,o).update(i,t),t.traverse(c=>{c.isMesh&&(c.geometry.dispose(),c.material.dispose())}),s.dispose(),o}export{Ae as a,Dc as b,Nc as c,Fc as d};
