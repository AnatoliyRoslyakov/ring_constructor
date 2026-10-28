import { createJewelScene } from './jewel-scene.js';
import { createCraftScenes } from './craft-scenes.js';
import { FILM_FRAMES, FILM_FPS, FILM_LAST_FRAME } from './story-film.js';
export async function setupPromoSprites(canvas){
 const panel=document.querySelector('.studio-panel');panel.hidden=false;panel.innerHTML='<button>Подготовить 3D-миниатюры</button><output>Готово к рендеру</output>';
 const {createRingStudio}=await import('./parametric-ring.js'),{defaults}=await import('./ring-design.js');
 const studio=createRingStudio(canvas,{reduced:true});
 panel.querySelector('button').addEventListener('click',async()=>{
  const button=panel.querySelector('button'),output=panel.querySelector('output');button.disabled=true;
  const variants=[
   {metal:'white',gem:'diamond',shape:'round'},
   {metal:'yellow',gem:'diamond',shape:'oval',shank:'split',prongs:4,prongStyle:'claw'},
   {metal:'rose',gem:'sapphire',shape:'cushion',shank:'tapered',prongs:4},
   {gem:'diamond',shape:'round',component:'stone'},
   {gem:'sapphire',shape:'oval',component:'stone'},
   {gem:'emerald',shape:'emerald',component:'stone'},
   {gem:'ruby',shape:'pear',component:'stone'}
  ];
  try{for(let i=0;i<variants.length;i++){
   studio.setDesign({...defaults,...variants[i]});studio.resize(360,420);studio.setView('perspective');
   const url=studio.snapshot({transparent:true,component:variants[i].component||'ring'}),binary=atob(url.split(',')[1]),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
   const response=await fetch(`/__studio/frame/${String(900+i).padStart(4,'0')}`,{method:'POST',body:new Blob([bytes],{type:'image/png'})});if(!response.ok)throw new Error('Не удалось сохранить миниатюру');
   output.textContent=`${i+1} / ${variants.length}`;await new Promise(requestAnimationFrame);
  }output.textContent='Миниатюры готовы';}catch(error){output.textContent=error.message;console.error(error);}finally{button.disabled=false;}
 });
 return {render(){},resize(){}};
}
export async function setupStudio(canvas){
 const jewel=createJewelScene(canvas,{craft:true,craftFactory:createCraftScenes});await jewel.ready;
 let rendering=false;const panel=document.querySelector('.studio-panel');panel.hidden=false;panel.querySelectorAll('button').forEach(b=>b.disabled=false);
 const params=new URLSearchParams(location.search);
 const firstFrame=Math.max(0,Math.min(FILM_LAST_FRAME,Number(params.get('from'))||0));
 const lastFrame=params.has('to')?Math.max(firstFrame,Math.min(FILM_LAST_FRAME,Number(params.get('to'))||0)):FILM_LAST_FRAME;
 panel.querySelector('progress').max=FILM_FRAMES;
 for(const button of panel.querySelectorAll('button'))button.addEventListener('click',async()=>{
  if(rendering)return;rendering=true;panel.querySelectorAll('button').forEach(b=>b.disabled=true);
  const portrait=button.dataset.profile==='portrait',width=portrait?720:1600,height=portrait?1280:1000;
  const status=panel.querySelector('output'),progress=panel.querySelector('progress');
  try{
   jewel.resize(width,height,portrait?'portrait':true);jewel.setInspect(false);jewel.setDesign({finish:'mirror',stone:'classic'});
   for(let i=firstFrame;i<=lastFrame;i++){
    jewel.render(i/FILM_LAST_FRAME,i/FILM_FPS,{x:0,y:0});const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.96));
    if(!blob)throw new Error('Frame unavailable');const response=await fetch(`/__studio/frame/${String(i).padStart(4,'0')}?profile=${portrait?'portrait':'desktop'}`,{method:'POST',body:blob});if(!response.ok)throw new Error('Frame write failed');progress.value=i+1;status.textContent=`${i+1} / ${FILM_FRAMES} — ${portrait?'portrait':'desktop'}`;if(i%4===0)await new Promise(resolve=>setTimeout(resolve,0));
   }
   status.textContent=`RENDER COMPLETE — ${portrait?'720 × 1280':'1600 × 1000'} / ${lastFrame-firstFrame+1} frames`;
  }catch(error){status.textContent=error.message;console.error(error);}
  finally{rendering=false;jewel.resize();panel.querySelectorAll('button').forEach(b=>b.disabled=false);}
 });
 return {render(p,time,pointer){if(!rendering)jewel.render(p,time,pointer)},resize(){if(!rendering)jewel.resize()}};
}
