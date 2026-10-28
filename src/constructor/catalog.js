import stoneRows from './stones.json';
export const gems={
 diamond:{color:'#f4f8ff',ior:2.417,family:'clear'},lab:{color:'#f4f8ff',ior:2.417,family:'clear'},moissanite:{color:'#f2ffe8',ior:2.65,family:'clear'},
 sapphire:{color:'#416cdb',ior:1.77,family:'color'},ruby:{color:'#d03f60',ior:1.77,family:'color'},emerald:{color:'#43a779',ior:1.58,family:'color'},
 aquamarine:{color:'#92d4e1',ior:1.58,family:'color'},amethyst:{color:'#9961c0',ior:1.55,family:'color'},citrine:{color:'#eebd4b',ior:1.55,family:'color'},tourmaline:{color:'#4f9b8a',ior:1.64,family:'color'},garnet:{color:'#8b233c',ior:1.79,family:'color'},morganite:{color:'#efb7a4',ior:1.58,family:'color'}
};
export const shapeRatios={round:1,oval:1.35,cushion:1.05,princess:1,emerald:1.4,pear:1.5,marquise:1.8,asscher:1,radiant:1.35,heart:1,trillion:1.02,hexagon:1.15};
export const stoneCatalog=stoneRows.map(([id,name,gem,shape,gemSize])=>({id,name,gem,shape,gemSize,color:gems[gem].color,family:gems[gem].family}));
export const collections=[
 {id:'essential',name:'Чистая линия',note:'Свет и пропорции',design:{shank:'tapered',shape:'round',gem:'diamond',setting:'prongs',prongs:6,width:2,halo:'none',sideStones:'none',detail:'none',metal:'white'}},
 {id:'heritage',name:'Наследие',note:'Овал, тюльпан и тонкий кант',design:{shank:'cathedral',shape:'oval',gem:'sapphire',setting:'tulip',prongs:6,metal:'yellow',detail:'milgrain',width:2.5}},
 {id:'trilogy',name:'Три истории',note:'Центр и два спутника',design:{shank:'classic',shape:'emerald',gem:'emerald',setting:'basket',prongs:4,sideStones:'pair',sideShape:'trillion',sideSize:.4,metal:'white'}},
 {id:'aura',name:'Аура',note:'Двойная игра света',design:{shank:'pave',shape:'cushion',gem:'lab',setting:'prongs',prongs:4,halo:'single',metal:'platinum',haloSize:.85}},
 {id:'sculpture',name:'Скульптура',note:'Обходящая линия и полуободок',design:{shank:'bypass',shape:'pear',gem:'morganite',setting:'halfbezel',metal:'rose',width:3.2}},
 {id:'botanic',name:'Ботаника',note:'Переплетение и открытая галерея',design:{shank:'organic',shape:'marquise',gem:'tourmaline',setting:'tulip',prongs:6,detail:'gallery',metal:'yellow'}}
];
export const sceneCatalog={
 studio:{title:'Ювелирная студия',description:'Нейтральный фон и длинные блики. Оцените форму и чистоту линий.',background:'#111e30',key:'#fff4dc',rim:'#c5d8ff',exposure:.95,surface:null},
 daylight:{title:'У окна',description:'Мягкий дневной свет и светлая каменная поверхность.',background:'#d9dedb',key:'#f5fbff',rim:'#c3d7ef',exposure:1.05,surface:'limestone'},
 evening:{title:'Вечерний свет',description:'Тёплый боковой свет на глубоком тёмном фоне.',background:'#211b25',key:'#ffd9a2',rim:'#adbbef',exposure:.78,surface:'dark'},
 velvet:{title:'Бордовый бархат',description:'Мягкая ювелирная подушка и деликатный тёплый свет.',background:'#241725',key:'#ffe7cd',rim:'#d2c2df',exposure:.9,surface:'velvet'},
 stone:{title:'Природная материя',description:'Тёплый каменный постамент для сравнения металла и самоцветов.',background:'#343630',key:'#fff0d2',rim:'#d5dfcf',exposure:.98,surface:'travertine'}
};
