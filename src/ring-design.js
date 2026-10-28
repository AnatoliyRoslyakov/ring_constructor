import schema from './constructor/schema.json';
import { normalizeFreeform,generatedLabel,authoredSection,freeComplete } from './constructor/freeform.js';
import { shapeRatios } from './constructor/catalog.js';
export const choices=schema.choices;
export const defaults=schema.defaults;
export const ranges=schema.ranges;
export function normalizeAccents(value){
 if(!Array.isArray(value))return [];
 return value.slice(0,8).flatMap(item=>{
  if(!item||item.kind!=='sweep'||!Array.isArray(item.points)||item.points.length<3||item.points.length>12)return [];
  if(!item.points.every(p=>Array.isArray(p)&&p.length===3&&p.every(n=>typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<=18)))return [];
  if(item.points.some((p,i)=>i>0&&Math.hypot(...p.map((n,j)=>n-item.points[i-1][j]))<.02))return [];
  const basis=Array.isArray(item.basis)&&item.basis.length===4&&item.basis.every((n,i)=>typeof n==='number'&&Number.isFinite(n)&&n>=[[14,23],[4,12],[0,3],[1.2,3]][i][0]&&n<=[[14,23],[4,12],[0,3],[1.2,3]][i][1])?item.basis:undefined;
  return [{kind:'sweep',points:item.points.map(p=>p.map(n=>Math.round(n*1000)/1000)),radius:Math.max(.15,Math.min(.65,Number(item.radius)||.25)),mirrorX:item.mirrorX===true,...(basis?{basis}:{} )}];
 });
}
export function normalizeDesign(value={}){
 const result={...defaults,accents:[]};
 for(const [key,values]of Object.entries(choices))if(Object.hasOwn(values,value[key]))result[key]=value[key];
 for(const [key,[min,max]]of Object.entries(ranges)){const n=Number(value[key]),precision=key==='gemRatio'?1000:100;if(value[key]!=null&&Number.isFinite(n))result[key]=Math.round(Math.min(max,Math.max(min,n))*precision)/precision;}
 if(value.gemRatio==null)result.gemRatio=shapeRatios[result.shape];
 if(['round','princess','asscher'].includes(result.shape))result.gemRatio=1;
 if([4,6,8].includes(Number(value.prongs)))result.prongs=Number(value.prongs);
 if(['585','750'].includes(value.purity))result.purity=value.purity;
 if(result.metal==='platinum')result.purity='950';
 result.centerStone=value.centerStone!==false;
 result.openwork=value.openwork===true;
 result.sizeKnown=value.sizeKnown!==false;
 result.engraving=String(value.engraving||'').replace(/[<>\x00-\x1f]/g,'').slice(0,24);
 result.stoneId=/^[A-Z0-9-]{1,32}$/.test(value.stoneId||'')?value.stoneId:'';
 result.accents=normalizeAccents(value.accents);
 result.freeform=normalizeFreeform(value.freeform);
 return result;
}
export function headGirdle(d){
 // Pavilion depth is intrinsic to the cut; lift only adds optional clearance.
 let top=d.ringSize*.5+d.thickness;
 for(const band of d.freeform?.shank?.bands||[]){
  if(!band.closed&&!(band.stations[0][0]<=90&&band.stations.at(-1)[0]>=90))continue;
  const rows=band.stations,i=rows.findIndex(p=>p[0]>=90),a=rows[Math.max(0,i-1)],b=rows[i<0?rows.length-1:i],t=b[0]===a[0]?0:(90-a[0])/(b[0]-a[0]),at=k=>a[k]+(b[k]-a[k])*t;
  const depth=at(4)*d.thickness/d.freeform.basis.thickness,width=at(3)*d.width/d.freeform.basis.width,roll=at(5)*Math.PI/180,radial=band.profile.map(([u,v])=>u*depth*.5*Math.cos(roll)-v*width*.5*Math.sin(roll));
  top=Math.max(top,d.ringSize*.5+Math.max(...radial)-Math.min(...radial)+Math.max(0,at(1))*d.thickness/d.freeform.basis.thickness);
 }
 return top+d.gemSize*.44+.12+d.headLift;
}
export function dimensions(d){
 const ratio=d.gemRatio??shapeRatios[d.shape];return {width:d.gemSize,length:d.gemSize*ratio,spanX:d.gemSize*(d.orientation==='east'?ratio:1),spanZ:d.gemSize*(d.orientation==='east'?1:ratio),prong:Math.max(.44,Math.min(.92,.30+d.gemSize*.035)),height:d.centerStone?headGirdle(d)+d.gemSize*.25:d.ringSize*.5+d.thickness};
}
export function designWarnings(d){const warnings=[];
 if(d.freeform&&!freeComplete(d))warnings.push('AI-форма ещё не завершена. Продолжите создание кольца.');
 if(d.centerStone&&d.gemSize>9&&d.width<2)warnings.push('Крупный камень и тонкую шинку стоит проверить с мастером.');
 if(d.centerStone&&!d.freeform&&d.setting==='tension')warnings.push('Открытая закрепка требует расчёта сплава и посадочных мест. Здесь показан визуальный эскиз.');
 if(d.halo!=='none'&&d.sideStones==='cluster')warnings.push('Ореол и россыпь создают плотную композицию. Проверьте вид сверху.');
 if(d.accents.length)warnings.push('Авторские линии требуют проверки соединений и технологичности мастером.');
 return warnings;
}
export function specification(d){const m=dimensions(d),section=authoredSection(d);return [
 ['Шинка',d.freeform?.shank?generatedLabel:`${choices.shank[d.shank]} / ${choices.profile[d.profile]}`],['Сечение',section?`${section.min.toFixed(1)}–${section.max.toFixed(1)} мм / переменное`:`${d.width.toFixed(1)} × ${d.thickness.toFixed(1)} мм`],['Размер кольца',d.sizeKnown?d.ringSize.toFixed(1):'Уточнить с мастером'],
 ...(d.centerStone?[["Камень",choices.gem[d.gem]],['Огранка',`${choices.shape[d.shape]} / ${choices.orientation[d.orientation]}`],['Размер камня',`${m.width.toFixed(1)} × ${m.length.toFixed(1)} мм`]]:[['Камень','Без центрального камня']]),
 ['Оправа',!d.centerStone?'Без оправы':d.freeform?.setting?`${generatedLabel} / ${d.freeform.setting.claws.length} кончиков`: d.freeform?'Не создана':`${choices.setting[d.setting]}${['bezel','halfbezel','tension'].includes(d.setting)?'':` / ${d.prongs} крапанов`}`],['Ореол',choices.halo[d.halo]],['Дорожка',choices.pave[d.shank==='pave'&&d.pave==='none'?'shoulders':d.pave]],...(d.pave!=='none'||d.shank==='pave'?[['Ряды паве',choices.paveRows[d.paveRows]]]:[]),['Боковые камни',choices.sideStones[d.sideStones]],['Декор',choices.detail[d.detail]],
 ['Орнамент',d.freeform?.ornament?`${generatedLabel} / ${d.freeform.ornament.repeat} повторов`:choices.ornament[d.ornament]],
 ...(d.centerStone&&d.freeform?.mount?[['Соединение',generatedLabel]]:[]),...(d.centerStone?[['Подъём оправы',`${d.headLift.toFixed(1)} мм`]]:[]),['Металл',`${choices.metal[d.metal]} ${d.purity}`],['Поверхность',choices.finish[d.finish]],['Гравировка',d.engraving||'Без гравировки'],...(d.accents.length?[['Авторские линии',String(d.accents.length)]]:[])
 ];}
