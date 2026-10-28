export const choices={
 shank:{classic:'Классическая',tapered:'Зауженная',split:'Раздвоенная',twist:'Переплетение',pave:'Дорожка камней'},
 profile:{round:'Округлый',flat:'Плоский',knife:'Острый гребень'},
 gem:{diamond:'Бриллиант',lab:'Лабораторный бриллиант',sapphire:'Сапфир',ruby:'Рубин',emerald:'Изумруд',moissanite:'Муассанит'},
 shape:{round:'Круг',oval:'Овал',cushion:'Кушон',princess:'Принцесса',emerald:'Изумрудная',pear:'Груша',marquise:'Маркиз'},
 setting:{prongs:'Крапановая',bezel:'Глухая оправа'},
 prongStyle:{round:'Округлые',claw:'Коготки',v:'V-образные'},
 metal:{white:'Белое золото',yellow:'Жёлтое золото',rose:'Розовое золото',platinum:'Платина'},
 finish:{mirror:'Зеркальная',satin:'Сатиновая'},
 orientation:{north:'Вдоль пальца',east:'Поперёк пальца'}
};
export const defaults={version:1,shank:'classic',profile:'round',width:2.2,thickness:1.6,ringSize:16.5,sizeKnown:true,gem:'diamond',shape:'round',gemSize:6.5,orientation:'north',setting:'prongs',prongs:6,prongStyle:'round',headLift:.5,metal:'white',purity:'750',finish:'mirror',engraving:''};
export function normalizeDesign(value={}){
 const result={...defaults};
 for(const [key,values]of Object.entries(choices))if(Object.hasOwn(values,value[key]))result[key]=value[key];
 for(const [key,min,max]of [['width',1.5,5],['thickness',1.2,2.5],['ringSize',14,22],['gemSize',4,10],['headLift',0,2]]){const n=Number(value[key]);if(value[key]!=null&&Number.isFinite(n))result[key]=Math.round(Math.min(max,Math.max(min,n))*100)/100;}
 if([4,6,8].includes(Number(value.prongs)))result.prongs=Number(value.prongs);
 if(['585','750'].includes(value.purity))result.purity=value.purity;
 if(result.metal==='platinum')result.purity='950';
 result.sizeKnown=value.sizeKnown!==false;
 result.engraving=String(value.engraving||'').replace(/[<>\x00-\x1f]/g,'').slice(0,24);
 return result;
}
export function dimensions(d){
 const ratio={round:1,oval:1.35,cushion:1.05,princess:1,emerald:1.4,pear:1.5,marquise:1.8}[d.shape];
 return {width:d.gemSize,length:d.gemSize*ratio,prong:Math.max(.44,Math.min(.76,.30+d.gemSize*.035)),height:d.ringSize/2+d.thickness+d.gemSize*.69+.45+d.headLift};
}
export function specification(d){const m=dimensions(d);return [
 ['Шинка',`${choices.shank[d.shank]} / ${choices.profile[d.profile]}`],
 ['Сечение',`${d.width.toFixed(1)} × ${d.thickness.toFixed(1)} мм`],
 ['Размер кольца',d.sizeKnown?d.ringSize.toFixed(1):'Уточнить с мастером'],
 ['Камень',choices.gem[d.gem]],['Огранка',`${choices.shape[d.shape]} / ${choices.orientation[d.orientation]}`],
 ['Размер камня',`${m.width.toFixed(1)} × ${m.length.toFixed(1)} мм`],
 ['Оправа',d.setting==='bezel'?'Глухая':`${d.prongs} крапанов / ${choices.prongStyle[d.prongStyle]}`],
 ['Подъём оправы',`${d.headLift.toFixed(1)} мм`],['Металл',`${choices.metal[d.metal]} ${d.purity}`],
 ['Поверхность',choices.finish[d.finish]],['Гравировка',d.engraving||'Без гравировки']
 ];}
