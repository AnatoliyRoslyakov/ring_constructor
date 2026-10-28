import{E as f,Ea as V,Fa as z,I as P,J as j,K as U,O as T,Y as E,aa as B,r as A,ya as H}from"./chunk-267KOXW7.js";var g=class S extends B{constructor(b,i={}){super(b),this.isReflector=!0,this.type="Reflector",this.forceUpdate=!1,this._reflectionCameras=new WeakMap;let t=this,C=i.color!==void 0?new T(i.color):new T(8355711),d=i.textureWidth||512,F=i.textureHeight||512,y=i.clipBias||0,u=i.shader||S.ReflectorShader,W=i.multisample!==void 0?i.multisample:4,o=new E,l=new f,m=new f,_=new f,p=new U,M=new f(0,0,-1),n=new P,x=new f,w=new f,s=new P,h=new U,D=new j(d,F,{samples:W,type:A}),R=new z({name:u.name!==void 0?u.name:"unspecified",uniforms:V.clone(u.uniforms),fragmentShader:u.fragmentShader,vertexShader:u.vertexShader});R.uniforms.tDiffuse.value=D.texture,R.uniforms.color.value=C,R.uniforms.textureMatrix.value=h,this.material=R,this.onBeforeRender=function(e,v,c){let a=this.getReflectionCamera(c);if(m.setFromMatrixPosition(t.matrixWorld),_.setFromMatrixPosition(c.matrixWorld),p.extractRotation(t.matrixWorld),l.set(0,0,1),l.applyMatrix4(p),x.subVectors(m,_),x.dot(l)>0===!0&&this.forceUpdate===!1)return;x.reflect(l).negate(),x.add(m),p.extractRotation(c.matrixWorld),M.set(0,0,-1),M.applyMatrix4(p),M.add(_),w.subVectors(m,M),w.reflect(l).negate(),w.add(m),a.position.copy(x),a.up.set(0,1,0),a.up.applyMatrix4(p),a.up.reflect(l),a.lookAt(w),a.far=c.far,a.updateMatrixWorld(),a.projectionMatrix.copy(c.projectionMatrix),h.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),h.multiply(a.projectionMatrix),h.multiply(a.matrixWorldInverse),h.multiply(t.matrixWorld),o.setFromNormalAndCoplanarPoint(l,m),o.applyMatrix4(a.matrixWorldInverse),n.set(o.normal.x,o.normal.y,o.normal.z,o.constant);let r=a.projectionMatrix;a.isOrthographicCamera?(s.x=(Math.sign(n.x)+r.elements[8])/r.elements[0],s.y=(Math.sign(n.y)+r.elements[9])/r.elements[5],s.z=-c.far,s.w=1):(s.x=(Math.sign(n.x)+r.elements[8])/r.elements[0],s.y=(Math.sign(n.y)+r.elements[9])/r.elements[5],s.z=-1,s.w=(1+r.elements[10])/r.elements[14]),n.multiplyScalar(2/n.dot(s)),r.elements[2]=n.x,r.elements[6]=n.y,a.isOrthographicCamera?(r.elements[10]=n.z-y,r.elements[14]=n.w-1):(r.elements[10]=n.z+1-y,r.elements[14]=n.w),t.visible=!1;let k=e.getRenderTarget(),I=e.xr.enabled,G=e.shadowMap.autoUpdate;e.xr.enabled=!1,e.shadowMap.autoUpdate=!1,e.setRenderTarget(D),e.state.buffers.depth.setMask(!0),e.autoClear===!1&&e.clear(),e.render(v,a),e.xr.enabled=I,e.shadowMap.autoUpdate=G,e.setRenderTarget(k);let O=c.viewport;O!==void 0&&e.state.viewport(O),t.visible=!0,this.forceUpdate=!1},this.getRenderTarget=function(){return D},this.dispose=function(){D.dispose(),t.material.dispose()},this.getReflectionCamera=function(e){let v=this._reflectionCameras.get(e);return v===void 0&&(v=e.clone(),this._reflectionCameras.set(e,v)),v}}};g.ReflectorShader={name:"ReflectorShader",uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null}},vertexShader:`
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

		}`};function K(S,{compact:b=!1,exclude:i=[]}={}){let t=new g(new H(14,12),{textureWidth:b?640:1024,textureHeight:b?640:1024,clipBias:.002,multisample:0,shader:{name:"OriginSatinReflection",uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null},uStrength:{value:.2}},vertexShader:`uniform mat4 textureMatrix;varying vec4 vReflection;varying vec2 vFloor;
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
    }`}});t.rotation.x=-Math.PI/2,t.position.y=-1.65,t.material.transparent=!0,t.material.depthWrite=!1,t.renderOrder=3;let C=t.onBeforeRender;return t.onBeforeRender=function(d,F,y){let u=d.getClearAlpha(),W=i.map(o=>o.visible);i.forEach(o=>{o.visible=!1}),d.setClearAlpha(0);try{C.call(this,d,F,y)}finally{d.setClearAlpha(u),i.forEach((o,l)=>{o.visible=W[l]})}},S.add(t),t}export{K as a};
