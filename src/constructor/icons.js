import {gems} from './catalog.js';
const path=d=>`<path d="${d}"/>`;
const circle=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}"/>`;
const diamonds=(r,n=12,cy=24)=>Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2;return circle((24+Math.cos(a)*r).toFixed(2),(cy+Math.sin(a)*r).toFixed(2),1.5);}).join('');
function symbol(group,value){
 if(group==='halo'){
  if(value==='hidden')return path('M13 8H35L40 15 24 31 8 15ZM8 15H40M17 15 24 31 31 15M17 32 14 41M31 32 34 41')+`<ellipse cx="24" cy="30" rx="13" ry="4" stroke-dasharray="2 3"/>`;
  return circle(24,24,value==='double'?7:10)+path(value==='double'?'M20 20 28 28M28 20 20 28':'M18 18 30 30M30 18 18 30')+(value==='none'?'':diamonds(value==='double'?13:17))+(value==='double'?diamonds(20,18):'');
 }
 if(group==='orientation')return `<path opacity=".3" d="M15 44V14C15 2 33 2 33 14V44M11 30H37"/>`+`<ellipse cx="24" cy="25" rx="${value==='north'?7:15}" ry="${value==='north'?15:7}"/>`+path(value==='north'?'M24 15V35M21 18 24 15 27 18':'M13 25H35M32 22 35 25 32 28');
 if(group==='paveRows')return path('M7 8H41V40H7Z')+Array.from({length:Number(value)},(_,j)=>Array.from({length:4},(_,i)=>circle(24+(j-(Number(value)-1)/2)*9,12+i*8,2.4)).join('')).join('');
 if(group==='pave')return `<ellipse cx="24" cy="25" rx="17" ry="18"/>`+(value==='none'?path('M12 36Q24 46 36 36'):Array.from({length:value==='full'?18:10},(_,i)=>{const a=value==='full'?i/18*Math.PI*2:Math.PI+(i+.5)/10*Math.PI;return circle((24+Math.cos(a)*17).toFixed(2),(25+Math.sin(a)*18).toFixed(2),2);}).join(''));
 if(group==='setting'){
  const gem=path('M15 9H33L37 15 24 28 11 15ZM11 15H37');
  const detail={prongs:'M10 12 15 34H33L38 12M15 34 24 40 33 34',bezel:'M9 11H39V20L24 33 9 20ZM13 32 13 39H35V32',halfbezel:'M8 12V20L17 29M40 12V20L31 29M17 32H31V40H17',tulip:'M10 13Q8 34 24 39Q40 34 38 13M16 15Q13 29 24 39Q35 29 32 15',basket:'M10 13 15 36H33L38 13M13 25H35M18 16 20 36M30 16 28 36',tension:'M4 38 12 17M44 38 36 17M4 42 14 22M44 42 34 22',compass:'M24 5V12M7 15H14M34 15H41M24 25V33M17 35H31V41H17',crown:'M10 15 15 35H33L38 15M15 35 19 23 24 35 29 23 33 35M15 40H33'};
  return gem+path(detail[value]||detail.prongs);
 }
 if(group==='prongStyle')return path({round:'M19 40V17Q19 9 24 9Q29 9 29 17V40M19 19H29',claw:'M18 40 20 21Q21 12 30 7L28 24 30 40',v:'M14 40V22L9 11 16 9 24 20 32 9 39 11 34 22V40',double:'M13 40V16Q13 8 18 8Q23 8 23 16V40M27 40V16Q27 8 32 8Q37 8 37 16V40'}[value]);
 if(group==='sideStones')return circle(24,24,9)+(value==='none'?path('M6 24H12M36 24H42'):value==='pair'?circle(8,24,5)+circle(40,24,5):value==='trio'?[circle(9,24,4),circle(2,24,2),circle(39,24,4),circle(46,24,2)].join(''):[circle(9,20,3),circle(9,28,3),circle(3,24,2),circle(39,20,3),circle(39,28,3),circle(45,24,2)].join(''));
 if(group==='finish')return path('M8 8H40V40H8Z')+({mirror:path('M14 32 30 14M23 34 34 23M15 12V20M11 16H19'),satin:path('M13 16H35M13 22H35M13 28H35M13 34H35'),brushed:Array.from({length:7},(_,i)=>path(`M${12+i*4} 12V36`)).join(''),hammered:[circle(17,17,4),circle(30,16,5),circle(25,27,5),circle(14,32,3),circle(35,34,3)].join('')}[value]);
 if(group==='detail')return ({none:path('M8 17H40M8 31H40'),rails:path('M8 13H40M8 18H40M8 30H40M8 35H40'),milgrain:path('M8 17H40M8 31H40')+Array.from({length:7},(_,i)=>circle(9+i*5,13,1)+circle(9+i*5,35,1)).join(''),gallery:path('M7 15H41M7 34H41M8 24Q16 5 24 24Q32 43 40 24M8 24Q16 43 24 24Q32 5 40 24')}[value]);
 return '';
}
const shapePaths={halfmoon:'M11 5V43C44 43 44 5 11 5Z',trapezoid:'M9 5 39 13V35L9 43Z',round:'M24 7a17 17 0 1 0 0 34a17 17 0 1 0 0-34',oval:'M24 5C7 5 7 43 24 43S41 5 24 5',cushion:'M14 8Q8 8 8 14V34Q8 40 14 40H34Q40 40 40 34V14Q40 8 34 8Z',princess:'M9 9H39V39H9Z',emerald:'M16 5H32L39 12V36L32 43H16L9 36V12Z',pear:'M24 4C21 12 8 23 10 32C12 46 36 46 38 32C40 23 27 12 24 4Z',marquise:'M24 3Q1 24 24 45Q47 24 24 3Z',asscher:'M16 6H32L42 16V32L32 42H16L6 32V16Z',radiant:'M15 5H33L40 12V36L33 43H15L8 36V12Z',heart:'M24 40 7 23C-2 7 17 2 24 14C31 2 50 7 41 23Z',trillion:'M24 5 44 40H4Z',hexagon:'M24 4 41 14V34L24 44 7 34V14Z'};
export function icon(group,value){
 const special=symbol(group,value);if(special)return `<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke-linecap="round" stroke-linejoin="round">${special}</svg>`;
 if(group==='gem'||group==='metal'){const color=group==='gem'?gems[value]?.color:{white:'#dce1e8',yellow:'#d8b86e',rose:'#c99789',platinum:'#a9bbc8'}[value];return `<i class="builder-swatch" style="--swatch:${color}"></i>`;}
 if(group==='shape'||group==='sideShape')return `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="${shapePaths[value]}"/><path opacity=".3" d="M15 15 33 33M15 33 33 15"/></svg>`;
 const paths={classic:'M7 31Q24 3 41 31M9 35Q24 10 39 35',tapered:'M7 34Q24 1 41 34M12 34Q24 8 36 34',split:'M6 34Q24 4 42 34M6 34Q24 18 42 34',twist:'M5 29Q14 8 24 25T43 20M5 20Q14 40 24 23T43 29',pave:'M6 34Q24 4 42 34M10 31l3-2m3-6 3-2m4-1h3m4 1 3 2m3 6 3 2',cathedral:'M5 36Q14 13 19 10M43 36Q34 13 29 10M5 36Q24 17 43 36',bypass:'M5 35Q10 7 29 10M43 35Q38 7 19 10',chevron:'M5 20 24 35 43 20M5 25 24 40 43 25',double:'M5 30Q24 5 43 30M5 39Q24 14 43 39',rope:'M4 26Q12 7 20 26T36 26T44 26M4 20Q12 39 20 20T36 20T44 20',organic:'M4 33Q15 1 26 22T44 17M4 22Q22 42 30 18T44 30',wide:'M7 35Q24 0 41 35M13 35Q24 16 35 35',round:'M8 30Q8 10 24 10T40 30Z',flat:'M9 13H39V32H9Z',knife:'M8 32V23L24 9 40 23V32Z',comfort:'M8 15Q24 7 40 15V32Q24 25 8 32Z',square:'M9 10H39V36H9Z'};
 const path=paths[value]||(group==='setting'?'M10 10 16 36H32L38 10M16 36 24 42 32 36M13 20H35':'M8 24H40M14 16H34M14 32H34');
 return `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="${path}"/></svg>`;
}
