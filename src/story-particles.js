// A single lightweight layer, driven by the landing's existing animation ticker.
export function setupStoryParticles(stage,{disabled=false}={}){
 if(disabled)return {update(){},resize(){}};
 const canvas=document.createElement('canvas');canvas.className='journey-particles';canvas.setAttribute('aria-hidden','true');stage.append(canvas);
 const ctx=canvas.getContext('2d',{alpha:true});
 if(!ctx){canvas.remove();return {update(){},resize(){}};}
 let width=0,height=0,visible=true,lastTime=0,elapsed=0,parallaxX=0,parallaxY=0,shown=true;
 const particles=Array.from({length:76},(_,i)=>({x:Math.random(),y:Math.random(),depth:.25+Math.random()*.75,size:.55+Math.random()*1.15,phase:Math.random()*Math.PI*2,speed:.5+Math.random(),star:i<9}));
 function sprite(star){
  const image=document.createElement('canvas');image.width=image.height=star?64:20;
  const c=image.getContext('2d'),r=image.width/2;
  const halo=c.createRadialGradient(r,r,0,r,r,r);halo.addColorStop(0,'rgba(255,248,224,.9)');halo.addColorStop(.12,'rgba(243,230,201,.45)');halo.addColorStop(1,'rgba(226,214,185,0)');c.fillStyle=halo;c.fillRect(0,0,r*2,r*2);
  if(star){c.fillStyle='#fff9e8';c.beginPath();c.moveTo(r,5);c.quadraticCurveTo(r+1,r-2,r*2-5,r);c.quadraticCurveTo(r+2,r+1,r,r*2-5);c.quadraticCurveTo(r-1,r+2,5,r);c.quadraticCurveTo(r-2,r-1,r,5);c.fill();}
  return image;
 }
 const dust=sprite(false),star=sprite(true);
 function resize(){
  width=stage.clientWidth;height=stage.clientHeight;
  const dpr=Math.min(devicePixelRatio||1,1.25,1440/Math.max(1,width));
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
 }
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;lastTime=0;},{threshold:0});observer.observe(stage.parentElement);
 resize();
 return {
  resize,
  update(time,progress,pointer,enabled=true){
   if(enabled!==shown){canvas.style.visibility=enabled?'visible':'hidden';shown=enabled;}
   if(!enabled||!visible){lastTime=0;return;}
   const dt=lastTime?Math.min((time-lastTime)/1000,.05):0;lastTime=time;elapsed+=dt;
   const follow=1-Math.exp(-dt*2);parallaxX+=(pointer.x-parallaxX)*follow;parallaxY+=(pointer.y-parallaxY)*follow;
   ctx.clearRect(0,0,width,height);
   const mobile=width<=700,count=mobile?34:particles.length;
   for(let i=0;i<count;i++){
    const p=particles[i],isStar=p.star&&(!mobile||i<4);
    const x=((p.x*width+Math.sin(elapsed*.12+p.phase)*16*p.depth+parallaxX*8*p.depth+width)%width);
    const y=((p.y*(height+60)-elapsed*p.speed*4*p.depth-progress*height*.22*p.depth+parallaxY*5*p.depth)%(height+60)+(height+60))%(height+60)-30;
    // Keep particles quiet behind the copy, and away from the navigation.
    const textFade=mobile?(y>height*.55?.32:1):(x<width*.48?.3:1);
    const edgeFade=Math.min(1,Math.max(0,(y-85)/100),Math.max(0,(height-y)/85));
    const pulse=isStar?Math.pow(Math.max(0,Math.sin(elapsed*.65*p.speed+p.phase)),12):.65+.35*Math.sin(elapsed*.35+p.phase);
    ctx.globalAlpha=(isStar?.48:.24)*pulse*textFade*edgeFade*p.depth;
    const size=isStar?(10+p.size*5):(2+p.size*2);
    ctx.drawImage(isStar?star:dust,x-size/2,y-size/2,size,size);
   }
   ctx.globalAlpha=1;
  }
 };
}
