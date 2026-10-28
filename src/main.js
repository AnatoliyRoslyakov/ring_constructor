import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { setupInteractions } from './interactions.js';
import { setupStoryParticles } from './story-particles.js';
import { FILM_FPS, FILM_LAST_FRAME, FILM_VERSION } from './story-film.js';
gsap.registerPlugin(ScrollTrigger);ScrollTrigger.config({ignoreMobileResize:true});
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const staticStory=reduced||navigator.connection?.saveData===true;
const promoMode=new URLSearchParams(location.search).has('promo');
const studioMode=promoMode||new URLSearchParams(location.search).has('studio')||new URLSearchParams(location.search).has('live');
const mobileMedia=matchMedia('(max-width:700px)');
const $=selector=>document.querySelector(selector);
const loader=$('.loader'),canvas=$('#jewel-canvas'),film=$('#journey-film'),stage=$('.stage'),sticky=$('.journey-sticky'),journey=$('#journey');
const chapters=[...document.querySelectorAll('.chapter')],chapterPoints=chapters.map(el=>Number(el.dataset.at)),dots=[...document.querySelectorAll('.chapter-dots button')];
const chapterPaint=chapters.map(()=>({}));
const header=$('.site-header'),progress=$('.journey-progress span'),currentLabel=$('.chapter-current'),spec=$('.spec-label'),wordmark=$('.hero-wordmark');
const viewToggle=$('.view-toggle'),dialog=$('#design-dialog'),menu=$('.mobile-menu'),menuButton=$('.menu-toggle');
const finalGlint=$('.final-gem-glint');
const pointer={x:0,y:0},state={p:0};
let viewer,viewerPromise,customizer,customizerPromise,studio,hologram,holoPromise,holoReveal=reduced?1:0,inspect=false,chapterScrollDistance=0,lastIndex=-1,filmReady=false,desiredFrame=0,mediaProfile='',resizeTimer,navigationUsed=false,glintOpacity=-1;
let design={finish:'mirror',stone:'classic'};
try{design={...design,...JSON.parse(localStorage.getItem('origin-design')||'{}')}}catch{}
const interactions=setupInteractions({reduced});
const storyParticles=setupStoryParticles(stage,{disabled:staticStory||studioMode});
const lenis=new Lenis({duration:1.05,smoothWheel:!reduced,anchors:false});lenis.on('scroll',()=>{ScrollTrigger.update();updateHeader();});
let headerFill=-1;
function updateHeader(){
 header.classList.toggle('scrolled',window.scrollY>72);
 const fill=Math.min(1,Math.max(0,(window.scrollY-scroll.end)/Math.min(280,innerHeight*.35)));
 const alpha=Math.round(fill*1000)/1000;
 if(alpha!==headerFill){header.style.setProperty('--header-fill',String(alpha));headerFill=alpha;}
}
// Give the master's chapter 30% more scroll distance while preserving the other stages' pace.
const storyWeight=1.045;
function storyProgress(progress){const weighted=progress*storyWeight;return weighted<.27?weighted:weighted<.465?.27+(weighted-.27)/1.3:weighted-.045;}
function scrollProgress(progress){return(progress+Math.min(.15,Math.max(0,progress-.27))*.3)/storyWeight;}
const scroll=ScrollTrigger.create({trigger:journey,start:'top top',end:'bottom bottom',onUpdate:self=>{chapterScrollDistance=self.end-self.start;state.p=storyProgress(self.progress);updateChapters()},onRefresh:self=>{chapterScrollDistance=self.end-self.start;state.p=storyProgress(self.progress);updateChapters()}});
function setPoster(index){const picture=$('#journey-poster');picture.querySelector('source').srcset=`assets/stills/portrait-${index}.webp`;picture.querySelector('img').src=`assets/stills/desktop-${index}.webp`;}
function updateChapters(){
 let index=0;for(let i=1;i<chapterPoints.length;i++)if(state.p>(chapterPoints[i]+chapterPoints[i-1])*.5)index=i;
 chapters.forEach((el,i)=>{
  const start=i===0?-.1:(chapterPoints[i-1]+chapterPoints[i])*.5,end=i===5?1.1:(chapterPoints[i]+chapterPoints[i+1])*.5;
  let alpha=Math.min(gsap.utils.clamp(0,1,(state.p-start+.025)/.05),gsap.utils.clamp(0,1,(end+.025-state.p)/.05));
  if(staticStory)alpha=index===i?1:0;
  const distance=chapterPoints[i]-state.p,travel=Math.sign(distance)*Math.max(0,Math.abs(distance)-.012)*chapterScrollDistance/storyWeight*.48;
  const offset=staticStory?0:gsap.utils.clamp(-innerHeight*1.3,innerHeight*1.3,travel);
  const paint=chapterPaint[i],opacity=Number(alpha.toFixed(3)),y=Number(offset.toFixed(2)),visible=alpha>.001;
  if(paint.opacity!==opacity){el.style.opacity=String(opacity);paint.opacity=opacity;}
  if(paint.y!==y){el.style.transform=`translate3d(0,calc(-42% + ${y}px),0)`;paint.y=y;}
  if(paint.visible!==visible){el.style.visibility=visible?'visible':'hidden';el.style.willChange=visible?'transform, opacity':'auto';paint.visible=visible;}
 });
 if(index!==lastIndex){chapters.forEach((el,i)=>{el.classList.toggle('is-active',index===i);el.inert=index!==i;el.setAttribute('aria-hidden',String(index!==i));});interactions.chapterChanged();dots.forEach((d,i)=>{d.classList.toggle('active',index===i);d.setAttribute('aria-pressed',String(index===i))});currentLabel.textContent=String(index).padStart(2,'0');lastIndex=index;if(staticStory||!filmReady)setPoster(index);}
 progress.style.transform=`scaleY(${state.p})`;spec.style.opacity=1-gsap.utils.clamp(0,1,(state.p-.17)/.1);wordmark.style.opacity=.045*(1-gsap.utils.clamp(0,1,state.p/.2));
 desiredFrame=Math.round(state.p*FILM_LAST_FRAME);seekFilm();updateFinalGlint();
}
function updateFinalGlint(){
 const q=Math.min(state.p,film.currentTime*FILM_FPS/FILM_LAST_FRAME);
 const fade=gsap.utils.clamp(0,1,(q-.925)/.035);
 const opacity=Number((fade*.85).toFixed(3));if(opacity!==glintOpacity){finalGlint.style.opacity=String(opacity);glintOpacity=opacity;}
 if(!fade)return;
 // Project the final crystal's facet into the same camera and cover crop as the film.
 const mobile=mobileMedia.matches,worldScale=mobile?.98:1.16;
 const t=gsap.utils.clamp(0,1,(q-.965)/.033),burial=t*t*(3-2*t);
 const x=(mobile?0:1.72)+((mobile?-1.05:-1.72)+.06)*worldScale;
 const y=(mobile?1.12:0)+(-1.13-burial*.045+.14)*worldScale,z=(.90+.14)*worldScale;
 const cameraZ=mobile?10.72:9.82,cameraLength=Math.hypot(2.77,cameraZ),upY=cameraZ/cameraLength,upZ=-2.77/cameraLength;
 const depth=(2.65-y)*2.77/cameraLength+(cameraZ-z)*cameraZ/cameraLength;
 const tangent=Math.tan(34*Math.PI/360),sourceW=mobile?720:1600,sourceH=mobile?1280:1000;
 const u=.5+x/(depth*tangent*(sourceW/sourceH))*.5;
 const v=.5-((y-2.65)*upY+(z-cameraZ)*upZ)/(depth*tangent)*.5;
 const cover=Math.max(innerWidth/sourceW,innerHeight/sourceH);
 finalGlint.style.transform=`translate3d(${u*sourceW*cover+(innerWidth-sourceW*cover)/2}px,${v*sourceH*cover+(innerHeight-sourceH*cover)/2}px,0)`;
 finalGlint.style.setProperty('--glint-size',`${Math.min(22,Math.max(10,22*cover))}px`);
}
function seekFilm(){if(!filmReady||film.seeking||inspect||document.hidden)return;const target=desiredFrame/FILM_FPS;if(Math.abs(film.currentTime-target)>.5/FILM_FPS)film.currentTime=target;}
function loadFilm(){
 if(studioMode||staticStory)return;
 const profile=mobileMedia.matches?'portrait':innerWidth<=1050?'compact':'desktop';if(profile===mediaProfile)return;
 mediaProfile=profile;filmReady=false;stage.classList.remove('film-ready');setPoster(Math.max(0,lastIndex));
 // Increment the media version whenever films are regenerated: these URLs are cached immutably.
 film.src=`assets/journey${profile==='portrait'?'-portrait':profile==='compact'?'-compact':''}.mp4?v=${FILM_VERSION}`;film.load();
}
film.addEventListener('loadeddata',()=>{filmReady=true;const target=desiredFrame/FILM_FPS;if(Math.abs(film.currentTime-target)>.5/FILM_FPS){film.addEventListener('seeked',()=>stage.classList.add('film-ready'),{once:true});seekFilm();}else stage.classList.add('film-ready');});
film.addEventListener('error',()=>{filmReady=false;stage.classList.remove('film-ready');setPoster(Math.max(0,lastIndex));});
film.addEventListener('seeked',()=>{seekFilm();updateFinalGlint();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)seekFilm();});
async function ensureViewer(){if(!viewerPromise)viewerPromise=import('./viewer.js').then(({createViewer})=>{viewer=createViewer(canvas);viewer.setDesign(design);return viewer;}).catch(error=>{viewerPromise=null;console.warn('ORIGIN viewer unavailable:',error);$('.preview-status').textContent='3D-просмотр недоступен. Ваш эскиз можно сохранить.';return null;});return viewerPromise;}
async function setInspect(value){
 if(!value){inspect=false;stage.classList.remove('inspecting');sticky.classList.remove('is-inspecting');viewToggle.setAttribute('aria-pressed','false');viewToggle.querySelector('span').textContent='Рассмотреть в 3D';$('.chapter-stack').inert=false;$('.chapter-stack').removeAttribute('aria-hidden');if(!dialog.open)viewer?.setActive(false);lenis.start();return;}
 closeMenu();viewToggle.disabled=true;viewToggle.querySelector('span').textContent='Загружаем кольцо…';const instance=await ensureViewer();viewToggle.disabled=false;
 if(!instance){viewToggle.querySelector('span').textContent='3D недоступно';return;}
 inspect=true;instance.mount(stage);instance.setDesign(design);stage.classList.add('inspecting');sticky.classList.add('is-inspecting');viewToggle.setAttribute('aria-pressed','true');viewToggle.querySelector('span').textContent='Вернуться к истории';$('.chapter-stack').inert=true;$('.chapter-stack').setAttribute('aria-hidden','true');lenis.stop();
}
function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');if(!inspect&&!dialog.open)lenis.start();}
function goChapter(index){navigationUsed=true;closeMenu();if(inspect)setInspect(false);lenis.scrollTo(scroll.start+scrollProgress(chapterPoints[index]||0)*(scroll.end-scroll.start),{duration:reduced?0:1.1,force:true});}
viewToggle.addEventListener('click',()=>setInspect(!inspect));
document.querySelectorAll('[data-chapter]').forEach(el=>el.addEventListener('click',event=>{event.preventDefault();goChapter(Number(el.dataset.chapter))}));
document.querySelectorAll('a[href^="#"]:not([data-chapter])').forEach(el=>el.addEventListener('click',event=>{const target=$(el.getAttribute('href'));if(!target)return;event.preventDefault();navigationUsed=true;if(inspect)setInspect(false);closeMenu();history.replaceState(null,'',el.getAttribute('href'));lenis.scrollTo(target,{offset:-(parseFloat(getComputedStyle(target).scrollMarginTop)||0),duration:reduced?0:1.15,force:true});}));
$('[data-inspect]').addEventListener('click',()=>{navigationUsed=true;lenis.scrollTo(0,{immediate:true,force:true});setInspect(true)});
menuButton.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));if(open)lenis.stop();else lenis.start();});
document.querySelectorAll('[data-open-design]').forEach(el=>el.addEventListener('click',async()=>{
 if(inspect)setInspect(false);closeMenu();document.body.classList.add('builder-open');dialog.showModal();lenis.stop();
 try{customizerPromise ||= import('./customizer.js').then(({setupCustomizer})=>{customizer=setupCustomizer(dialog,{reduced});return customizer;});const builder=await customizerPromise;if(dialog.open)await builder.activate();}
 catch(error){customizerPromise=null;$('.builder-status').textContent='Не удалось загрузить 3D. Попробуйте открыть конструктор ещё раз.';console.error(error);}
}));
dialog.addEventListener('close',()=>{document.body.classList.remove('builder-open');customizer?.setActive(false);lenis.start();});
dialog.addEventListener('click',event=>{if(event.target.closest('.dialog-close'))dialog.close();else if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(inspect)setInspect(false);closeMenu();}});
document.addEventListener('pointermove',event=>{pointer.x=(event.clientX/innerWidth-.5)*2;pointer.y=(event.clientY/innerHeight-.5)*2;},{passive:true});
document.querySelectorAll('.detail-accordion details').forEach(detail=>detail.addEventListener('toggle',()=>{if(detail.open)document.querySelectorAll('.detail-accordion details').forEach(other=>{if(other!==detail)other.open=false;});ScrollTrigger.refresh();}));
if(!reduced){
 gsap.fromTo('.editorial-image img',{scale:1.1,yPercent:-4},{scale:1,yPercent:4,ease:'none',scrollTrigger:{trigger:'.editorial',start:'top bottom',end:'bottom top',scrub:1}});
 gsap.fromTo('.reading-text',{opacity:.85},{opacity:1,ease:'none',scrollTrigger:{trigger:'.philosophy',start:'top 80%',end:'center 60%',scrub:true}});
 ScrollTrigger.create({trigger:'.holo-view',start:'top 80%',end:'top 15%',onUpdate:self=>{holoReveal=self.progress;hologram?.setReveal(holoReveal);},onRefresh:self=>{holoReveal=self.progress;hologram?.setReveal(holoReveal);}});
}
const holoObserver=new IntersectionObserver(entries=>{if(!entries.some(e=>e.isIntersecting)||holoPromise)return;holoPromise=import('./hologram.js').then(({setupHologram})=>{hologram=setupHologram($('.holographic'),{reduced});hologram.setReveal(holoReveal);holoObserver.disconnect();}).catch(error=>{console.warn('ORIGIN light study unavailable:',error);$('.holographic').classList.add('holo-fallback');});},{rootMargin:'250px'});holoObserver.observe($('.holographic'));
if(studioMode){document.body.classList.add('studio-mode');import('./studio.js').then(async({setupStudio,setupPromoSprites})=>{studio=await (promoMode?setupPromoSprites:setupStudio)(canvas);});}
function frame(time){if(document.hidden)return;lenis.raf(time);storyParticles.update(time,state.p,pointer,!inspect&&!dialog.open);hologram?.update(time);if(inspect)viewer?.tick(time);if(dialog.open)customizer?.tick(time);if(studio)studio.render(state.p,time/1000,pointer);}
gsap.ticker.lagSmoothing(0);gsap.ticker.add(time=>frame(time*1000));
let lastWidth=innerWidth;
addEventListener('resize',()=>{storyParticles.resize();viewer?.resize();customizer?.resize();studio?.resize();clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{const widthChanged=lastWidth!==innerWidth;lastWidth=innerWidth;if(widthChanged||!mobileMedia.matches){lenis.resize();ScrollTrigger.refresh();updateHeader();}if(widthChanged)loadFilm();},180);});
mobileMedia.addEventListener('change',()=>{loadFilm();if(staticStory)setPoster(Math.max(0,lastIndex));});
updateChapters();updateHeader();loadFilm();
Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,1200))]).then(()=>{lenis.resize();ScrollTrigger.refresh();if(location.hash&&!navigationUsed){const target=$(location.hash);if(target)lenis.scrollTo(target,{offset:-(parseFloat(getComputedStyle(target).scrollMarginTop)||0),immediate:true,force:true});}loader.classList.add('loaded');if(!reduced)gsap.fromTo('.site-header',{y:-12,opacity:0},{y:0,opacity:1,duration:.8,ease:'power2.out'});});
