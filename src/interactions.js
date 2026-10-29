import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function setupInteractions({reduced=false}={}){
 const fine=matchMedia('(hover: hover) and (pointer: fine)');
 const dock=document.createElement('button');dock.type='button';dock.className='design-cta design-dock';dock.dataset.openDesign='';dock.inert=true;dock.setAttribute('aria-hidden','true');
 dock.innerHTML='<span class="cta-label"><small>Личный 3D-эскиз</small><span>Создать своё кольцо</span></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';document.body.append(dock);
 const objects=['ring-white','ring-gold','diamond','ring-rose','sapphire','emerald','ruby'];
 let openBurst=null;
 const revealBurst=button=>{if(reduced||!fine.matches)return;openBurst?.classList.remove('is-burst-open');openBurst=button;button.classList.add('is-burst-open');};
 const hideBurst=button=>{if(openBurst===button){button.classList.remove('is-burst-open');openBurst=null;}};
 for(const button of document.querySelectorAll('.design-cta')){
  const burst=document.createElement('span');burst.className='jewel-burst';burst.setAttribute('aria-hidden','true');
  objects.forEach((name,i)=>{const img=document.createElement('img');img.src=`assets/cta-${name}.webp`;img.alt='';img.width=360;img.height=420;img.decoding='async';img.style.setProperty('--delay',`${i*.035}s`);burst.append(img);});button.append(burst);
  button.addEventListener('pointerenter',()=>revealBurst(button));button.addEventListener('pointerleave',()=>hideBurst(button));button.addEventListener('focus',()=>revealBurst(button));button.addEventListener('blur',()=>hideBurst(button));
 }
 let journeyGone=false,finalVisible=false;
 function updateDock(){const show=journeyGone&&!finalVisible;dock.classList.toggle('is-visible',show);dock.inert=!show;dock.setAttribute('aria-hidden',String(!show));}
 const dockObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.target.id==='journey')journeyGone=!entry.isIntersecting&&entry.boundingClientRect.bottom<=0;else finalVisible=entry.isIntersecting;}updateDock();});
 dockObserver.observe(document.querySelector('#journey'));dockObserver.observe(document.querySelector('#your-ring'));
 const cursor=document.querySelector('.jewel-cursor'),prism=document.querySelector('.stage-prism');
 let sweep;
 if(prism&&!reduced)sweep=gsap.timeline({paused:true}).fromTo(prism,{xPercent:-30,opacity:0},{xPercent:0,opacity:.85,duration:.65,ease:'power2.out'}).to(prism,{xPercent:30,opacity:0,duration:1.05,ease:'power2.inOut'});
 if(fine.matches&&!reduced&&cursor){
  const xTo=gsap.quickTo(cursor,'x',{duration:.13,ease:'power3.out'}),yTo=gsap.quickTo(cursor,'y',{duration:.13,ease:'power3.out'});
  const gem=cursor.querySelector('.cursor-gem'),caption=cursor.querySelector('.cursor-caption');
  const rotate=gsap.quickTo(gem,'rotation',{duration:.55,ease:'power3.out'});
  let shown=false,lastX=0;
  const hide=()=>{cursor.classList.add('is-hidden');document.body.classList.remove('jewel-cursor-active');shown=false;};
  document.addEventListener('pointermove',event=>{
   if(event.pointerType==='touch'||!fine.matches||event.target.closest('dialog')){hide();return;}
   if(!shown){gsap.set(cursor,{x:event.clientX,y:event.clientY,opacity:1});shown=true;lastX=event.clientX;}
   document.body.classList.add('jewel-cursor-active');cursor.classList.remove('is-hidden');xTo(event.clientX);yTo(event.clientY);
   rotate(-15+gsap.utils.clamp(-25,25,(event.clientX-lastX)*.8));lastX=event.clientX;
   const interactive=event.target.closest('a,button,summary,label,input,.holo-view,.stage.inspecting canvas,.stage.hero-interactive #jewel-canvas');
   const draggable=event.target.closest('.holo-view,.stage.inspecting canvas,.stage.hero-interactive #jewel-canvas');cursor.classList.toggle('is-interactive',!!interactive);cursor.classList.toggle('is-drag',!!draggable);caption.textContent=draggable?'Повернуть':'';
  },{passive:true});
  document.addEventListener('pointerdown',()=>{cursor.classList.add('is-down');gsap.fromTo(cursor.querySelector('.cursor-glint'),{scale:.4,opacity:1},{scale:1.8,opacity:.25,duration:.55,ease:'power2.out'});});
  const release=()=>cursor.classList.remove('is-down');document.addEventListener('pointerup',release);document.addEventListener('pointercancel',release);
  document.addEventListener('pointerout',event=>{if(!event.relatedTarget)hide();});window.addEventListener('blur',hide);fine.addEventListener('change',()=>{if(!fine.matches)hide();});
  for(const el of document.querySelectorAll('.header-cta,.finale-button,.holo-controls button')){
   if(el.classList.contains('design-cta'))continue;
   const x=gsap.quickTo(el,'x',{duration:.42,ease:'power3.out'}),y=gsap.quickTo(el,'y',{duration:.42,ease:'power3.out'});
   el.addEventListener('pointermove',event=>{const r=el.getBoundingClientRect();x((event.clientX-r.left-r.width/2)*.09);y((event.clientY-r.top-r.height/2)*.16);});
   el.addEventListener('pointerleave',()=>{x(0);y(0);});
  }

 }
 if(!reduced){
  gsap.from('.holo-copy > *',{y:24,opacity:0,duration:1.05,stagger:.10,ease:'power3.out',scrollTrigger:{trigger:'.holographic',start:'top 72%',once:true}});
  gsap.from('.holo-annotation',{opacity:0,x:12,duration:1.3,stagger:.18,ease:'power3.out',scrollTrigger:{trigger:'.holographic',start:'top 55%',once:true}});
  gsap.fromTo('.holo-view',{y:35},{y:-25,ease:'none',scrollTrigger:{trigger:'.holographic',start:'top bottom',end:'bottom top',scrub:.8}});
  gsap.from('.editorial-copy h2',{y:32,opacity:0,duration:1.2,ease:'power3.out',scrollTrigger:{trigger:'.editorial-copy',start:'top 75%',once:true}});
  gsap.from('.finale h2',{y:38,opacity:0,duration:1.25,ease:'power3.out',scrollTrigger:{trigger:'.finale',start:'top 65%',once:true}});
 }
 return {chapterChanged(){if(sweep)sweep.restart();}};
}
