import{$ as A,Da as E,Na as H,P as h,Ta as I,Ua as N,V as _,W as j,X as T,ka as V,oa as B,x as k}from"./chunk-73PUBYJG.js";var U=new h;function b(R,a,o,r,w,t){let d=2*Math.PI*w/4,g=Math.max(t-2*w,0),x=Math.PI/4;U.copy(a),U[r]=0,U.normalize();let e=.5*d/(d+g),i=1-U.angleTo(R)/x;return Math.sign(U[o])===1?i*e:g/(d+g)+e+e*(1-i)}var G=class R extends E{constructor(a=1,o=1,r=1,w=2,t=.1){let d=w*2+1;if(t=Math.min(a/2,o/2,r/2,t),super(1,1,1,d,d,d),this.type="RoundedBoxGeometry",this.parameters={width:a,height:o,depth:r,segments:w,radius:t},d===1)return;let g=this.toNonIndexed();this.index=null,this.attributes.position=g.attributes.position,this.attributes.normal=g.attributes.normal,this.attributes.uv=g.attributes.uv;let x=new h,e=new h,i=new h(a,o,r).divideScalar(2).subScalar(t),c=this.attributes.position.array,y=this.attributes.normal.array,u=this.attributes.uv.array,D=c.length/6,n=new h,f=.5/d;for(let m=0,l=0;m<c.length;m+=3,l+=2)switch(x.fromArray(c,m),e.copy(x),e.x-=Math.sign(e.x)*f,e.y-=Math.sign(e.y)*f,e.z-=Math.sign(e.z)*f,e.normalize(),c[m+0]=i.x*Math.sign(x.x)+e.x*t,c[m+1]=i.y*Math.sign(x.y)+e.y*t,c[m+2]=i.z*Math.sign(x.z)+e.z*t,y[m+0]=e.x,y[m+1]=e.y,y[m+2]=e.z,Math.floor(m/D)){case 0:n.set(1,0,0),u[l+0]=b(n,e,"z","y",t,r),u[l+1]=1-b(n,e,"y","z",t,o);break;case 1:n.set(-1,0,0),u[l+0]=1-b(n,e,"z","y",t,r),u[l+1]=1-b(n,e,"y","z",t,o);break;case 2:n.set(0,1,0),u[l+0]=1-b(n,e,"x","z",t,a),u[l+1]=b(n,e,"z","x",t,r);break;case 3:n.set(0,-1,0),u[l+0]=1-b(n,e,"x","z",t,a),u[l+1]=1-b(n,e,"z","x",t,r);break;case 4:n.set(0,0,1),u[l+0]=1-b(n,e,"x","y",t,a),u[l+1]=1-b(n,e,"y","x",t,o);break;case 5:n.set(0,0,-1),u[l+0]=b(n,e,"x","y",t,a),u[l+1]=1-b(n,e,"y","x",t,o);break}}static fromJSON(a){return new R(a.width,a.height,a.depth,a.segments,a.radius)}};var F=class R extends B{constructor(a,o={}){super(a),this.isReflector=!0,this.type="Reflector",this.forceUpdate=!1,this._reflectionCameras=new WeakMap;let r=this,w=o.color!==void 0?new A(o.color):new A(8355711),t=o.textureWidth||512,d=o.textureHeight||512,g=o.clipBias||0,x=o.shader||R.ReflectorShader,e=o.multisample!==void 0?o.multisample:4,i=new V,c=new h,y=new h,u=new h,D=new T,n=new h(0,0,-1),f=new _,m=new h,l=new h,M=new _,C=new T,P=new j(t,d,{samples:e,type:k}),W=new N({name:x.name!==void 0?x.name:"unspecified",uniforms:I.clone(x.uniforms),fragmentShader:x.fragmentShader,vertexShader:x.vertexShader});W.uniforms.tDiffuse.value=P.texture,W.uniforms.color.value=w,W.uniforms.textureMatrix.value=C,this.material=W,this.onBeforeRender=function(s,z,S){let p=this.getReflectionCamera(S);if(y.setFromMatrixPosition(r.matrixWorld),u.setFromMatrixPosition(S.matrixWorld),D.extractRotation(r.matrixWorld),c.set(0,0,1),c.applyMatrix4(D),m.subVectors(y,u),m.dot(c)>0===!0&&this.forceUpdate===!1)return;m.reflect(c).negate(),m.add(y),D.extractRotation(S.matrixWorld),n.set(0,0,-1),n.applyMatrix4(D),n.add(u),l.subVectors(y,n),l.reflect(c).negate(),l.add(y),p.position.copy(m),p.up.set(0,1,0),p.up.applyMatrix4(D),p.up.reflect(c),p.lookAt(l),p.far=S.far,p.updateMatrixWorld(),p.projectionMatrix.copy(S.projectionMatrix),C.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),C.multiply(p.projectionMatrix),C.multiply(p.matrixWorldInverse),C.multiply(r.matrixWorld),i.setFromNormalAndCoplanarPoint(c,y),i.applyMatrix4(p.matrixWorldInverse),f.set(i.normal.x,i.normal.y,i.normal.z,i.constant);let v=p.projectionMatrix;p.isOrthographicCamera?(M.x=(Math.sign(f.x)+v.elements[8])/v.elements[0],M.y=(Math.sign(f.y)+v.elements[9])/v.elements[5],M.z=-S.far,M.w=1):(M.x=(Math.sign(f.x)+v.elements[8])/v.elements[0],M.y=(Math.sign(f.y)+v.elements[9])/v.elements[5],M.z=-1,M.w=(1+v.elements[10])/v.elements[14]),f.multiplyScalar(2/f.dot(M)),v.elements[2]=f.x,v.elements[6]=f.y,p.isOrthographicCamera?(v.elements[10]=f.z-g,v.elements[14]=f.w-1):(v.elements[10]=f.z+1-g,v.elements[14]=f.w),r.visible=!1;let L=s.getRenderTarget(),q=s.xr.enabled,J=s.shadowMap.autoUpdate;s.xr.enabled=!1,s.shadowMap.autoUpdate=!1,s.setRenderTarget(P),s.state.buffers.depth.setMask(!0),s.autoClear===!1&&s.clear(),s.render(z,p),s.xr.enabled=q,s.shadowMap.autoUpdate=J,s.setRenderTarget(L);let O=S.viewport;O!==void 0&&s.state.viewport(O),r.visible=!0,this.forceUpdate=!1},this.getRenderTarget=function(){return P},this.dispose=function(){P.dispose(),r.material.dispose()},this.getReflectionCamera=function(s){let z=this._reflectionCameras.get(s);return z===void 0&&(z=s.clone(),this._reflectionCameras.set(s,z)),z}}};F.ReflectorShader={name:"ReflectorShader",uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null}},vertexShader:`
		uniform mat4 textureMatrix;
		varying vec4 vUv;

		#include <common>
		#include <logdepthbuf_pars_vertex>

		void main() {

			vUv = textureMatrix * vec4( position, 1.0 );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			#include <logdepthbuf_vertex>

		}`,fragmentShader:`
		uniform vec3 color;
		uniform sampler2D tDiffuse;
		varying vec4 vUv;

		#include <logdepthbuf_pars_fragment>

		float blendOverlay( float base, float blend ) {

			return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );

		}

		vec3 blendOverlay( vec3 base, vec3 blend ) {

			return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );

		}

		void main() {

			#include <logdepthbuf_fragment>

			vec4 base = texture2DProj( tDiffuse, vUv );
			gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>

		}`};function te(R,{compact:a=!1,exclude:o=[]}={}){let r=new F(new H(14,12),{textureWidth:a?640:1024,textureHeight:a?640:1024,clipBias:.002,multisample:0,shader:{name:"OriginSatinReflection",uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null},uStrength:{value:.2}},vertexShader:`uniform mat4 textureMatrix;varying vec4 vReflection;varying vec2 vFloor;
    void main(){vFloor=position.xy;vReflection=textureMatrix*vec4(position,1.);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform sampler2D tDiffuse;uniform float uStrength;varying vec4 vReflection;varying vec2 vFloor;
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
    }`}});r.rotation.x=-Math.PI/2,r.position.y=-1.65,r.material.transparent=!0,r.material.depthWrite=!1,r.renderOrder=3;let w=r.onBeforeRender;return r.onBeforeRender=function(t,d,g){let x=t.getClearAlpha(),e=o.map(i=>i.visible);o.forEach(i=>{i.visible=!1}),t.setClearAlpha(0);try{w.call(this,t,d,g)}finally{t.setClearAlpha(x),o.forEach((i,c)=>{i.visible=e[c]})}},R.add(r),r}export{G as a,te as b};
