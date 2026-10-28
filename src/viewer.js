import { createJewelScene } from './jewel-scene.js';

export function createViewer(canvas){
 const scene=createJewelScene(canvas,{center:true});scene.setInspect(true);
 const controls=document.createElement('div');controls.className='viewer-ui';
 controls.innerHTML=`<div class="viewer-toolbar" role="group" aria-label="Масштаб просмотра"><button data-view="ring" aria-pressed="true">Кольцо</button><button data-view="macro" aria-pressed="false">Макро граней</button></div><label class="viewer-light">Направление света<input type="range" min="-100" max="100" value="0" aria-label="Направление света"><span>−<i></i>+</span></label><div class="viewer-hotspots" hidden><button aria-label="Площадка бриллианта" data-spot="0">1</button><button aria-label="Корона бриллианта" data-spot="1">2</button><button aria-label="Рундист бриллианта" data-spot="2">3</button></div><p class="viewer-explanation" role="status" hidden></p><span class="viewer-instruction">Поверните кольцо мышью или стрелками</span>`;
 const descriptions=[['Площадка','Верхняя грань открывает взгляд внутрь камня. Перемещайте свет, чтобы увидеть смену отражений.'],['Корона','Наклонные грани над рундистом направляют свет и раскрывают его игру.'],['Рундист','Тонкий пояс соединяет корону и павильон. За него камень удерживается в оправе.']];
 const lights=controls.querySelector('input'),hotspots=controls.querySelector('.viewer-hotspots'),explanation=controls.querySelector('.viewer-explanation');
 let host,dirty=true,active=false,drag=null,view='ring',light=0,design={finish:'mirror',stone:'classic'};
 canvas.tabIndex=0;canvas.setAttribute('aria-label','Трёхмерное кольцо. Поворот стрелками. Клавиша Home возвращает исходный ракурс.');
 function invalidate(){dirty=true;}
 function resize(){if(host&&host.clientWidth&&host.clientHeight){scene.resize(host.clientWidth,host.clientHeight);invalidate();}}
 const observer=new ResizeObserver(resize);
 controls.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
  view=button.dataset.view;scene.setView(view);controls.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));hotspots.hidden=view!=='macro';explanation.hidden=true;host.classList.toggle('is-macro',view==='macro');invalidate();
 }));
 controls.querySelectorAll('[data-spot]').forEach(button=>button.addEventListener('click',()=>{const [title,text]=descriptions[Number(button.dataset.spot)];explanation.replaceChildren();const strong=document.createElement('strong');strong.textContent=title;explanation.append(strong,document.createTextNode(text));explanation.hidden=false;}));
 lights.addEventListener('input',()=>{light=Number(lights.value)/100;scene.setLight(light);invalidate();});
 canvas.addEventListener('pointerdown',event=>{if(event.pointerType==='mouse'&&event.button!==0)return;drag={x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);});
 canvas.addEventListener('pointermove',event=>{
  if(!active)return;
  if(drag){scene.rotate(event.clientX-drag.x,event.clientY-drag.y);drag={x:event.clientX,y:event.clientY};invalidate();}
  else if(view==='macro'&&event.pointerType==='mouse'){const rect=canvas.getBoundingClientRect();light=(event.clientX-rect.left)/rect.width*2-1;lights.value=String(Math.round(light*100));scene.setLight(light,-((event.clientY-rect.top)/rect.height*2-1));invalidate();}
 });
 const release=()=>{drag=null;};canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
 canvas.addEventListener('keydown',event=>{const moves={ArrowLeft:[-18,0],ArrowRight:[18,0],ArrowUp:[0,-15],ArrowDown:[0,15]};if(moves[event.key]){event.preventDefault();scene.rotate(...moves[event.key]);invalidate();}if(event.key==='Home'){event.preventDefault();scene.setInspect(true);invalidate();}});
 return {
  mount(target){observer.disconnect();host=target;host.append(canvas,controls);observer.observe(host);host.classList.add('viewer-host');host.classList.toggle('is-macro',view==='macro');active=true;resize();},
  setActive(value){active=value;if(value)invalidate();},
  setDesign(value){design={...value};scene.setDesign(design);invalidate();},
  resize,
  tick(time){if(!active||!dirty||document.hidden||!host?.isConnected)return;scene.render(0,time/1000);if(view==='macro'){const positions=scene.getHotspots();controls.querySelectorAll('[data-spot]').forEach((button,index)=>{const p=positions[index];button.hidden=!p.visible;button.style.transform=`translate3d(${p.x}px,${p.y}px,0)`;});}dirty=false;},
  dispose(){observer.disconnect();scene.dispose();controls.remove();}
 };
}
