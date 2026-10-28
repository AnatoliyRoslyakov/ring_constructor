import schema from './constructor/schema.json';
import { shapeRatios } from './constructor/catalog.js';
export const choices=schema.choices;
export const defaults=schema.defaults;
export const ranges=schema.ranges;
export function normalizeAccents(value){
 if(!Array.isArray(value))return [];
 return value.slice(0,8).flatMap(item=>{
  if(!item||item.kind!=='sweep'||!Array.isArray(item.points)||item.points.length<3||item.points.length>12)return [];
  if(!item.points.every(p=>Array.isArray(p)&&p.length===3&&p.every(n=>typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<=18)))return [];
  const basis=Array.isArray(item.basis)&&item.basis.length===4&&item.basis.every((n,i)=>typeof n==='number'&&Number.isFinite(n)&&n>=[[14,23],[4,12],[0,3],[1.2,3]][i][0]&&n<=[[14,23],[4,12],[0,3],[1.2,3]][i][1])?item.basis:undefined;
  return [{kind:'sweep',points:item.points.map(p=>p.map(n=>Math.round(n*1000)/1000)),radius:Math.max(.15,Math.min(.65,Number(item.radius)||.25)),mirrorX:item.mirrorX===true,...(basis?{basis}:{} )}];
 });
}
export function normalizeDesign(value={}){
 const result={...defaults,accents:[]};
 for(const [key,values]of Object.entries(choices))if(Object.hasOwn(values,value[key]))result[key]=value[key];
 for(const [key,[min,max]]of Object.entries(ranges)){const n=Number(value[key]);if(value[key]!=null&&Number.isFinite(n))result[key]=Math.round(Math.min(max,Math.max(min,n))*100)/100;}
 if([4,6,8].includes(Number(value.prongs)))result.prongs=Number(value.prongs);
 if(['585','750'].includes(value.purity))result.purity=value.purity;
 if(result.metal==='platinum')result.purity='950';
 result.sizeKnown=value.sizeKnown!==false;
 result.engraving=String(value.engraving||'').replace(/[<>\x00-\x1f]/g,'').slice(0,24);
 result.stoneId=/^[A-Z0-9-]{1,32}$/.test(value.stoneId||'')?value.stoneId:'';
 result.accents=normalizeAccents(value.accents);
 return result;
}
export function dimensions(d){
 return {width:d.gemSize,length:d.gemSize*shapeRatios[d.shape],spanX:d.gemSize*(d.orientation==='east'?shapeRatios[d.shape]:1),spanZ:d.gemSize*(d.orientation==='east'?1:shapeRatios[d.shape]),prong:Math.max(.44,Math.min(.92,.30+d.gemSize*.035)),height:d.ringSize/2+d.thickness+d.gemSize*.69+.45+d.headLift};
}
export function designWarnings(d){const warnings=[];
 if(d.gemSize>9&&d.width<2)warnings.push('Крупный камень и тонкую шинку стоит проверить с мастером.');
 if(d.setting==='tension')warnings.push('Открытая закрепка требует расчёта сплава и посадочных мест. Здесь показан визуальный эскиз.');
 if(d.halo!=='none'&&d.sideStones==='cluster')warnings.push('Ореол и россыпь создают плотную композицию. Проверьте вид сверху.');
 if(d.accents.length)warnings.push('Авторские линии требуют проверки соединений и технологичности мастером.');
 return warnings;
}
export function specification(d){const m=dimensions(d);return [
 ['Шинка',`${choices.shank[d.shank]} / ${choices.profile[d.profile]}`],['Сечение',`${d.width.toFixed(1)} × ${d.thickness.toFixed(1)} мм`],['Размер кольца',d.sizeKnown?d.ringSize.toFixed(1):'Уточнить с мастером'],
 ['Камень',choices.gem[d.gem]],['Огранка',`${choices.shape[d.shape]} / ${choices.orientation[d.orientation]}`],['Размер камня',`${m.width.toFixed(1)} × ${m.length.toFixed(1)} мм`],
 ['Оправа',`${choices.setting[d.setting]}${['bezel','halfbezel','tension'].includes(d.setting)?'':` / ${d.prongs} крапанов`}`],['Ореол',choices.halo[d.halo]],['Боковые камни',choices.sideStones[d.sideStones]],['Декор',choices.detail[d.detail]],
 ['Подъём оправы',`${d.headLift.toFixed(1)} мм`],['Металл',`${choices.metal[d.metal]} ${d.purity}`],['Поверхность',choices.finish[d.finish]],['Гравировка',d.engraving||'Без гравировки'],...(d.accents.length?[['Авторские линии',String(d.accents.length)]]:[])
 ];}
