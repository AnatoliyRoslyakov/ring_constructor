import { createJewelScene } from './jewel-scene.js';

const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t)};

export function createViewer(canvas,{reduced=false}={}){
 const scene=createJewelScene(canvas,{center:true,live:true});scene.setInspect(true);
 const controls=document.createElement('div');controls.className='viewer-ui';
 controls.innerHTML=`<div class="viewer-toolbar" role="group" aria-label="Масштаб просмотра"><button data-view="ring" aria-pressed="true">Кольцо</button><button data-view="macro" aria-pressed="false">Макро граней</button></div><label class="viewer-light">Направление света<input type="range" min="-100" max="100" value="0" aria-label="Направление света"><span>−<i></i>+</span></label><div class="viewer-hotspots" hidden><button aria-label="Площадка бриллианта" data-spot="0">1</button><button aria-label="Корона бриллианта" data-spot="1">2</button><button aria-label="Рундист бриллианта" data-spot="2">3</button></div><p class="viewer-explanation" role="status" hidden></p><span class="viewer-instruction">Поверните кольцо мышью или стрелками</span>`;
 const descriptions=[['Площадка','Верхняя грань открывает взгляд внутрь камня. Перемещайте свет, чтобы увидеть смену отражений.'],['Корона','Наклонные грани над рундистом направляют свет и раскрывают его игру.'],['Рундист','Тонкий пояс соединяет корону и павильон. За него камень удерживается в оправе.']];
 const lights=controls.querySelector('input'),hotspots=controls.querySelector('.viewer-hotspots'),explanation=controls.querySelector('.viewer-explanation');
 const heroControls=document.createElement('div');heroControls.className='hero-orbit-controls';heroControls.inert=true;
 heroControls.innerHTML='<span id="hero-orbit-description">Потяните кольцо, чтобы повернуть <span aria-hidden="true">↔</span></span><button type="button" aria-label="Остановить анимацию" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="orbit-pause" d="M9 6v12M15 6v12"/><path class="orbit-play" d="m9 6 9 6-9 6Z"/></svg></button>';
 const pauseButton=heroControls.querySelector('button');
 let host,dirty=true,active=false,drag=null,view='ring',light=0,mode='inspect',design={finish:'mirror',stone:'classic'};
 let lastTime=0,elapsed=0,entrance=0,lastProgress=-1,lastOpacity=-1,paused=reduced,heroEnabled=false,contextLost=false;
 const orbit={x:0,y:0,targetX:0,targetY:0,vx:0,vy:0};
 const motion={x:0,y:0,z:0,float:0,lift:0,light:0,scale:1,offsetY:0,offsetX:0};
 canvas.tabIndex=0;canvas.setAttribute('aria-label','Трёхмерное кольцо. Поворот стрелками. Клавиша Home возвращает исходный ракурс.');
 function invalidate(){dirty=true;}
 function resize(){if(host&&host.clientWidth&&host.clientHeight){scene.resize(host.clientWidth,host.clientHeight);invalidate();}}
 const observer=new ResizeObserver(resize);
 function release(){
  if(drag&&canvas.hasPointerCapture(drag.id))canvas.releasePointerCapture(drag.id);
  if(drag&&mode==='hero'){const turns=Math.round(orbit.targetY/(Math.PI*2))*Math.PI*2;orbit.targetY-=turns;orbit.y-=turns;}
  drag=null;host?.classList.remove('is-orbiting');
 }
 function resetOrbit(){orbit.x=orbit.y=orbit.targetX=orbit.targetY=orbit.vx=orbit.vy=0;release();}
 function showHero(opacity,interactive){
  if(lastOpacity!==opacity){host.style.setProperty('--hero-opacity',String(opacity));lastOpacity=opacity;}
  host.classList.toggle('hero-ready',opacity>0);
  if(heroEnabled!==interactive){heroEnabled=interactive;host.classList.toggle('hero-interactive',interactive);heroControls.inert=!interactive;canvas.tabIndex=interactive?0:-1;if(!interactive)release();}
 }
 function togglePause(){paused=!paused;pauseButton.setAttribute('aria-pressed',String(paused));pauseButton.setAttribute('aria-label',paused?'Включить анимацию':'Остановить анимацию');invalidate();}
 pauseButton.addEventListener('click',togglePause);
 function mount(target,hero){
  release();observer.disconnect();host=target;mode=hero?'hero':'inspect';
  host.insertBefore(canvas,host.querySelector('.stage-atmosphere'));host.append(controls,heroControls);observer.observe(host);host.classList.add('viewer-host');host.classList.remove('is-macro');
  scene.setPresentation(mode);scene.setInspect(!hero);view='ring';active=true;lastTime=0;lastOpacity=-1;entrance=0;heroEnabled=false;
  resetOrbit();scene.setDesign(hero?{finish:'mirror',stone:'classic'}:design);canvas.tabIndex=hero?-1:0;
  canvas.setAttribute('aria-label',hero?'Кольцо из белого золота. Поворот мышью или стрелками. Пробел — пауза, Home — исходный ракурс.':'Трёхмерное кольцо. Поворот стрелками. Клавиша Home возвращает исходный ракурс.');
  if(hero)canvas.setAttribute('aria-describedby','hero-orbit-description');else canvas.removeAttribute('aria-describedby');
  controls.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view==='ring')));hotspots.hidden=explanation.hidden=true;
  host.classList.remove('hero-ready','hero-interactive');heroControls.inert=true;resize();
 }
 controls.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
  view=button.dataset.view;scene.setView(view);controls.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));hotspots.hidden=view!=='macro';explanation.hidden=true;host.classList.toggle('is-macro',view==='macro');invalidate();
 }));
 controls.querySelectorAll('[data-spot]').forEach(button=>button.addEventListener('click',()=>{const [title,text]=descriptions[Number(button.dataset.spot)];explanation.replaceChildren();const strong=document.createElement('strong');strong.textContent=title;explanation.append(strong,document.createTextNode(text));explanation.hidden=false;}));
 lights.addEventListener('input',()=>{light=Number(lights.value)/100;scene.setLight(light);invalidate();});
 canvas.addEventListener('pointerdown',event=>{
  if(!active||(event.pointerType==='mouse'&&event.button!==0))return;
  if(mode==='hero'&&(!heroEnabled||!scene.containsPoint(event.clientX,event.clientY)))return;
  drag={x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,id:event.pointerId,time:event.timeStamp,pending:mode==='hero'&&event.pointerType==='touch'};
  orbit.vx=orbit.vy=0;
  if(!drag.pending){event.preventDefault();canvas.setPointerCapture(event.pointerId);canvas.focus({preventScroll:true});host.classList.add('is-orbiting');}
 });
 canvas.addEventListener('pointermove',event=>{
  if(!active)return;
  if(drag){
   if(event.pointerId!==drag.id)return;
   if(drag.pending){
    const dx=event.clientX-drag.startX,dy=event.clientY-drag.startY;
    if(Math.hypot(dx,dy)<7)return;
    if(Math.abs(dy)>Math.abs(dx)){release();return;}
    drag.pending=false;canvas.setPointerCapture(event.pointerId);host.classList.add('is-orbiting');
   }
   const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
   if(mode==='hero'){
    const dt=Math.max(.008,(event.timeStamp-drag.time)/1000);
    orbit.targetY+=dx*.007;orbit.targetX=clamp(orbit.targetX+dy*.005,-.62,.62);
    orbit.vy=clamp(dx*.007/dt,-2,2);orbit.vx=clamp(dy*.005/dt,-1,1);
   }else scene.rotate(dx,dy);
   drag.x=event.clientX;drag.y=event.clientY;drag.time=event.timeStamp;invalidate();
  }
  else if(view==='macro'&&event.pointerType==='mouse'){const rect=canvas.getBoundingClientRect();light=(event.clientX-rect.left)/rect.width*2-1;lights.value=String(Math.round(light*100));scene.setLight(light,-((event.clientY-rect.top)/rect.height*2-1));invalidate();}
 });
 canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',()=>{orbit.vx=orbit.vy=0;release()});canvas.addEventListener('lostpointercapture',release);
 canvas.addEventListener('keydown',event=>{
  const moves={ArrowLeft:[-18,0],ArrowRight:[18,0],ArrowUp:[0,-15],ArrowDown:[0,15]};
  if(moves[event.key]){event.preventDefault();if(mode==='hero'){orbit.targetY+=moves[event.key][0]*.008;orbit.targetX=clamp(orbit.targetX+moves[event.key][1]*.006,-.62,.62)}else scene.rotate(...moves[event.key]);invalidate();}
  if(event.key==='Home'){event.preventDefault();if(mode==='hero'){resetOrbit();elapsed=0}else scene.setInspect(true);invalidate();}
  if(event.code==='Space'&&mode==='hero'){event.preventDefault();togglePause();}
 });
 canvas.addEventListener('webglcontextlost',()=>{contextLost=true;if(mode==='hero')showHero(0,false)});
 canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;lastTime=0;entrance=0;invalidate()});
 document.addEventListener('visibilitychange',()=>{lastTime=0;release()});
 return {
  mount(target){mount(target,false)},
  mountHero(target){mount(target,true)},
  setActive(value){active=value;lastTime=0;if(!value)release();else invalidate();},
  setDesign(value){design={...value};if(mode!=='hero')scene.setDesign(design);invalidate();},
  resize,
  tick(time,story){
   if(!active||contextLost||document.hidden||!host?.isConnected)return;
   if(mode==='hero'){
    const p=story?.progress||0;
    if(story?.suspended||p>=.17){showHero(0,false);lastTime=0;entrance=0;resetOrbit();return;}
    const dt=lastTime?Math.min(.05,(time-lastTime)/1000):0;lastTime=time;entrance=Math.min(1,entrance+dt/.8);
    // Reveal an aligned frame first; only then introduce free motion and framing.
    const weight=(1-smooth(.004,.075,p))*smooth(.45,1,entrance),blend=story?.filmReady?smooth(.11,.16,Math.min(p,story.filmProgress+.002)):0;
    const opacity=Number((smooth(0,.45,entrance)*(1-blend)).toFixed(3));
    showHero(opacity,p<.055&&opacity>.98);
    if(!paused)elapsed+=dt;
    if(!drag){orbit.targetX=clamp(orbit.targetX+orbit.vx*dt,-.62,.62);orbit.targetY+=orbit.vy*dt;orbit.vx*=Math.exp(-6*dt);orbit.vy*=Math.exp(-6*dt);}
    const follow=1-Math.exp(-14*dt);orbit.x+=(orbit.targetX-orbit.x)*follow;orbit.y+=(orbit.targetY-orbit.y)*follow;
    if(!weight)resetOrbit();
    const phase=elapsed/12%1,angle=phase*Math.PI*2;
    motion.x=(orbit.x+Math.sin(angle)*.035)*weight;motion.y=(orbit.y+Math.sin(angle)*.28)*weight;motion.z=Math.sin(angle*2)*.018*weight;
    const mobile=host.clientWidth<=700;
    motion.float=Math.sin(angle)*.035*weight;motion.lift=(mobile?.24:.32)*smooth(.16,.39,phase)*(1-smooth(.60,.86,phase))*weight;motion.light=Math.sin(angle)*.13*weight;
    const compact=mobile?0:clamp((1.6-host.clientWidth/host.clientHeight)/.5,0,1);
    motion.scale=1-(mobile?.20:compact*.12)*weight;motion.offsetY=(mobile?-.10:0)*weight;motion.offsetX=-compact*.22*weight;
    const renderProgress=blend>0?story.filmProgress:p;
    const moving=Math.abs(orbit.vx)+Math.abs(orbit.vy)+Math.abs(orbit.x-orbit.targetX)+Math.abs(orbit.y-orbit.targetY)>.0001;
    if(!paused||dirty||moving||renderProgress!==lastProgress||entrance<1)scene.render(renderProgress,time/1000,{x:0,y:0},motion);
    lastProgress=renderProgress;dirty=false;return;
   }
   if(!dirty)return;scene.render(0,time/1000);if(view==='macro'){const positions=scene.getHotspots();controls.querySelectorAll('[data-spot]').forEach((button,index)=>{const p=positions[index];button.hidden=!p.visible;button.style.transform=`translate3d(${p.x}px,${p.y}px,0)`;});}dirty=false;
  },
  dispose(){observer.disconnect();scene.dispose();controls.remove();heroControls.remove();}
 };
}
