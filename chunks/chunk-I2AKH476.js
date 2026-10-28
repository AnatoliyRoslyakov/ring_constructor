import{$ as $t,A as dn,B as yn,C as Zt,Ca as An,D as Kt,K as xn,N as K,Na as wn,P as M,Pa as Bn,Ua as En,X as q,aa as hn,ba as rt,ca as W,d as De,e as Xt,ea as gt,f as an,fa as gn,ha as vn,k as it,ka as Jt,ma as Tn,na as Fe,nb as Sn,oa as Re,p as ln,q as Me,r as Ne,ra as Nt,rb as J,s as fn,t as un,u as Wt,v as ut,vb as _n,w as pt,x as pn,y as ht,z as mn}from"./chunk-73PUBYJG.js";var vt=Math.pow(2,-24),Ft=Symbol("SKIP_GENERATION"),Qt={strategy:0,maxDepth:40,targetLeafSize:10,useSharedArrayBuffer:!1,setBoundingBox:!0,onProgress:null,indirect:!1,verbose:!0,range:null,[Ft]:!1};function U(i,t,e){return e.min.x=t[i],e.min.y=t[i+1],e.min.z=t[i+2],e.max.x=t[i+3],e.max.y=t[i+4],e.max.z=t[i+5],e}function Rt(i){let t=-1,e=-1/0;for(let n=0;n<3;n++){let r=i[n+3]-i[n];r>e&&(e=r,t=n)}return t}function Ce(i,t){t.set(i)}function Oe(i,t,e){let n,r;for(let s=0;s<3;s++){let o=s+3;n=i[s],r=t[s],e[s]=n<r?n:r,n=i[o],r=t[o],e[o]=n>r?n:r}}function Ct(i,t,e){for(let n=0;n<3;n++){let r=t[i+2*n],s=t[i+2*n+1],o=r-s,a=r+s;o<e[n]&&(e[n]=o),a>e[n+3]&&(e[n+3]=a)}}function Tt(i){let t=i[3]-i[0],e=i[4]-i[1],n=i[5]-i[2];return 2*(t*e+e*n+n*t)}function F(i,t){return t[i+15]===65535}function C(i,t){return t[i+6]}function z(i,t){return t[i+14]}function O(i){return i+8}function L(i,t){let e=t[i+6];return i+e*8}function ot(i,t){return t[i+7]}function jt(i,t,e,n,r){let s=1/0,o=1/0,a=1/0,c=-1/0,p=-1/0,u=-1/0,f=1/0,l=1/0,m=1/0,g=-1/0,T=-1/0,A=-1/0,v=i.offset||0;for(let d=(t-v)*6,y=(t+e-v)*6;d<y;d+=6){let h=i[d+0],x=i[d+1],E=h-x,w=h+x;E<s&&(s=E),w>c&&(c=w),h<f&&(f=h),h>g&&(g=h);let _=i[d+2],b=i[d+3],B=_-b,P=_+b;B<o&&(o=B),P>p&&(p=P),_<l&&(l=_),_>T&&(T=_);let S=i[d+4],I=i[d+5],D=S-I,N=S+I;D<a&&(a=D),N>u&&(u=N),S<m&&(m=S),S>A&&(A=S)}n[0]=s,n[1]=o,n[2]=a,n[3]=c,n[4]=p,n[5]=u,r[0]=f,r[1]=l,r[2]=m,r[3]=g,r[4]=T,r[5]=A}var et=32,Di=(i,t)=>i.candidate-t.candidate,st=new Array(et).fill().map(()=>({count:0,bounds:new Float32Array(6),rightCacheBounds:new Float32Array(6),leftCacheBounds:new Float32Array(6),candidate:0})),te=new Float32Array(6);function In(i,t,e,n,r,s){let o=-1,a=0;if(s===0)o=Rt(t),o!==-1&&(a=(t[o]+t[o+3])/2);else if(s===1)o=Rt(i),o!==-1&&(a=Mi(e,n,r,o));else if(s===2){let c=Tt(i),p=1.25*r,u=e.offset||0,f=(n-u)*6,l=(n+r-u)*6;for(let m=0;m<3;m++){let g=t[m],v=(t[m+3]-g)/et;if(r<et/4){let d=[...st];d.length=r;let y=0;for(let x=f;x<l;x+=6,y++){let E=d[y];E.candidate=e[x+2*m],E.count=0;let{bounds:w,leftCacheBounds:_,rightCacheBounds:b}=E;for(let B=0;B<3;B++)b[B]=1/0,b[B+3]=-1/0,_[B]=1/0,_[B+3]=-1/0,w[B]=1/0,w[B+3]=-1/0;Ct(x,e,w)}d.sort(Di);let h=r;for(let x=0;x<h;x++){let E=d[x];for(;x+1<h&&d[x+1].candidate===E.candidate;)d.splice(x+1,1),h--}for(let x=f;x<l;x+=6){let E=e[x+2*m];for(let w=0;w<h;w++){let _=d[w];E>=_.candidate?Ct(x,e,_.rightCacheBounds):(Ct(x,e,_.leftCacheBounds),_.count++)}}for(let x=0;x<h;x++){let E=d[x],w=E.count,_=r-E.count,b=E.leftCacheBounds,B=E.rightCacheBounds,P=0;w!==0&&(P=Tt(b)/c);let S=0;_!==0&&(S=Tt(B)/c);let I=1+1.25*(P*w+S*_);I<p&&(o=m,p=I,a=E.candidate)}}else{for(let h=0;h<et;h++){let x=st[h];x.count=0,x.candidate=g+v+h*v;let E=x.bounds;for(let w=0;w<3;w++)E[w]=1/0,E[w+3]=-1/0}for(let h=f;h<l;h+=6){let w=~~((e[h+2*m]-g)/v);w>=et&&(w=et-1);let _=st[w];_.count++,Ct(h,e,_.bounds)}let d=st[et-1];Ce(d.bounds,d.rightCacheBounds);for(let h=et-2;h>=0;h--){let x=st[h],E=st[h+1];Oe(x.bounds,E.rightCacheBounds,x.rightCacheBounds)}let y=0;for(let h=0;h<et-1;h++){let x=st[h],E=x.count,w=x.bounds,b=st[h+1].rightCacheBounds;E!==0&&(y===0?Ce(w,te):Oe(w,te,te)),y+=E;let B=0,P=0;y!==0&&(B=Tt(te)/c);let S=r-y;S!==0&&(P=Tt(b)/c);let I=1+1.25*(B*y+P*S);I<p&&(o=m,p=I,a=x.candidate)}}}}else console.warn(`BVH: Invalid build strategy value ${s} used.`);return{axis:o,pos:a}}function Mi(i,t,e,n){let r=0,s=i.offset;for(let o=t,a=t+e;o<a;o++)r+=i[(o-s)*6+n*2];return r/e}var At=class{constructor(){this.boundingData=new Float32Array(6)}};function Dn(i,t,e,n,r,s){let o=n,a=n+r-1,c=s.pos,p=s.axis*2,u=e.offset||0;for(;;){for(;o<=a&&e[(o-u)*6+p]<c;)o++;for(;o<=a&&e[(a-u)*6+p]>=c;)a--;if(o<a){for(let f=0;f<t;f++){let l=i[o*t+f];i[o*t+f]=i[a*t+f],i[a*t+f]=l}for(let f=0;f<6;f++){let l=o-u,m=a-u,g=e[l*6+f];e[l*6+f]=e[m*6+f],e[m*6+f]=g}o++,a--}else return o}}var Mn,ee,Le,Nn,Ni=Math.pow(2,32);function ne(i){return"count"in i?1:1+ne(i.left)+ne(i.right)}function Fn(i,t,e){return Mn=new Float32Array(e),ee=new Uint32Array(e),Le=new Uint16Array(e),Nn=new Uint8Array(e),ze(i,t)}function ze(i,t){let e=i/4,n=i/2,r="count"in t,s=t.boundingData;for(let o=0;o<6;o++)Mn[e+o]=s[o];if(r)return t.buffer?(Nn.set(new Uint8Array(t.buffer),i),i+t.buffer.byteLength):(ee[e+6]=t.offset,Le[n+14]=t.count,Le[n+15]=65535,i+32);{let{left:o,right:a,splitAxis:c}=t,p=i+32,u=ze(p,o),f=i/32,m=u/32-f;if(m>Ni)throw new Error("MeshBVH: Cannot store relative child node offset greater than 32 bits.");return ee[e+6]=m,ee[e+7]=c,ze(u,a)}}function Fi(i,t,e,n,r,s){let{maxDepth:o,verbose:a,targetLeafSize:c,_strictLeafSize:p=1/0,strategy:u,onProgress:f}=r,l=i.primitiveBuffer,m=i.primitiveBufferStride,g=new Float32Array(6),T=!1,A=new At;return jt(t,e,n,A.boundingData,g),d(A,e,n,g),A;function v(y){f&&f((y-s.offset)/s.count)}function d(y,h,x,E=null,w=0){!T&&w>=o&&(T=!0,a&&console.warn(`BVH: Max depth of ${o} reached when generating BVH. Consider increasing maxDepth.`));let _=x>p;if(x<=c&&!_||w>=o)return v(h+x),y.offset=h,y.count=x,y;let b=In(y.boundingData,E,t,h,x,u),B=b.axis===-1?-1:Dn(l,m,t,h,x,b);if(b.axis===-1||B===h||B===h+x){if(!_)return v(h+x),y.offset=h,y.count=x,y;b.axis=Math.max(0,Rt(y.boundingData)),B=h+Math.max(1,Math.floor(x/2))}y.splitAxis=b.axis;let P=new At,S=h,I=B-h;y.left=P,jt(t,S,I,P.boundingData,g),d(P,S,I,g,w+1);let D=new At,N=B,V=x-I;return y.right=D,jt(t,N,V,D.boundingData,g),d(D,N,V,g,w+1),y}}function Rn(i,t){let e=t.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,n=i.getRootRanges(t.range),r=n[0],s=n[n.length-1],o={offset:r.offset,count:s.offset+s.count-r.offset},a=new Float32Array(6*o.count);a.offset=o.offset,i.computePrimitiveBounds(o.offset,o.count,a),i._roots=n.map(c=>{let p=Fi(i,a,c.offset,c.count,t,o),u=ne(p),f=new e(32*u);return Fn(0,p,f),f})}var ct=class{constructor(t){this._getNewPrimitive=t,this._primitives=[]}getPrimitive(){let t=this._primitives;return t.length===0?this._getNewPrimitive():t.pop()}releasePrimitive(t){this._primitives.push(t)}};var Ue=class{constructor(){this.float32Array=null,this.uint16Array=null,this.uint32Array=null;let t=[],e=null;this.setBuffer=n=>{e&&t.push(e),e=n,this.float32Array=new Float32Array(n),this.uint16Array=new Uint16Array(n),this.uint32Array=new Uint32Array(n)},this.clearBuffer=()=>{e=null,this.float32Array=null,this.uint16Array=null,this.uint32Array=null,t.length!==0&&this.setBuffer(t.pop())}}},R=new Ue;var at,Bt,wt=[],ie=new ct(()=>new W);function Cn(i,t,e,n,r,s){at=ie.getPrimitive(),Bt=ie.getPrimitive(),wt.push(at,Bt),R.setBuffer(i._roots[t]);let o=He(0,i.geometry,e,n,r,s);R.clearBuffer(),ie.releasePrimitive(at),ie.releasePrimitive(Bt),wt.pop(),wt.pop();let a=wt.length;return a>0&&(Bt=wt[a-1],at=wt[a-2]),o}function He(i,t,e,n,r=null,s=0,o=0){let{float32Array:a,uint16Array:c,uint32Array:p}=R,u=i*2;if(F(u,c)){let l=C(i,p),m=z(u,c);return U(i,a,at),n(l,m,!1,o,s+i/8,at)}else{let B=function(S){let{uint16Array:I,uint32Array:D}=R,N=S*2;for(;!F(N,I);)S=O(S),N=S*2;return C(S,D)},P=function(S){let{uint16Array:I,uint32Array:D}=R,N=S*2;for(;!F(N,I);)S=L(S,D),N=S*2;return C(S,D)+z(N,I)},l=O(i),m=L(i,p),g=l,T=m,A,v,d,y;if(r&&(d=at,y=Bt,U(g,a,d),U(T,a,y),A=r(d),v=r(y),v<A)){g=m,T=l;let S=A;A=v,v=S,d=y}d||(d=at,U(g,a,d));let h=F(g*2,c),x=e(d,h,A,o+1,s+g/8),E;if(x===2){let S=B(g),D=P(g)-S;E=n(S,D,!0,o+1,s+g/8,d)}else E=x&&He(g,t,e,n,r,s,o+1);if(E)return!0;y=Bt,U(T,a,y);let w=F(T*2,c),_=e(y,w,v,o+1,s+T/8),b;if(_===2){let S=B(T),D=P(T)-S;b=n(S,D,!0,o+1,s+T/8,y)}else b=_&&He(T,t,e,n,r,s,o+1);return!!b}}var Ot=new R.constructor,oe=new R.constructor,lt=new ct(()=>new W),Et=new W,St=new W,Ve=new W,Ge=new W,ke=!1;function On(i,t,e,n){if(ke)throw new Error("MeshBVH: Recursive calls to bvhcast not supported.");ke=!0;let r=i._roots,s=t._roots,o,a=0,c=0,p=new q().copy(e).invert();for(let u=0,f=r.length;u<f;u++){Ot.setBuffer(r[u]),c=0;let l=lt.getPrimitive();U(0,Ot.float32Array,l),l.applyMatrix4(p);for(let m=0,g=s.length;m<g&&(oe.setBuffer(s[m]),o=tt(0,0,e,p,n,a,c,0,0,l),oe.clearBuffer(),c+=s[m].byteLength/32,!o);m++);if(lt.releasePrimitive(l),Ot.clearBuffer(),a+=r[u].byteLength/32,o)break}return ke=!1,o}function tt(i,t,e,n,r,s=0,o=0,a=0,c=0,p=null,u=!1){let f,l;u?(f=oe,l=Ot):(f=Ot,l=oe);let m=f.float32Array,g=f.uint32Array,T=f.uint16Array,A=l.float32Array,v=l.uint32Array,d=l.uint16Array,y=i*2,h=t*2,x=F(y,T),E=F(h,d),w=!1;if(E&&x)u?w=r(C(t,v),z(t*2,d),C(i,g),z(i*2,T),c,o+t/8,a,s+i/8):w=r(C(i,g),z(i*2,T),C(t,v),z(t*2,d),a,s+i/8,c,o+t/8);else if(E){let _=lt.getPrimitive();U(t,A,_),_.applyMatrix4(e);let b=O(i),B=L(i,g);U(b,m,Et),U(B,m,St);let P=_.intersectsBox(Et),S=_.intersectsBox(St);w=P&&tt(t,b,n,e,r,o,s,c,a+1,_,!u)||S&&tt(t,B,n,e,r,o,s,c,a+1,_,!u),lt.releasePrimitive(_)}else{let _=O(t),b=L(t,v);U(_,A,Ve),U(b,A,Ge);let B=p.intersectsBox(Ve),P=p.intersectsBox(Ge);if(B&&P)w=tt(i,_,e,n,r,s,o,a,c+1,p,u)||tt(i,b,e,n,r,s,o,a,c+1,p,u);else if(B)if(x)w=tt(i,_,e,n,r,s,o,a,c+1,p,u);else{let S=lt.getPrimitive();S.copy(Ve).applyMatrix4(e);let I=O(i),D=L(i,g);U(I,m,Et),U(D,m,St);let N=S.intersectsBox(Et),V=S.intersectsBox(St);w=N&&tt(_,I,n,e,r,o,s,c,a+1,S,!u)||V&&tt(_,D,n,e,r,o,s,c,a+1,S,!u),lt.releasePrimitive(S)}else if(P)if(x)w=tt(i,b,e,n,r,s,o,a,c+1,p,u);else{let S=lt.getPrimitive();S.copy(Ge).applyMatrix4(e);let I=O(i),D=L(i,g);U(I,m,Et),U(D,m,St);let N=S.intersectsBox(Et),V=S.intersectsBox(St);w=N&&tt(b,I,n,e,r,o,s,c,a+1,S,!u)||V&&tt(b,D,n,e,r,o,s,c,a+1,S,!u),lt.releasePrimitive(S)}}return w}var se=new class{constructor(){let i=null,t=null,e=null,n=!1;this.root=null,this.buffer=null,this.uint32Array=null,this.uint16Array=null,this.setBVH=(s,o)=>{if(n)throw new Error("BVHTraversalHelper: cannot call setBVH during an active traversal.");this.root=o,this.buffer=i=s._roots[o],this.uint16Array=e=new Uint16Array(i),this.uint32Array=t=new Uint32Array(i)},this.reset=()=>{this.root=null,this.buffer=i=null,this.uint16Array=e=null,this.uint32Array=t=null},this.getRangeStart=s=>{let o=s*2;for(;!F(o,e);)s=O(s),o=s*2;return C(s,t)},this.getRangeEnd=s=>{let o=s*2;for(;!F(o,e);)s=L(s,t),o=s*2;return C(s,t)+z(o,e)};let r=(s,o,a)=>{let c=o*2,p=F(c,e);if(!s(a,p,o)&&!p){let f=O(o),l=L(o,t);r(s,f,a+1),r(s,l,a+1)}};this.traverseBuffer=s=>{if(n)throw new Error("BVHTraversalHelper: cannot start a traversal during an active traversal.");n=!0;try{r(s,0,0)}finally{n=!1}},this.traverse=s=>{this.traverseBuffer((o,a,c)=>{if(a){let p=c*2,u=t[c+6],f=e[p+14];return s(o,a,new Float32Array(i,c*4,6),u,f)}else{let p=ot(c,t);return s(o,a,new Float32Array(i,c*4,6),p)}})}}};var Ln=new W,_t=new Float32Array(6),ce=class{constructor(){this._roots=null,this.primitiveBuffer=null,this.primitiveBufferStride=null}init(t){t={...Qt,...t},"maxLeafSize"in t&&(console.warn('BVH: "maxLeafSize" option has been deprecated. Use "targetLeafSize", instead.'),t={...t,targetLeafSize:t.maxLeafSize}),Rn(this,t)}getRootRanges(){throw new Error("BVH: getRootRanges() not implemented")}writePrimitiveBounds(){throw new Error("BVH: writePrimitiveBounds() not implemented")}writePrimitiveRangeBounds(t,e,n,r){let s=1/0,o=1/0,a=1/0,c=-1/0,p=-1/0,u=-1/0;for(let f=t,l=t+e;f<l;f++){this.writePrimitiveBounds(f,_t,0);let[m,g,T,A,v,d]=_t;m<s&&(s=m),A>c&&(c=A),g<o&&(o=g),v>p&&(p=v),T<a&&(a=T),d>u&&(u=d)}return n[r+0]=s,n[r+1]=o,n[r+2]=a,n[r+3]=c,n[r+4]=p,n[r+5]=u,n}computePrimitiveBounds(t,e,n){let r=n.offset||0;for(let s=t,o=t+e;s<o;s++){this.writePrimitiveBounds(s,_t,0);let[a,c,p,u,f,l]=_t,m=(a+u)/2,g=(c+f)/2,T=(p+l)/2,A=(u-a)/2,v=(f-c)/2,d=(l-p)/2,y=(s-r)*6;n[y+0]=m,n[y+1]=A+(Math.abs(m)+A)*vt,n[y+2]=g,n[y+3]=v+(Math.abs(g)+v)*vt,n[y+4]=T,n[y+5]=d+(Math.abs(T)+d)*vt}return n}shiftPrimitiveOffsets(t){let e=this._indirectBuffer;if(e)for(let n=0,r=e.length;n<r;n++)e[n]+=t;else{let n=this._roots;for(let r=0;r<n.length;r++){let s=n[r],o=new Uint32Array(s),a=new Uint16Array(s),c=s.byteLength/32;for(let p=0;p<c;p++){let u=8*p,f=2*u;F(f,a)&&(o[u+6]+=t)}}}}traverse(t,e=0){se.setBVH(this,e),se.traverse(t),se.reset()}refit(){let t=this._roots;for(let e=0,n=t.length;e<n;e++){let r=t[e],s=new Uint32Array(r),o=new Uint16Array(r),a=new Float32Array(r),c=r.byteLength/32;for(let p=c-1;p>=0;p--){let u=p*8,f=u*2;if(F(f,o)){let m=C(u,s),g=z(f,o);this.writePrimitiveRangeBounds(m,g,_t,0),a.set(_t,u)}else{let m=O(u),g=L(u,s);for(let T=0;T<3;T++){let A=a[m+T],v=a[m+T+3],d=a[g+T],y=a[g+T+3];a[u+T]=A<d?A:d,a[u+T+3]=v>y?v:y}}}}}getBoundingBox(t){return t.makeEmpty(),this._roots.forEach(n=>{U(0,new Float32Array(n),Ln),t.union(Ln)}),t}shapecast(t){let{boundsTraverseOrder:e,intersectsBounds:n,intersectsRange:r,intersectsPrimitive:s,scratchPrimitive:o,iterate:a}=t;if(r&&s){let f=r;r=(l,m,g,T,A)=>f(l,m,g,T,A)?!0:a(l,m,this,s,g,T,o)}else r||(s?r=(f,l,m,g)=>a(f,l,this,s,m,g,o):r=(f,l,m)=>m);let c=!1,p=0,u=this._roots;for(let f=0,l=u.length;f<l;f++){let m=u[f];if(c=Cn(this,f,n,r,e,p),c)break;p+=m.byteLength/32}return c}bvhcast(t,e,n){let{intersectsRanges:r}=n;return On(this,t,e,r)}};function zn(){return typeof SharedArrayBuffer<"u"}function Lt(i){return i.index?i.index.count:i.attributes.position.count}function ft(i){return Lt(i)/3}function qe(i,t=ArrayBuffer){return i>65535?new Uint32Array(new t(4*i)):new Uint16Array(new t(2*i))}function Un(i,t){if(!i.index){let e=i.attributes.position.count,n=t.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,r=qe(e,n);i.setIndex(new gt(r,1));for(let s=0;s<e;s++)r[s]=s}}function Ci(i,t,e){let n=Lt(i)/e,r=t||i.drawRange,s=r.start/e,o=(r.start+r.count)/e,a=Math.max(0,s),c=Math.min(n,o)-a;return{offset:Math.floor(a),count:Math.floor(c)}}function Oi(i,t){return i.groups.map(e=>({offset:e.start/t,count:e.count/t}))}function Ye(i,t,e){let n=Ci(i,t,e),r=Oi(i,e);if(!r.length)return[n];let s=[],o=n.offset,a=n.offset+n.count,c=Lt(i)/e,p=[];for(let l of r){let{offset:m,count:g}=l,T=m,A=isFinite(g)?g:c-m,v=m+A;T<a&&v>o&&(p.push({pos:Math.max(o,T),isStart:!0}),p.push({pos:Math.min(a,v),isStart:!1}))}p.sort((l,m)=>l.pos!==m.pos?l.pos-m.pos:l.type==="end"?-1:1);let u=0,f=null;for(let l of p){let m=l.pos;u!==0&&m!==f&&s.push({offset:f,count:m-f}),u+=l.isStart?1:-1,f=m}return s}function Li(i,t){let e=i[i.length-1],n=e.offset+e.count>2**16,r=i.reduce((p,u)=>p+u.count,0),s=n?4:2,o=t?new SharedArrayBuffer(r*s):new ArrayBuffer(r*s),a=n?new Uint32Array(o):new Uint16Array(o),c=0;for(let p=0;p<i.length;p++){let{offset:u,count:f}=i[p];for(let l=0;l<f;l++)a[c+l]=u+l;c+=f}return a}var ae=class extends ce{get indirect(){return!!this._indirectBuffer}get primitiveStride(){return null}get primitiveBufferStride(){return this.indirect?1:this.primitiveStride}set primitiveBufferStride(t){}get primitiveBuffer(){return this.indirect?this._indirectBuffer:this.geometry.index.array}set primitiveBuffer(t){}constructor(t,e={}){if(t.isBufferGeometry){if(t.index&&t.index.isInterleavedBufferAttribute)throw new Error("BVH: InterleavedBufferAttribute is not supported for the index attribute.")}else throw new Error("BVH: Only BufferGeometries are supported.");if(e.useSharedArrayBuffer&&!zn())throw new Error("BVH: SharedArrayBuffer is not available.");super(),this.geometry=t,this.resolvePrimitiveIndex=e.indirect?n=>this._indirectBuffer[n]:n=>n,this.primitiveBuffer=null,this.primitiveBufferStride=null,this._indirectBuffer=null,e={...Qt,...e},e[Ft]||this.init(e)}init(t){let{geometry:e,primitiveStride:n}=this;if(t.indirect){let r=Ye(e,t.range,n),s=Li(r,t.useSharedArrayBuffer);this._indirectBuffer=s}else Un(e,t);super.init(t),!e.boundingBox&&t.setBoundingBox&&(e.boundingBox=this.getBoundingBox(new W))}getRootRanges(t){return this.indirect?[{offset:0,count:this._indirectBuffer.length}]:Ye(this.geometry,t,this.primitiveStride)}raycastObject3D(){throw new Error("BVH: raycastObject3D() not implemented")}};var $=class{constructor(){this.min=1/0,this.max=-1/0}setFromPointsField(t,e){let n=1/0,r=-1/0;for(let s=0,o=t.length;s<o;s++){let c=t[s][e];n=c<n?c:n,r=c>r?c:r}this.min=n,this.max=r}setFromPoints(t,e){let n=1/0,r=-1/0;for(let s=0,o=e.length;s<o;s++){let a=e[s],c=t.dot(a);n=c<n?c:n,r=c>r?c:r}this.min=n,this.max=r}isSeparated(t){return this.min>t.max||t.min>this.max}};$.prototype.setFromBox=(function(){let i=new M;return function(e,n){let r=n.min,s=n.max,o=1/0,a=-1/0;for(let c=0;c<=1;c++)for(let p=0;p<=1;p++)for(let u=0;u<=1;u++){i.x=r.x*c+s.x*(1-c),i.y=r.y*p+s.y*(1-p),i.z=r.z*u+s.z*(1-u);let f=e.dot(i);o=Math.min(f,o),a=Math.max(f,a)}this.min=o,this.max=a}})();var zi=(function(){let i=new M,t=new M,e=new M;return function(r,s,o){let a=r.start,c=i,p=s.start,u=t;e.subVectors(a,p),i.subVectors(r.end,r.start),t.subVectors(s.end,s.start);let f=e.dot(u),l=u.dot(c),m=u.dot(u),g=e.dot(c),A=c.dot(c)*m-l*l,v,d;A!==0?v=(f*l-g*m)/A:v=0,d=(f+v*l)/m,o.x=v,o.y=d}})(),zt=(function(){let i=new K,t=new M,e=new M;return function(r,s,o,a){zi(r,s,i);let c=i.x,p=i.y;if(c>=0&&c<=1&&p>=0&&p<=1){r.at(c,o),s.at(p,a);return}else if(c>=0&&c<=1){p<0?s.at(0,a):s.at(1,a),r.closestPointToPoint(a,!0,o);return}else if(p>=0&&p<=1){c<0?r.at(0,o):r.at(1,o),s.closestPointToPoint(o,!0,a);return}else{let u;c<0?u=r.start:u=r.end;let f;p<0?f=s.start:f=s.end;let l=t,m=e;if(r.closestPointToPoint(f,!0,t),s.closestPointToPoint(u,!0,e),l.distanceToSquared(f)<=m.distanceToSquared(u)){o.copy(l),a.copy(f);return}else{o.copy(u),a.copy(m);return}}}})(),Hn=(function(){let i=new M,t=new M,e=new Jt,n=new J;return function(s,o){let{radius:a,center:c}=s,{a:p,b:u,c:f}=o;if(n.start=p,n.end=u,n.closestPointToPoint(c,!0,i).distanceTo(c)<=a||(n.start=p,n.end=f,n.closestPointToPoint(c,!0,i).distanceTo(c)<=a)||(n.start=u,n.end=f,n.closestPointToPoint(c,!0,i).distanceTo(c)<=a))return!0;let T=o.getPlane(e);if(Math.abs(T.distanceToPoint(c))<=a){let v=T.projectPoint(c,t);if(o.containsPoint(v))return!0}return!1}})();var Ui=["x","y","z"],nt=1e-15,Vn=nt*nt;function Q(i){return Math.abs(i)<nt}var X=class extends rt{constructor(...t){super(...t),this.isExtendedTriangle=!0,this.satAxes=new Array(4).fill().map(()=>new M),this.satBounds=new Array(4).fill().map(()=>new $),this.points=[this.a,this.b,this.c],this.plane=new Jt,this.isDegenerateIntoSegment=!1,this.isDegenerateIntoPoint=!1,this.degenerateSegment=new J,this.needsUpdate=!0}intersectsSphere(t){return Hn(t,this)}update(){let t=this.a,e=this.b,n=this.c,r=this.points,s=this.satAxes,o=this.satBounds,a=s[0],c=o[0];this.getNormal(a),c.setFromPoints(a,r);let p=s[1],u=o[1];p.subVectors(t,e),u.setFromPoints(p,r);let f=s[2],l=o[2];f.subVectors(e,n),l.setFromPoints(f,r);let m=s[3],g=o[3];m.subVectors(n,t),g.setFromPoints(m,r);let T=p.length(),A=f.length(),v=m.length();this.isDegenerateIntoPoint=!1,this.isDegenerateIntoSegment=!1,T<nt?A<nt||v<nt?this.isDegenerateIntoPoint=!0:(this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(t),this.degenerateSegment.end.copy(n)):A<nt?v<nt?this.isDegenerateIntoPoint=!0:(this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(e),this.degenerateSegment.end.copy(t)):v<nt&&(this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(n),this.degenerateSegment.end.copy(e)),this.plane.setFromNormalAndCoplanarPoint(a,t),this.needsUpdate=!1}};X.prototype.closestPointToSegment=(function(){let i=new M,t=new M,e=new J;return function(r,s=null,o=null){let{start:a,end:c}=r,p=this.points,u,f=1/0;for(let l=0;l<3;l++){let m=(l+1)%3;e.start.copy(p[l]),e.end.copy(p[m]),zt(e,r,i,t),u=i.distanceToSquared(t),u<f&&(f=u,s&&s.copy(i),o&&o.copy(t))}return this.closestPointToPoint(a,i),u=a.distanceToSquared(i),u<f&&(f=u,s&&s.copy(i),o&&o.copy(a)),this.closestPointToPoint(c,i),u=c.distanceToSquared(i),u<f&&(f=u,s&&s.copy(i),o&&o.copy(c)),Math.sqrt(f)}})();X.prototype.intersectsTriangle=(function(){let i=new X,t=new $,e=new $,n=new M,r=new M,s=new M,o=new M,a=new J,c=new J,p=new M,u=new K,f=new K;function l(y,h,x,E){let w=n;!y.isDegenerateIntoPoint&&!y.isDegenerateIntoSegment?w.copy(y.plane.normal):w.copy(h.plane.normal);let _=y.satBounds,b=y.satAxes;for(let S=1;S<4;S++){let I=_[S],D=b[S];if(t.setFromPoints(D,h.points),I.isSeparated(t)||(o.copy(w).cross(D),t.setFromPoints(o,y.points),e.setFromPoints(o,h.points),t.isSeparated(e)))return!1}let B=h.satBounds,P=h.satAxes;for(let S=1;S<4;S++){let I=B[S],D=P[S];if(t.setFromPoints(D,y.points),I.isSeparated(t)||(o.crossVectors(w,D),t.setFromPoints(o,y.points),e.setFromPoints(o,h.points),t.isSeparated(e)))return!1}return x&&(E||console.warn("ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0."),x.start.set(0,0,0),x.end.set(0,0,0)),!0}function m(y,h,x,E,w,_,b,B,P,S,I){let D=b/(b-B);S.x=E+(w-E)*D,I.start.subVectors(h,y).multiplyScalar(D).add(y),D=b/(b-P),S.y=E+(_-E)*D,I.end.subVectors(x,y).multiplyScalar(D).add(y)}function g(y,h,x,E,w,_,b,B,P,S,I){if(w>0)m(y.c,y.a,y.b,E,h,x,P,b,B,S,I);else if(_>0)m(y.b,y.a,y.c,x,h,E,B,b,P,S,I);else if(B*P>0||b!=0)m(y.a,y.b,y.c,h,x,E,b,B,P,S,I);else if(B!=0)m(y.b,y.a,y.c,x,h,E,B,b,P,S,I);else if(P!=0)m(y.c,y.a,y.b,E,h,x,P,b,B,S,I);else return!0;return!1}function T(y,h,x,E){let w=h.degenerateSegment,_=y.plane.distanceToPoint(w.start),b=y.plane.distanceToPoint(w.end);return Q(_)?Q(b)?l(y,h,x,E):(x&&(x.start.copy(w.start),x.end.copy(w.start)),y.containsPoint(w.start)):Q(b)?(x&&(x.start.copy(w.end),x.end.copy(w.end)),y.containsPoint(w.end)):y.plane.intersectLine(w,n)!=null?(x&&(x.start.copy(n),x.end.copy(n)),y.containsPoint(n)):!1}function A(y,h,x){let E=h.a;return Q(y.plane.distanceToPoint(E))&&y.containsPoint(E)?(x&&(x.start.copy(E),x.end.copy(E)),!0):!1}function v(y,h,x){let E=y.degenerateSegment,w=h.a;return E.closestPointToPoint(w,!0,n),w.distanceToSquared(n)<Vn?(x&&(x.start.copy(w),x.end.copy(w)),!0):!1}function d(y,h,x,E){if(y.isDegenerateIntoSegment)if(h.isDegenerateIntoSegment){let w=y.degenerateSegment,_=h.degenerateSegment,b=r,B=s;w.delta(b),_.delta(B);let P=n.subVectors(_.start,w.start),S=b.x*B.y-b.y*B.x;if(Q(S))return!1;let I=(P.x*B.y-P.y*B.x)/S,D=-(b.x*P.y-b.y*P.x)/S;if(I<0||I>1||D<0||D>1)return!1;let N=w.start.z+b.z*I,V=_.start.z+B.z*D;return Q(N-V)?(x&&(x.start.copy(w.start).addScaledVector(b,I),x.end.copy(w.start).addScaledVector(b,I)),!0):!1}else return h.isDegenerateIntoPoint?v(y,h,x):T(h,y,x,E);else{if(y.isDegenerateIntoPoint)return h.isDegenerateIntoPoint?h.a.distanceToSquared(y.a)<Vn?(x&&(x.start.copy(y.a),x.end.copy(y.a)),!0):!1:h.isDegenerateIntoSegment?v(h,y,x):A(h,y,x);if(h.isDegenerateIntoPoint)return A(y,h,x);if(h.isDegenerateIntoSegment)return T(y,h,x,E)}}return function(h,x=null,E=!1){this.needsUpdate&&this.update(),h.isExtendedTriangle?h.needsUpdate&&h.update():(i.copy(h),i.update(),h=i);let w=d(this,h,x,E);if(w!==void 0)return w;let _=this.plane,b=h.plane,B=b.distanceToPoint(this.a),P=b.distanceToPoint(this.b),S=b.distanceToPoint(this.c);Q(B)&&(B=0),Q(P)&&(P=0),Q(S)&&(S=0);let I=B*P,D=B*S;if(I>0&&D>0)return!1;let N=_.distanceToPoint(h.a),V=_.distanceToPoint(h.b),Yt=_.distanceToPoint(h.c);Q(N)&&(N=0),Q(V)&&(V=0),Q(Yt)&&(Yt=0);let on=N*V,sn=N*Yt;if(on>0&&sn>0)return!1;r.copy(_.normal),s.copy(b.normal);let _e=r.cross(s),be=0,Pe=Math.abs(_e.x),cn=Math.abs(_e.y);cn>Pe&&(Pe=cn,be=1),Math.abs(_e.z)>Pe&&(be=2);let xt=Ui[be],wi=this.a[xt],Bi=this.b[xt],Ei=this.c[xt],Si=h.a[xt],_i=h.b[xt],bi=h.c[xt];if(g(this,wi,Bi,Ei,I,D,B,P,S,u,a))return l(this,h,x,E);if(g(h,Si,_i,bi,on,sn,N,V,Yt,f,c))return l(this,h,x,E);if(u.y<u.x){let Ie=u.y;u.y=u.x,u.x=Ie,p.copy(a.start),a.start.copy(a.end),a.end.copy(p)}if(f.y<f.x){let Ie=f.y;f.y=f.x,f.x=Ie,p.copy(c.start),c.start.copy(c.end),c.end.copy(p)}return u.y<f.x||f.y<u.x?!1:(x&&(f.x>u.x?x.start.copy(c.start):x.start.copy(a.start),f.y<u.y?x.end.copy(c.end):x.end.copy(a.end)),!0)}})();X.prototype.distanceToPoint=(function(){let i=new M;return function(e){return this.closestPointToPoint(e,i),e.distanceTo(i)}})();X.prototype.distanceToTriangle=(function(){let i=new M,t=new M,e=["a","b","c"],n=new J,r=new J;return function(o,a=null,c=null){let p=a||c?n:null;if(this.intersectsTriangle(o,p,!0))return(a||c)&&(a&&p.getCenter(a),c&&p.getCenter(c)),0;let u=1/0;for(let f=0;f<3;f++){let l,m=e[f],g=o[m];this.closestPointToPoint(g,i),l=g.distanceToSquared(i),l<u&&(u=l,a&&a.copy(i),c&&c.copy(g));let T=this[m];o.closestPointToPoint(T,i),l=T.distanceToSquared(i),l<u&&(u=l,a&&a.copy(T),c&&c.copy(i))}for(let f=0;f<3;f++){let l=e[f],m=e[(f+1)%3];n.set(this[l],this[m]);for(let g=0;g<3;g++){let T=e[g],A=e[(g+1)%3];r.set(o[T],o[A]),zt(n,r,i,t);let v=i.distanceToSquared(t);v<u&&(u=v,a&&a.copy(i),c&&c.copy(t))}}return Math.sqrt(u)}})();var G=class{constructor(t,e,n){this.isOrientedBox=!0,this.min=new M,this.max=new M,this.matrix=new q,this.invMatrix=new q,this.points=new Array(8).fill().map(()=>new M),this.satAxes=new Array(3).fill().map(()=>new M),this.satBounds=new Array(3).fill().map(()=>new $),this.alignedSatBounds=new Array(3).fill().map(()=>new $),this.needsUpdate=!1,t&&this.min.copy(t),e&&this.max.copy(e),n&&this.matrix.copy(n)}set(t,e,n){this.min.copy(t),this.max.copy(e),this.matrix.copy(n),this.needsUpdate=!0}copy(t){this.min.copy(t.min),this.max.copy(t.max),this.matrix.copy(t.matrix),this.needsUpdate=!0}};G.prototype.update=(function(){return function(){let t=this.matrix,e=this.min,n=this.max,r=this.points;for(let p=0;p<=1;p++)for(let u=0;u<=1;u++)for(let f=0;f<=1;f++){let l=1*p|2*u|4*f,m=r[l];m.x=p?n.x:e.x,m.y=u?n.y:e.y,m.z=f?n.z:e.z,m.applyMatrix4(t)}let s=this.satBounds,o=this.satAxes,a=r[0];for(let p=0;p<3;p++){let u=o[p],f=s[p],l=1<<p,m=r[l];u.subVectors(a,m),f.setFromPoints(u,r)}let c=this.alignedSatBounds;c[0].setFromPointsField(r,"x"),c[1].setFromPointsField(r,"y"),c[2].setFromPointsField(r,"z"),this.invMatrix.copy(this.matrix).invert(),this.needsUpdate=!1}})();G.prototype.intersectsBox=(function(){let i=new $;return function(e){this.needsUpdate&&this.update();let n=e.min,r=e.max,s=this.satBounds,o=this.satAxes,a=this.alignedSatBounds;if(i.min=n.x,i.max=r.x,a[0].isSeparated(i)||(i.min=n.y,i.max=r.y,a[1].isSeparated(i))||(i.min=n.z,i.max=r.z,a[2].isSeparated(i)))return!1;for(let c=0;c<3;c++){let p=o[c],u=s[c];if(i.setFromBox(p,e),u.isSeparated(i))return!1}return!0}})();G.prototype.intersectsTriangle=(function(){let i=new X,t=new Array(3),e=new $,n=new $,r=new M;return function(o){this.needsUpdate&&this.update(),o.isExtendedTriangle?o.needsUpdate&&o.update():(i.copy(o),i.update(),o=i);let a=this.satBounds,c=this.satAxes;t[0]=o.a,t[1]=o.b,t[2]=o.c;for(let l=0;l<3;l++){let m=a[l],g=c[l];if(e.setFromPoints(g,t),m.isSeparated(e))return!1}let p=o.satBounds,u=o.satAxes,f=this.points;for(let l=0;l<3;l++){let m=p[l],g=u[l];if(e.setFromPoints(g,f),m.isSeparated(e))return!1}for(let l=0;l<3;l++){let m=c[l];for(let g=0;g<4;g++){let T=u[g];if(r.crossVectors(m,T),e.setFromPoints(r,t),n.setFromPoints(r,f),e.isSeparated(n))return!1}}return!0}})();G.prototype.closestPointToPoint=(function(){return function(t,e){return this.needsUpdate&&this.update(),e.copy(t).applyMatrix4(this.invMatrix).clamp(this.min,this.max).applyMatrix4(this.matrix),e}})();G.prototype.distanceToPoint=(function(){let i=new M;return function(e){return this.closestPointToPoint(e,i),e.distanceTo(i)}})();G.prototype.distanceToBox=(function(){let i=["x","y","z"],t=new Array(12).fill().map(()=>new J),e=new Array(12).fill().map(()=>new J),n=new M,r=new M;return function(o,a=0,c=null,p=null){if(this.needsUpdate&&this.update(),this.intersectsBox(o))return(c||p)&&(o.getCenter(r),this.closestPointToPoint(r,n),o.closestPointToPoint(n,r),c&&c.copy(n),p&&p.copy(r)),0;let u=a*a,f=o.min,l=o.max,m=this.points,g=1/0;for(let A=0;A<8;A++){let v=m[A];r.copy(v).clamp(f,l);let d=v.distanceToSquared(r);if(d<g&&(g=d,c&&c.copy(v),p&&p.copy(r),d<u))return Math.sqrt(d)}let T=0;for(let A=0;A<3;A++)for(let v=0;v<=1;v++)for(let d=0;d<=1;d++){let y=(A+1)%3,h=(A+2)%3,x=v<<y|d<<h,E=1<<A|v<<y|d<<h,w=m[x],_=m[E];t[T].set(w,_);let B=i[A],P=i[y],S=i[h],I=e[T],D=I.start,N=I.end;D[B]=f[B],D[P]=v?f[P]:l[P],D[S]=d?f[S]:l[P],N[B]=l[B],N[P]=v?f[P]:l[P],N[S]=d?f[S]:l[P],T++}for(let A=0;A<=1;A++)for(let v=0;v<=1;v++)for(let d=0;d<=1;d++){r.x=A?l.x:f.x,r.y=v?l.y:f.y,r.z=d?l.z:f.z,this.closestPointToPoint(r,n);let y=r.distanceToSquared(n);if(y<g&&(g=y,c&&c.copy(n),p&&p.copy(r),y<u))return Math.sqrt(y)}for(let A=0;A<12;A++){let v=t[A];for(let d=0;d<12;d++){let y=e[d];zt(v,y,n,r);let h=n.distanceToSquared(r);if(h<g&&(g=h,c&&c.copy(n),p&&p.copy(r),h<u))return Math.sqrt(h)}}return Math.sqrt(g)}})();var Xe=class extends ct{constructor(){super(()=>new X)}},Z=new Xe;var Ut=new M,We=new M;function Gn(i,t,e={},n=0,r=1/0){let s=n*n,o=r*r,a=1/0,c=null;if(i.shapecast({boundsTraverseOrder:u=>(Ut.copy(t).clamp(u.min,u.max),Ut.distanceToSquared(t)),intersectsBounds:(u,f,l)=>l<a&&l<o,intersectsTriangle:(u,f)=>{u.closestPointToPoint(t,Ut);let l=t.distanceToSquared(Ut);return l<a&&(We.copy(Ut),a=l,c=f),l<s}}),a===1/0)return null;let p=Math.sqrt(a);return e.point?e.point.copy(We):e.point=We.clone(),e.distance=p,e.faceIndex=c,e}var le=parseInt("186")>=169,Hi=parseInt("186")<=161,mt=new M,dt=new M,yt=new M,fe=new K,ue=new K,pe=new K,kn=new M,qn=new M,Yn=new M,Ht=new M;function Vi(i,t,e,n,r,s,o,a){let c;if(s===Xt?c=i.intersectTriangle(n,e,t,!0,r):c=i.intersectTriangle(t,e,n,s!==an,r),c===null)return null;let p=i.origin.distanceTo(r);return p<o||p>a?null:{distance:p,point:r.clone()}}function Xn(i,t,e,n,r,s,o,a,c,p,u){mt.fromBufferAttribute(t,s),dt.fromBufferAttribute(t,o),yt.fromBufferAttribute(t,a);let f=Vi(i,mt,dt,yt,Ht,c,p,u);if(f){if(n){fe.fromBufferAttribute(n,s),ue.fromBufferAttribute(n,o),pe.fromBufferAttribute(n,a),f.uv=new K;let m=rt.getInterpolation(Ht,mt,dt,yt,fe,ue,pe,f.uv);le||(f.uv=m)}if(r){fe.fromBufferAttribute(r,s),ue.fromBufferAttribute(r,o),pe.fromBufferAttribute(r,a),f.uv1=new K;let m=rt.getInterpolation(Ht,mt,dt,yt,fe,ue,pe,f.uv1);le||(f.uv1=m),Hi&&(f.uv2=f.uv1)}if(e){kn.fromBufferAttribute(e,s),qn.fromBufferAttribute(e,o),Yn.fromBufferAttribute(e,a),f.normal=new M;let m=rt.getInterpolation(Ht,mt,dt,yt,kn,qn,Yn,f.normal);f.normal.dot(i.direction)>0&&f.normal.multiplyScalar(-1),le||(f.normal=m)}let l={a:s,b:o,c:a,normal:new M,materialIndex:0};if(rt.getNormal(mt,dt,yt,l.normal),f.face=l,f.faceIndex=s,le){let m=new M;rt.getBarycoord(Ht,mt,dt,yt,m),f.barycoord=m}}return f}function Wn(i){return i&&i.isMaterial?i.side:i}function bt(i,t,e,n,r,s,o){let a=n*3,c=a+0,p=a+1,u=a+2,{index:f,groups:l}=i;i.index&&(c=f.getX(c),p=f.getX(p),u=f.getX(u));let{position:m,normal:g,uv:T,uv1:A}=i.attributes;if(Array.isArray(t)){let v=n*3;for(let d=0,y=l.length;d<y;d++){let{start:h,count:x,materialIndex:E}=l[d];if(v>=h&&v<h+x){let w=Wn(t[E]),_=Xn(e,m,g,T,A,c,p,u,w,s,o);if(_)if(_.faceIndex=n,_.face.materialIndex=E,r)r.push(_);else return _}}}else{let v=Wn(t),d=Xn(e,m,g,T,A,c,p,u,v,s,o);if(d)if(d.faceIndex=n,d.face.materialIndex=0,r)r.push(d);else return d}return null}function H(i,t,e,n){let r=i.a,s=i.b,o=i.c,a=t,c=t+1,p=t+2;e&&(a=e.getX(a),c=e.getX(c),p=e.getX(p)),r.x=n.getX(a),r.y=n.getY(a),r.z=n.getZ(a),s.x=n.getX(c),s.y=n.getY(c),s.z=n.getZ(c),o.x=n.getX(p),o.y=n.getY(p),o.z=n.getZ(p)}function Kn(i,t,e,n,r,s,o,a){let{geometry:c,_indirectBuffer:p}=i;for(let u=n,f=n+r;u<f;u++)bt(c,t,e,u,s,o,a)}function $n(i,t,e,n,r,s,o){let{geometry:a,_indirectBuffer:c}=i,p=1/0,u=null;for(let f=n,l=n+r;f<l;f++){let m;m=bt(a,t,e,f,null,s,o),m&&m.distance<p&&(u=m,p=m.distance)}return u}function Jn(i,t,e,n,r,s,o){let{geometry:a}=e,{index:c}=a,p=a.attributes.position;for(let u=i,f=t+i;u<f;u++){let l;if(l=u,H(o,l*3,c,p),o.needsUpdate=!0,n(o,l,r,s))return!0}return!1}function Qn(i,t=null){t&&Array.isArray(t)&&(t=new Set(t));let e=i.geometry,n=e.index?e.index.array:null,r=e.attributes.position,s,o,a,c,p=0,u=i._roots;for(let l=0,m=u.length;l<m;l++)s=u[l],o=new Uint32Array(s),a=new Uint16Array(s),c=new Float32Array(s),f(0,p),p+=s.byteLength;function f(l,m,g=!1){let T=l*2;if(F(T,a)){let A=C(l,o),v=z(T,a),d=1/0,y=1/0,h=1/0,x=-1/0,E=-1/0,w=-1/0;for(let _=3*A,b=3*(A+v);_<b;_++){let B=n[_],P=r.getX(B),S=r.getY(B),I=r.getZ(B);P<d&&(d=P),P>x&&(x=P),S<y&&(y=S),S>E&&(E=S),I<h&&(h=I),I>w&&(w=I)}return c[l+0]!==d||c[l+1]!==y||c[l+2]!==h||c[l+3]!==x||c[l+4]!==E||c[l+5]!==w?(c[l+0]=d,c[l+1]=y,c[l+2]=h,c[l+3]=x,c[l+4]=E,c[l+5]=w,!0):!1}else{let A=O(l),v=L(l,o),d=g,y=!1,h=!1;if(t){if(!d){let B=A/8+m/32,P=v/8+m/32;y=t.has(B),h=t.has(P),d=!y&&!h}}else y=!0,h=!0;let x=d||y,E=d||h,w=!1;x&&(w=f(A,m,d));let _=!1;E&&(_=f(v,m,d));let b=w||_;if(b)for(let B=0;B<3;B++){let P=A+B,S=v+B,I=c[P],D=c[P+3],N=c[S],V=c[S+3];c[l+B]=I<N?I:N,c[l+B+3]=D>V?D:V}return b}}}function j(i,t,e,n,r){let s,o,a,c,p,u,f=1/e.direction.x,l=1/e.direction.y,m=1/e.direction.z,g=e.origin.x,T=e.origin.y,A=e.origin.z,v=t[i],d=t[i+3],y=t[i+1],h=t[i+3+1],x=t[i+2],E=t[i+3+2];return f>=0?(s=(v-g)*f,o=(d-g)*f):(s=(d-g)*f,o=(v-g)*f),l>=0?(a=(y-T)*l,c=(h-T)*l):(a=(h-T)*l,c=(y-T)*l),s>c||a>o||((a>s||isNaN(s))&&(s=a),(c<o||isNaN(o))&&(o=c),m>=0?(p=(x-A)*m,u=(E-A)*m):(p=(E-A)*m,u=(x-A)*m),s>u||p>o)?!1:((p>s||s!==s)&&(s=p),(u<o||o!==o)&&(o=u),s<=r&&o>=n)}function jn(i,t,e,n,r,s,o,a){let{geometry:c,_indirectBuffer:p}=i;for(let u=n,f=n+r;u<f;u++){let l=p?p[u]:u;bt(c,t,e,l,s,o,a)}}function ti(i,t,e,n,r,s,o){let{geometry:a,_indirectBuffer:c}=i,p=1/0,u=null;for(let f=n,l=n+r;f<l;f++){let m;m=bt(a,t,e,c?c[f]:f,null,s,o),m&&m.distance<p&&(u=m,p=m.distance)}return u}function ei(i,t,e,n,r,s,o){let{geometry:a}=e,{index:c}=a,p=a.attributes.position;for(let u=i,f=t+i;u<f;u++){let l;if(l=e.resolveTriangleIndex(u),H(o,l*3,c,p),o.needsUpdate=!0,n(o,l,r,s))return!0}return!1}function ni(i,t,e,n,r,s,o){R.setBuffer(i._roots[t]),Ze(0,i,e,n,r,s,o),R.clearBuffer()}function Ze(i,t,e,n,r,s,o){let{float32Array:a,uint16Array:c,uint32Array:p}=R,u=i*2;if(F(u,c)){let l=C(i,p),m=z(u,c);Kn(t,e,n,l,m,r,s,o)}else{let l=O(i);j(l,a,n,s,o)&&Ze(l,t,e,n,r,s,o);let m=L(i,p);j(m,a,n,s,o)&&Ze(m,t,e,n,r,s,o)}}var Gi=["x","y","z"];function ii(i,t,e,n,r,s){R.setBuffer(i._roots[t]);let o=Ke(0,i,e,n,r,s);return R.clearBuffer(),o}function Ke(i,t,e,n,r,s){let{float32Array:o,uint16Array:a,uint32Array:c}=R,p=i*2;if(F(p,a)){let f=C(i,c),l=z(p,a);return $n(t,e,n,f,l,r,s)}else{let f=ot(i,c),l=Gi[f],g=n.direction[l]>=0,T,A;g?(T=O(i),A=L(i,c)):(T=L(i,c),A=O(i));let d=j(T,o,n,r,s)?Ke(T,t,e,n,r,s):null;if(d){let x=d.point[l];if(g?x<=o[A+f]:x>=o[A+f+3])return d}let h=j(A,o,n,r,s)?Ke(A,t,e,n,r,s):null;return d&&h?d.distance<=h.distance?d:h:d||h||null}}var me=new W,Pt=new X,It=new X,Vt=new q,ri=new G,de=new G;function oi(i,t,e,n){R.setBuffer(i._roots[t]);let r=$e(0,i,e,n);return R.clearBuffer(),r}function $e(i,t,e,n,r=null){let{float32Array:s,uint16Array:o,uint32Array:a}=R,c=i*2;if(r===null&&(e.boundingBox||e.computeBoundingBox(),ri.set(e.boundingBox.min,e.boundingBox.max,n),r=ri),F(c,o)){let u=t.geometry,f=u.index,l=u.attributes.position,m=e.index,g=e.attributes.position,T=C(i,a),A=z(c,o);if(Vt.copy(n).invert(),e.boundsTree)return U(i,s,de),de.matrix.copy(Vt),de.needsUpdate=!0,e.boundsTree.shapecast({intersectsBounds:d=>de.intersectsBox(d),intersectsTriangle:d=>{d.a.applyMatrix4(n),d.b.applyMatrix4(n),d.c.applyMatrix4(n),d.needsUpdate=!0;for(let y=T*3,h=(A+T)*3;y<h;y+=3)if(H(It,y,f,l),It.needsUpdate=!0,d.intersectsTriangle(It))return!0;return!1}});{let v=ft(e);for(let d=T*3,y=(A+T)*3;d<y;d+=3){H(Pt,d,f,l),Pt.a.applyMatrix4(Vt),Pt.b.applyMatrix4(Vt),Pt.c.applyMatrix4(Vt),Pt.needsUpdate=!0;for(let h=0,x=v*3;h<x;h+=3)if(H(It,h,m,g),It.needsUpdate=!0,Pt.intersectsTriangle(It))return!0}}}else{let u=O(i),f=L(i,a);return U(u,s,me),!!(r.intersectsBox(me)&&$e(u,t,e,n,r)||(U(f,s,me),r.intersectsBox(me)&&$e(f,t,e,n,r)))}}var ye=new q,Je=new G,Gt=new G,ki=new M,qi=new M,Yi=new M,Xi=new M;function si(i,t,e,n={},r={},s=0,o=1/0){t.boundingBox||t.computeBoundingBox(),Je.set(t.boundingBox.min,t.boundingBox.max,e),Je.needsUpdate=!0;let a=i.geometry,c=a.attributes.position,p=a.index,u=t.attributes.position,f=t.index,l=Z.getPrimitive(),m=Z.getPrimitive(),g=ki,T=qi,A=null,v=null;r&&(A=Yi,v=Xi);let d=1/0,y=null,h=null;return ye.copy(e).invert(),Gt.matrix.copy(ye),i.shapecast({boundsTraverseOrder:x=>Je.distanceToBox(x),intersectsBounds:(x,E,w)=>w<d&&w<o?(E&&(Gt.min.copy(x.min),Gt.max.copy(x.max),Gt.needsUpdate=!0),!0):!1,intersectsRange:(x,E)=>{if(t.boundsTree)return t.boundsTree.shapecast({boundsTraverseOrder:_=>Gt.distanceToBox(_),intersectsBounds:(_,b,B)=>B<d&&B<o,intersectsRange:(_,b)=>{for(let B=_,P=_+b;B<P;B++){H(m,3*B,f,u),m.a.applyMatrix4(e),m.b.applyMatrix4(e),m.c.applyMatrix4(e),m.needsUpdate=!0;for(let S=x,I=x+E;S<I;S++){H(l,3*S,p,c),l.needsUpdate=!0;let D=l.distanceToTriangle(m,g,A);if(D<d&&(T.copy(g),v&&v.copy(A),d=D,y=S,h=B),D<s)return!0}}}});{let w=ft(t);for(let _=0,b=w;_<b;_++){H(m,3*_,f,u),m.a.applyMatrix4(e),m.b.applyMatrix4(e),m.c.applyMatrix4(e),m.needsUpdate=!0;for(let B=x,P=x+E;B<P;B++){H(l,3*B,p,c),l.needsUpdate=!0;let S=l.distanceToTriangle(m,g,A);if(S<d&&(T.copy(g),v&&v.copy(A),d=S,y=B,h=_),S<s)return!0}}}}}),Z.releasePrimitive(l),Z.releasePrimitive(m),d===1/0?null:(n.point?n.point.copy(T):n.point=T.clone(),n.distance=d,n.faceIndex=y,r&&(r.point?r.point.copy(v):r.point=v.clone(),r.point.applyMatrix4(ye),T.applyMatrix4(ye),r.distance=T.sub(r.point).length(),r.faceIndex=h),n)}function ci(i,t=null){t&&Array.isArray(t)&&(t=new Set(t));let e=i.geometry,n=e.index?e.index.array:null,r=e.attributes.position,s,o,a,c,p=0,u=i._roots;for(let l=0,m=u.length;l<m;l++)s=u[l],o=new Uint32Array(s),a=new Uint16Array(s),c=new Float32Array(s),f(0,p),p+=s.byteLength;function f(l,m,g=!1){let T=l*2;if(F(T,a)){let A=C(l,o),v=z(T,a),d=1/0,y=1/0,h=1/0,x=-1/0,E=-1/0,w=-1/0;for(let _=A,b=A+v;_<b;_++){let B=3*i.resolveTriangleIndex(_);for(let P=0;P<3;P++){let S=B+P;S=n?n[S]:S;let I=r.getX(S),D=r.getY(S),N=r.getZ(S);I<d&&(d=I),I>x&&(x=I),D<y&&(y=D),D>E&&(E=D),N<h&&(h=N),N>w&&(w=N)}}return c[l+0]!==d||c[l+1]!==y||c[l+2]!==h||c[l+3]!==x||c[l+4]!==E||c[l+5]!==w?(c[l+0]=d,c[l+1]=y,c[l+2]=h,c[l+3]=x,c[l+4]=E,c[l+5]=w,!0):!1}else{let A=O(l),v=L(l,o),d=g,y=!1,h=!1;if(t){if(!d){let B=A/8+m/32,P=v/8+m/32;y=t.has(B),h=t.has(P),d=!y&&!h}}else y=!0,h=!0;let x=d||y,E=d||h,w=!1;x&&(w=f(A,m,d));let _=!1;E&&(_=f(v,m,d));let b=w||_;if(b)for(let B=0;B<3;B++){let P=A+B,S=v+B,I=c[P],D=c[P+3],N=c[S],V=c[S+3];c[l+B]=I<N?I:N,c[l+B+3]=D>V?D:V}return b}}}function ai(i,t,e,n,r,s,o){R.setBuffer(i._roots[t]),Qe(0,i,e,n,r,s,o),R.clearBuffer()}function Qe(i,t,e,n,r,s,o){let{float32Array:a,uint16Array:c,uint32Array:p}=R,u=i*2;if(F(u,c)){let l=C(i,p),m=z(u,c);jn(t,e,n,l,m,r,s,o)}else{let l=O(i);j(l,a,n,s,o)&&Qe(l,t,e,n,r,s,o);let m=L(i,p);j(m,a,n,s,o)&&Qe(m,t,e,n,r,s,o)}}var Wi=["x","y","z"];function li(i,t,e,n,r,s){R.setBuffer(i._roots[t]);let o=je(0,i,e,n,r,s);return R.clearBuffer(),o}function je(i,t,e,n,r,s){let{float32Array:o,uint16Array:a,uint32Array:c}=R,p=i*2;if(F(p,a)){let f=C(i,c),l=z(p,a);return ti(t,e,n,f,l,r,s)}else{let f=ot(i,c),l=Wi[f],g=n.direction[l]>=0,T,A;g?(T=O(i),A=L(i,c)):(T=L(i,c),A=O(i));let d=j(T,o,n,r,s)?je(T,t,e,n,r,s):null;if(d){let x=d.point[l];if(g?x<=o[A+f]:x>=o[A+f+3])return d}let h=j(A,o,n,r,s)?je(A,t,e,n,r,s):null;return d&&h?d.distance<=h.distance?d:h:d||h||null}}var xe=new W,Dt=new X,Mt=new X,kt=new q,fi=new G,he=new G;function ui(i,t,e,n){R.setBuffer(i._roots[t]);let r=tn(0,i,e,n);return R.clearBuffer(),r}function tn(i,t,e,n,r=null){let{float32Array:s,uint16Array:o,uint32Array:a}=R,c=i*2;if(r===null&&(e.boundingBox||e.computeBoundingBox(),fi.set(e.boundingBox.min,e.boundingBox.max,n),r=fi),F(c,o)){let u=t.geometry,f=u.index,l=u.attributes.position,m=e.index,g=e.attributes.position,T=C(i,a),A=z(c,o);if(kt.copy(n).invert(),e.boundsTree)return U(i,s,he),he.matrix.copy(kt),he.needsUpdate=!0,e.boundsTree.shapecast({intersectsBounds:d=>he.intersectsBox(d),intersectsTriangle:d=>{d.a.applyMatrix4(n),d.b.applyMatrix4(n),d.c.applyMatrix4(n),d.needsUpdate=!0;for(let y=T,h=A+T;y<h;y++)if(H(Mt,3*t.resolveTriangleIndex(y),f,l),Mt.needsUpdate=!0,d.intersectsTriangle(Mt))return!0;return!1}});{let v=ft(e);for(let d=T,y=A+T;d<y;d++){let h=t.resolveTriangleIndex(d);H(Dt,3*h,f,l),Dt.a.applyMatrix4(kt),Dt.b.applyMatrix4(kt),Dt.c.applyMatrix4(kt),Dt.needsUpdate=!0;for(let x=0,E=v*3;x<E;x+=3)if(H(Mt,x,m,g),Mt.needsUpdate=!0,Dt.intersectsTriangle(Mt))return!0}}}else{let u=O(i),f=L(i,a);return U(u,s,xe),!!(r.intersectsBox(xe)&&tn(u,t,e,n,r)||(U(f,s,xe),r.intersectsBox(xe)&&tn(f,t,e,n,r)))}}var ge=new q,en=new G,qt=new G,Zi=new M,Ki=new M,$i=new M,Ji=new M;function pi(i,t,e,n={},r={},s=0,o=1/0){t.boundingBox||t.computeBoundingBox(),en.set(t.boundingBox.min,t.boundingBox.max,e),en.needsUpdate=!0;let a=i.geometry,c=a.attributes.position,p=a.index,u=t.attributes.position,f=t.index,l=Z.getPrimitive(),m=Z.getPrimitive(),g=Zi,T=Ki,A=null,v=null;r&&(A=$i,v=Ji);let d=1/0,y=null,h=null;return ge.copy(e).invert(),qt.matrix.copy(ge),i.shapecast({boundsTraverseOrder:x=>en.distanceToBox(x),intersectsBounds:(x,E,w)=>w<d&&w<o?(E&&(qt.min.copy(x.min),qt.max.copy(x.max),qt.needsUpdate=!0),!0):!1,intersectsRange:(x,E)=>{if(t.boundsTree){let w=t.boundsTree;return w.shapecast({boundsTraverseOrder:_=>qt.distanceToBox(_),intersectsBounds:(_,b,B)=>B<d&&B<o,intersectsRange:(_,b)=>{for(let B=_,P=_+b;B<P;B++){let S=w.resolveTriangleIndex(B);H(m,3*S,f,u),m.a.applyMatrix4(e),m.b.applyMatrix4(e),m.c.applyMatrix4(e),m.needsUpdate=!0;for(let I=x,D=x+E;I<D;I++){let N=i.resolveTriangleIndex(I);H(l,3*N,p,c),l.needsUpdate=!0;let V=l.distanceToTriangle(m,g,A);if(V<d&&(T.copy(g),v&&v.copy(A),d=V,y=I,h=B),V<s)return!0}}}})}else{let w=ft(t);for(let _=0,b=w;_<b;_++){H(m,3*_,f,u),m.a.applyMatrix4(e),m.b.applyMatrix4(e),m.c.applyMatrix4(e),m.needsUpdate=!0;for(let B=x,P=x+E;B<P;B++){let S=i.resolveTriangleIndex(B);H(l,3*S,p,c),l.needsUpdate=!0;let I=l.distanceToTriangle(m,g,A);if(I<d&&(T.copy(g),v&&v.copy(A),d=I,y=B,h=_),I<s)return!0}}}}}),Z.releasePrimitive(l),Z.releasePrimitive(m),d===1/0?null:(n.point?n.point.copy(T):n.point=T.clone(),n.distance=d,n.faceIndex=y,r&&(r.point?r.point.copy(v):r.point=v.clone(),r.point.applyMatrix4(ge),T.applyMatrix4(ge),r.distance=T.sub(r.point).length(),r.faceIndex=h),n)}function nn(i,t,e){return i===null?null:(i.point.applyMatrix4(t.matrixWorld),i.distance=i.point.distanceTo(e.ray.origin),i.object=t,i)}var ve=new G,Te=new Tn,mi=new M,di=new q,yi=new M,rn=["getX","getY","getZ"],Ae=class i extends ae{static serialize(t,e={}){e={cloneBuffers:!0,...e};let n=t.geometry,r=t._roots,s=t._indirectBuffer,o=n.getIndex(),a={version:1,roots:null,index:null,indirectBuffer:null};return e.cloneBuffers?(a.roots=r.map(c=>c.slice()),a.index=o?o.array.slice():null,a.indirectBuffer=s?s.slice():null):(a.roots=r,a.index=o?o.array:null,a.indirectBuffer=s),a}static deserialize(t,e,n={}){n={setIndex:!0,indirect:!!t.indirectBuffer,...n};let{index:r,roots:s,indirectBuffer:o}=t;t.version||(console.warn("MeshBVH.deserialize: Serialization format has been changed and will be fixed up. It is recommended to regenerate any stored serialized data."),c(s));let a=new i(e,{...n,[Ft]:!0});if(a._roots=s,a._indirectBuffer=o||null,n.setIndex){let p=e.getIndex();if(p===null){let u=new gt(t.index,1,!1);e.setIndex(u)}else p.array!==r&&(p.array.set(r),p.needsUpdate=!0)}return a;function c(p){for(let u=0;u<p.length;u++){let f=p[u],l=new Uint32Array(f),m=new Uint16Array(f);for(let g=0,T=f.byteLength/32;g<T;g++){let A=8*g,v=2*A;F(v,m)||(l[A+6]=l[A+6]/8-g)}}}}get primitiveStride(){return 3}get resolveTriangleIndex(){return this.resolvePrimitiveIndex}constructor(t,e={}){e.maxLeafTris&&(console.warn('MeshBVH: "maxLeafTris" option has been deprecated. Use "targetLeafSize", instead.'),e={...e,targetLeafSize:e.maxLeafTris}),super(t,e)}shiftTriangleOffsets(t){return super.shiftPrimitiveOffsets(t)}writePrimitiveBounds(t,e,n){let r=this.geometry,s=this._indirectBuffer,o=r.attributes.position,a=r.index?r.index.array:null,p=(s?s[t]:t)*3,u=p+0,f=p+1,l=p+2;a&&(u=a[u],f=a[f],l=a[l]);for(let m=0;m<3;m++){let g=o[rn[m]](u),T=o[rn[m]](f),A=o[rn[m]](l),v=g;T<v&&(v=T),A<v&&(v=A);let d=g;T>d&&(d=T),A>d&&(d=A),e[n+m]=v,e[n+m+3]=d}return e}computePrimitiveBounds(t,e,n){let r=this.geometry,s=this._indirectBuffer,o=r.attributes.position,a=r.index?r.index.array:null,c=o.normalized;if(t<0||e+t-n.offset>n.length/6)throw new Error("MeshBVH: compute triangle bounds range is invalid.");let p=o.array,u=o.offset||0,f=3;o.isInterleavedBufferAttribute&&(f=o.data.stride);let l=["getX","getY","getZ"],m=n.offset;for(let g=t,T=t+e;g<T;g++){let v=(s?s[g]:g)*3,d=(g-m)*6,y=v+0,h=v+1,x=v+2;a&&(y=a[y],h=a[h],x=a[x]),c||(y=y*f+u,h=h*f+u,x=x*f+u);for(let E=0;E<3;E++){let w,_,b;c?(w=o[l[E]](y),_=o[l[E]](h),b=o[l[E]](x)):(w=p[y+E],_=p[h+E],b=p[x+E]);let B=w;_<B&&(B=_),b<B&&(B=b);let P=w;_>P&&(P=_),b>P&&(P=b);let S=(P-B)/2,I=E*2;n[d+I+0]=B+S,n[d+I+1]=S+(Math.abs(B)+S)*vt}}return n}raycastObject3D(t,e,n=[]){let{material:r}=t;if(r===void 0)return;di.copy(t.matrixWorld).invert(),Te.copy(e.ray).applyMatrix4(di),yi.setFromMatrixScale(t.matrixWorld),mi.copy(Te.direction).multiply(yi);let s=mi.length(),o=e.near/s,a=e.far/s;if(e.firstHitOnly===!0){let c=this.raycastFirst(Te,r,o,a);c=nn(c,t,e),c&&n.push(c)}else{let c=this.raycast(Te,r,o,a);for(let p=0,u=c.length;p<u;p++){let f=nn(c[p],t,e);f&&n.push(f)}}return n}refit(t=null){return(this.indirect?ci:Qn)(this,t)}raycast(t,e=De,n=0,r=1/0){let s=this._roots,o=[],a=this.indirect?ai:ni;for(let c=0,p=s.length;c<p;c++)a(this,c,e,t,o,n,r);return o}raycastFirst(t,e=De,n=0,r=1/0){let s=this._roots,o=null,a=this.indirect?li:ii;for(let c=0,p=s.length;c<p;c++){let u=a(this,c,e,t,n,r);u!=null&&(o==null||u.distance<o.distance)&&(o=u)}return o}intersectsGeometry(t,e){let n=!1,r=this._roots,s=this.indirect?ui:oi;for(let o=0,a=r.length;o<a&&(n=s(this,o,t,e),!n);o++);return n}shapecast(t){let e=Z.getPrimitive(),n=super.shapecast({...t,intersectsPrimitive:t.intersectsTriangle,scratchPrimitive:e,iterate:this.indirect?ei:Jn});return Z.releasePrimitive(e),n}bvhcast(t,e,n){let{intersectsRanges:r,intersectsTriangles:s}=n,o=Z.getPrimitive(),a=this.geometry.index,c=this.geometry.attributes.position,p=this.indirect?g=>{let T=this.resolveTriangleIndex(g);H(o,T*3,a,c)}:g=>{H(o,g*3,a,c)},u=Z.getPrimitive(),f=t.geometry.index,l=t.geometry.attributes.position,m=t.indirect?g=>{let T=t.resolveTriangleIndex(g);H(u,T*3,f,l)}:g=>{H(u,g*3,f,l)};if(s){if(!(t instanceof i))throw new Error('MeshBVH: "intersectsTriangles" callback can only be used with another MeshBVH.');let g=(T,A,v,d,y,h,x,E)=>{for(let w=v,_=v+d;w<_;w++){m(w),u.a.applyMatrix4(e),u.b.applyMatrix4(e),u.c.applyMatrix4(e),u.needsUpdate=!0;for(let b=T,B=T+A;b<B;b++)if(p(b),o.needsUpdate=!0,s(o,u,b,w,y,h,x,E))return!0}return!1};if(r){let T=r;r=function(A,v,d,y,h,x,E,w){return T(A,v,d,y,h,x,E,w)?!0:g(A,v,d,y,h,x,E,w)}}else r=g}return super.bvhcast(t,e,{intersectsRanges:r})}intersectsBox(t,e){return ve.set(t.min,t.max,e),ve.needsUpdate=!0,this.shapecast({intersectsBounds:n=>ve.intersectsBox(n),intersectsTriangle:n=>ve.intersectsTriangle(n)})}intersectsSphere(t){return this.shapecast({intersectsBounds:e=>t.intersectsBox(e),intersectsTriangle:e=>e.intersectsSphere(t)})}closestPointToGeometry(t,e,n={},r={},s=0,o=1/0){return(this.indirect?pi:si)(this,t,e,n,r,s,o)}closestPointToPoint(t,e={},n=0,r=1/0){return Gn(this,t,e,n,r)}};function Qi(i){switch(i){case 1:return"R";case 2:return"RG";case 3:return"RGBA";case 4:return"RGBA"}throw new Error}function ji(i){switch(i){case 1:return mn;case 2:return yn;case 3:return ht;case 4:return ht}}function xi(i){switch(i){case 1:return dn;case 2:return Zt;case 3:return Kt;case 4:return Kt}}var we=class extends Nt{constructor(){super(),this.minFilter=it,this.magFilter=it,this.generateMipmaps=!1,this.overrideItemSize=null,this._forcedType=null}updateFrom(t){let e=this.overrideItemSize,n=t.itemSize,r=t.count;if(e!==null){if(n*r%e!==0)throw new Error("VertexAttributeTexture: overrideItemSize must divide evenly into buffer length.");t.itemSize=e,t.count=r*n/e}let s=t.itemSize,o=t.count,a=t.normalized,c=t.array.constructor,p=c.BYTES_PER_ELEMENT,u=this._forcedType,f=s;if(u===null)switch(c){case Float32Array:u=pt;break;case Uint8Array:case Uint16Array:case Uint32Array:u=ut;break;case Int8Array:case Int16Array:case Int32Array:u=Wt;break}let l,m,g,T,A=Qi(s);switch(u){case pt:g=1,m=ji(s),a&&p===1?(T=c,A+="8",c===Uint8Array?l=Me:(l=Ne,A+="_SNORM")):(T=Float32Array,A+="32F",l=pt);break;case Wt:A+=p*8+"I",g=a?Math.pow(2,c.BYTES_PER_ELEMENT*8-1):1,m=xi(s),p===1?(T=Int8Array,l=Ne):p===2?(T=Int16Array,l=fn):(T=Int32Array,l=Wt);break;case ut:A+=p*8+"UI",g=a?Math.pow(2,c.BYTES_PER_ELEMENT*8-1):1,m=xi(s),p===1?(T=Uint8Array,l=Me):p===2?(T=Uint16Array,l=un):(T=Uint32Array,l=ut);break}f===3&&(m===ht||m===Kt)&&(f=4);let v=Math.ceil(Math.sqrt(o))||1,d=f*v*v,y=new T(d),h=t.normalized;t.normalized=!1;for(let x=0;x<o;x++){let E=f*x;y[E]=t.getX(x)/g,s>=2&&(y[E+1]=t.getY(x)/g),s>=3&&(y[E+2]=t.getZ(x)/g,f===4&&(y[E+3]=1)),s>=4&&(y[E+3]=t.getW(x)/g)}t.normalized=h,this.internalFormat=A,this.format=m,this.type=l,this.image.width=v,this.image.height=v,this.image.data=y,this.needsUpdate=!0,this.dispose(),t.itemSize=n,t.count=r}},Be=class extends we{constructor(){super(),this._forcedType=ut}};var Ee=class extends we{constructor(){super(),this._forcedType=pt}};var Se=class{constructor(){this.index=new Be,this.position=new Ee,this.bvhBounds=new Nt,this.bvhContents=new Nt,this._cachedIndexAttr=null,this.index.overrideItemSize=3}updateFrom(t){let{geometry:e}=t;if(er(t,this.bvhBounds,this.bvhContents),this.position.updateFrom(e.attributes.position),t.indirect){let n=t._indirectBuffer;if(this._cachedIndexAttr===null||this._cachedIndexAttr.count!==n.length)if(e.index)this._cachedIndexAttr=e.index.clone();else{let r=qe(Lt(e));this._cachedIndexAttr=new gt(r,1,!1)}tr(e,n,this._cachedIndexAttr),this.index.updateFrom(this._cachedIndexAttr)}else this.index.updateFrom(e.index)}dispose(){let{index:t,position:e,bvhBounds:n,bvhContents:r}=this;t&&t.dispose(),e&&e.dispose(),n&&n.dispose(),r&&r.dispose()}};function tr(i,t,e){let n=e.array,r=i.index?i.index.array:null;for(let s=0,o=t.length;s<o;s++){let a=3*s,c=3*t[s];for(let p=0;p<3;p++)n[a+p]=r?r[c+p]:c+p}}function er(i,t,e){let n=i._roots;if(n.length!==1)throw new Error("MeshBVHUniformStruct: Multi-root BVHs not supported.");let r=n[0],s=new Uint16Array(r),o=new Uint32Array(r),a=new Float32Array(r),c=r.byteLength/32,p=2*Math.ceil(Math.sqrt(c/2)),u=new Float32Array(4*p*p),f=Math.ceil(Math.sqrt(c)),l=new Uint32Array(2*f*f);for(let m=0;m<c;m++){let g=m*32/4,T=g*2,A=g;for(let v=0;v<3;v++)u[8*m+0+v]=a[A+0+v],u[8*m+4+v]=a[A+3+v];if(F(T,s)){let v=z(T,s),d=C(g,o),y=-65536|v;l[m*2+0]=y,l[m*2+1]=d}else{let v=o[g+6],d=ot(g,o);l[m*2+0]=d,l[m*2+1]=v}}t.image.data=u,t.image.width=p,t.image.height=p,t.format=ht,t.type=pt,t.internalFormat="RGBA32F",t.minFilter=it,t.magFilter=it,t.generateMipmaps=!1,t.needsUpdate=!0,t.dispose(),e.image.data=l,e.image.width=f,e.image.height=f,e.format=Zt,e.type=ut,e.internalFormat="RG32UI",e.minFilter=it,e.magFilter=it,e.generateMipmaps=!1,e.needsUpdate=!0,e.dispose()}var hi=`

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
`;function Dc(i,t){let e=new Se;return e.updateFrom(new Ae(i.clone(),{strategy:2})),new En({defines:{ENVMAP_TYPE_CUBEM:"",CHROMATIC_ABERRATIONS:"",FAST_CHROMA:""},uniforms:{lightDirection:{value:new M(0,1,1).normalize()},lightStrength:{value:0},envMap:{value:t},bounces:{value:5},ior:{value:2.417},correctMips:{value:!0},aberrationStrength:{value:.018},fresnel:{value:.12},bvh:{value:e},color:{value:new $t("#f8fbff")},opacity:{value:1},resolution:{value:new K(1600,1e3)},viewMatrixInverse:{value:new q},projectionMatrixInverse:{value:new q}},vertexShader:`
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
  }`})}function Nc(){let i=[{r:0,y:-.64,n:16,o:0},{r:.4,y:-.26,n:16,o:Math.PI/16},{r:.64,y:-.025,n:16,o:0},{r:.64,y:.025,n:16,o:0},{r:.4,y:.31,n:16,o:Math.PI/16}],t=[],e=(s,o,a)=>t.push(...s,...o,...a),n=(s,o)=>[Math.cos(o/16*Math.PI*2+s.o)*s.r,s.y,Math.sin(o/16*Math.PI*2+s.o)*s.r];for(let s=0;s<i.length-1;s++)for(let o=0;o<16;o++){let a=n(i[s],o),c=n(i[s],o+1),p=n(i[s+1],o),u=n(i[s+1],o+1);e(a,p,c),e(c,p,u)}for(let s=0;s<16;s++)e([0,.31,0],n(i[4],s+1),n(i[4],s));let r=new vn;return r.setAttribute("position",new gn(t,3)),r.computeVertexNormals(),r}function Fc(i){let t=new hn;t.background=new $t("#8e98a7");let e=document.createElement("canvas");e.width=1024,e.height=512;let n=e.getContext("2d");n.fillStyle="#d8d9dc",n.fillRect(0,0,1024,512);let r=["#fafcff","#343b47","#c2c5cc","#ffffff","#747b85","#f9f7ef"];for(let c=0;c<36;c++){n.fillStyle=r[c%r.length];let p=c*167%1024,u=c*79%512;n.fillRect(p,u,40+c*31%180,70+c*23%230)}let s=new An(e);s.colorSpace=xn,t.add(new Re(new Bn(15,48,32),new Fe({map:s,side:Xt})));for(let[c,p,u,f,l,m]of[[-3,3,3,3,5,16777215],[3,1,3,1,4,13030115],[0,4,0,5,2,16777215],[1,-3,2,2,2,15787728],[-3,0,-2,2,5,9475487],[3,3,-3,2,2,16777215]]){let g=new Re(new wn(f,l),new Fe({color:m}));g.position.set(c,p,u),g.lookAt(0,0,0),t.add(g)}let o=new _n(512,{generateMipmaps:!0,minFilter:ln,type:pn});return new Sn(.1,30,o).update(i,t),t.traverse(c=>{c.isMesh&&(c.geometry.dispose(),c.material.dispose())}),s.dispose(),o}export{Dc as a,Nc as b,Fc as c};
