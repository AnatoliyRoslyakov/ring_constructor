import {icon} from './constructor/icons.js';
import { generatedLabel,freeComplete,generationStages } from './constructor/freeform.js';
import { renderFreeformPanel,aiPhaseNames } from './constructor/freeform-panel.js';
import { choices,defaults,normalizeDesign,dimensions,specification,designWarnings } from './ring-design.js';
import { createRingStudio } from './parametric-ring.js';
import { stoneCatalog,collections,sceneCatalog,shapeRatios } from './constructor/catalog.js';
import { createDesignStore } from './constructor/design-store.js';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const steps=[['Основа','Выберите шинку.','Начните с силуэта и задайте ширину кольца.'],['Камень','Выберите камень.','Огранка, цвет и положение на кольце.'],['Оправа','Настройте оправу.','Закрепка держит камень, ореол окружает его.'],['Детали','Добавьте свой характер.','Металл, дорожки камней и гравировка.'],['Итог','Ваше кольцо.','Сохраните эскиз и параметры или оставьте заявку.']];
const methodNames={manual:'Ручная сборка',ai:'Создание с AI'};
const optionNotes={halo:{none:'Только центральный камень',single:'Один круг маленьких камней',double:'Два круга маленьких камней',hidden:'Камни под центральной оправой'},orientation:{north:'Длинная ось вдоль пальца',east:'Длинная ось поперёк пальца'}};
const notes={classic:'Цельная лаконичная линия',tapered:'Сужение к центральной оправе',split:'Две ветви у камня',twist:'Две переплетённые линии',pave:'Малые камни на плечах',cathedral:'Приподнятые арочные плечи',bypass:'Асимметричная обходящая линия',chevron:'V-образный силуэт',double:'Две параллельные шинки',rope:'Плотное объёмное плетение',wide:'Широкая скульптурная форма',organic:'Свободное мягкое переплетение'};
function downloadBlob(data,name,type='application/json'){const url=URL.createObjectURL(data instanceof Blob?data:new Blob([data],{type})),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function setupCustomizer(dialog,{reduced=false}={}){
 dialog.innerHTML=`<form id="builder-form" class="builder-shell"><header class="builder-header"><span class="builder-brand">ORIGIN <small>Ring Studio</small></span><button type="button" class="builder-method" data-method-home>Выбрать способ</button><div class="builder-history"><button type="button" data-history="undo" aria-label="Отменить изменение" title="Отменить">↶</button><button type="button" data-history="redo" aria-label="Повторить изменение" title="Повторить">↷</button></div><button type="button" class="builder-reset" data-builder-reset>Сбросить</button><button type="button" class="dialog-close" aria-label="Закрыть конструктор">×</button></header>
 <nav class="builder-steps" aria-label="Этапы создания кольца">${steps.map((s,i)=>`<button type="button" data-builder-step="${i}"><i>0${i+1}</i><span>${i===4?'Итог и расчёт':s[0]}</span></button>`).join('')}</nav>
 <div class="builder-body"><div class="builder-stage"><div class="builder-canvas-host"><canvas id="builder-canvas"></canvas></div><div class="builder-view-controls" role="group" aria-label="Ракурс кольца">${[['perspective','Перспектива'],['front','Спереди'],['side','Сбоку'],['top','Сверху']].map(([id,name])=>`<button type="button" data-builder-view="${id}" aria-pressed="${id==='perspective'}">${name}</button>`).join('')}</div><details class="builder-light-picker"><summary>Свет <span data-light-name>Студия</span></summary><div role="group" aria-label="Освещение кольца">${Object.entries(sceneCatalog).map(([id,s])=>`<button type="button" data-scene="${id}" aria-label="${s.title}" title="${s.title}" style="--light-color:${s.background}"><i></i><span>${s.title}</span></button>`).join('')}</div></details><div class="builder-preview-badge" hidden></div><div class="builder-camera-tools"><button type="button" data-builder-zoom="-.12" aria-label="Приблизить кольцо">+</button><button type="button" data-builder-zoom=".12" aria-label="Отдалить кольцо">−</button><button type="button" data-builder-auto aria-pressed="false">Автоповорот</button><button type="button" data-compare-save>Запомнить A</button><button type="button" data-compare-toggle hidden>Сравнить с A</button></div><div class="builder-model-caption"><span class="builder-model-meta"></span><span>Вращайте. Приближайте. Рассматривайте.</span></div></div><div class="builder-panel" data-lenis-prevent></div></div>
 <footer class="builder-footer"><div><span class="builder-step-counter">01 / 05</span><span class="builder-status preview-status" role="status">Подготавливаем 3D…</span></div><div class="builder-actions"><button type="button" data-builder-prev hidden>Назад</button><button type="button" data-builder-next>Продолжить</button></div></footer></form>`;
 let initial={};try{initial=JSON.parse(localStorage.getItem('origin-ring-design-v2')||localStorage.getItem('origin-ring-design-v1')||'{}');}catch{}
 const readDraft=(name,fallback)=>{try{return JSON.parse(localStorage.getItem('origin-ring-'+name+'-draft')||'null')||fallback;}catch{return fallback;}};
 const stores={manual:createDesignStore(readDraft('manual',initial.freeform?defaults:initial)),ai:createDesignStore(readDraft('ai',initial.freeform?initial:defaults))};
 let method=initial.freeform?'ai':'manual',store=stores[method],design=store.get(),step=0,mode='choose',studio,active=false,delivery=false,dirty=true,submitKey=null,busy=false,savedA=null,comparing=false;
 const isFinal=()=>mode==='summary'||mode==='edit'&&step===4;
 let aiConfig={configured:false,model:'deepseek-flash'},aiBusy=false,aiResult=null,aiPreview=false,aiPrompt='',aiConsent=false,photo='',photoName='',aiError='',libraryReturn='',catalogQuery='',catalogFilter='all',aiFeedback='',aiPart='shank',aiView=freeComplete(design)?'result':'reference',aiStage='prepare',aiCompleted=[],aiPreferences={},aiStoneId='',aiResultTab='customize',aiWorking=null,aiRun=null,aiController=null,aiRetry=0,progressClock=null;
 const panel=dialog.querySelector('.builder-panel'),canvas=dialog.querySelector('#builder-canvas'),status=dialog.querySelector('.builder-status'),stage=dialog.querySelector('.builder-stage'),emailState={email:'',name:'',comment:'',consent:false};
 const generationSource=()=>JSON.stringify({aiPrompt,photo,aiPreferences,aiStoneId,design:{...design,scene:undefined}});
 const shownDesign=()=>mode==='ai'&&aiView==='progress'&&aiWorking?aiWorking:aiPreview&&aiResult?aiResult.design:comparing&&savedA?savedA:design;
 function options(key,values=Object.keys(choices[key])){
  const cards=items=>`<div class="builder-options ${['shape','sideShape'].includes(key)?'builder-shapes':''}">${items.map(value=>`<button type="button" data-choice="${key}" data-value="${value}" aria-pressed="${!((['shank','profile'].includes(key)&&design.freeform?.shank)||(['setting','prongStyle'].includes(key)&&design.freeform?.setting))&&design[key]===value}">${icon(key,value)}<span>${escape(choices[key][value])}</span>${(key==='shank'?notes[value]:optionNotes[key]?.[value])?`<small>${escape(key==='shank'?notes[value]:optionNotes[key][value])}</small>`:''}</button>`).join('')}</div>`;
  const html=values.length<=6?cards(values):cards(values.slice(0,6))+`<details class="builder-more" ${values.indexOf(design[key])>=6?'open':''}><summary>Ещё ${values.length-6} ${values.length-6===2?'варианта':'вариантов'}</summary>${cards(values.slice(6))}</details>`;
  const generated=['shank','profile'].includes(key)?design.freeform?.shank:['setting','prongStyle'].includes(key)?design.freeform?.setting:null;
  if(!generated)return html;
  return `<div class="builder-authored"><span>${generatedLabel}</span><p>${key==='setting'?`${design.freeform.setting.claws.length} кончиков · ${design.freeform.setting.rims.length} ободков`:'Авторские контуры и сечения этого кольца.'}</p><button type="button" data-free-edit>Доработать форму</button></div><details class="builder-more"><summary>Заменить формой из каталога</summary><p class="builder-help">Выбор готовой формы заменит AI-конструкцию.</p>${html}</details>`;
 }
 function range(key,label,min,max,increment,unit='мм',scale=1){return `<label class="builder-range"><span>${label}<output data-output="${key}">${(design[key]*scale).toFixed(unit==='%'?0:1)} ${unit}</output></span><input type="range" name="${key}" min="${min}" max="${max}" step="${increment}" value="${design[key]}" data-unit="${unit}" data-scale="${scale}" ${key==='ringSize'&&!design.sizeKnown?'disabled':''}><span class="builder-range-limits"><i>${min*scale} ${unit}</i><i>${max*scale} ${unit}</i></span></label>`;}
 const group=(title,content,note='')=>`<fieldset class="builder-fieldset"><legend>${title}</legend>${content}${note?`<p class="builder-help">${note}</p>`:''}</fieldset>`;
 function editor(){
  if(step===0)return `<details class="builder-start"><summary>Начать с готового направления</summary><div class="builder-collections">${collections.map(p=>`<button type="button" data-collection="${p.id}"><strong>${p.name}</strong><span>${p.note}</span></button>`).join('')}</div></details>`+group('Конструкция',options('shank'))+group('Профиль',options('profile'))+range('width','Ширина шинки',1.5,12,.1)+range('thickness','Толщина металла',1.2,3,.1)+range('ringSize','Размер кольца',14,23,.5)+`<label class="builder-check"><input type="checkbox" name="sizeUnknown" ${!design.sizeKnown?'checked':''}>Размер пока неизвестен</label><details class="builder-more"><summary>Точные настройки шинки</summary>${range('taper','Сужение плеч',0,.65,.05,'%',100)}${(design.shank==='pave'||design.pave!=='none')?range('paveCoverage','Длина дорожки камней',.25,.85,.05,'%',100):''}</details>`;
  if(step===1)return `<div class="builder-counts" role="group" aria-label="Центральный камень">${[[true,'С камнем'],[false,'Без камня']].map(([v,label])=>`<button type="button" data-choice="centerStone" data-value="${v}" aria-pressed="${design.centerStone===v}">${label}</button>`).join('')}</div>`+(design.centerStone?`<button type="button" class="builder-inline-link" data-mode="catalog">Открыть библиотеку камней</button>`+group('Материал',options('gem'))+group('Огранка',options('shape'))+range('gemSize','Ширина камня',4,12,.1)+(!['round','princess','asscher'].includes(design.shape)?range('gemRatio','Длина / ширина камня',.8,2.4,.05,'×'):'')+`<p class="builder-dimensions">Контур: <strong data-gem-dimensions></strong></p>`+group('Положение камня',options('orientation')):'<p class="builder-help">Кольцо без центрального камня. На следующем шаге можно добавить дорожки небольших камней.</p>');
  if(step===2&&!design.centerStone)return '<p class="builder-help">Для кольца без центрального камня оправа не нужна.</p>'+group('Дорожка камней',options('pave'))+(design.pave!=='none'?group('Ряды на шинке',options('paveRows')):'');
  if(step===2)return group('Закрепка',options('setting'))+(!design.freeform&&!['bezel','halfbezel','tension'].includes(design.setting)?group('Количество крапанов',`<div class="builder-counts">${[4,6,8].map(n=>`<button type="button" data-choice="prongs" data-value="${n}" aria-pressed="${design.prongs===n}">${n}</button>`).join('')}</div>`)+group('Форма крапанов',options('prongStyle')):'')+range('headLift','Подъём оправы',0,3,.1)+group('Ореол вокруг камня',options('halo'))+(design.halo!=='none'?range('haloSize','Камни ореола',.65,1.5,.05):'')+`<details class="builder-more" ${design.sideStones!=='none'?'open':''}><summary>Боковые камни</summary>${group('Композиция',options('sideStones'))}${design.sideStones!=='none'?group('Огранка спутников',options('sideShape'))+range('sideSize','Размер относительно центра',.22,.55,.01,'%',100):''}</details><p class="builder-help" data-fit-details></p>`;
  if(step===3)return group('Металл',options('metal'))+(design.metal==='platinum'?'<p class="builder-help">Платина 950</p>':group('Проба',`<div class="builder-counts">${['585','750'].map(n=>`<button type="button" data-choice="purity" data-value="${n}" aria-pressed="${design.purity===n}">${n}</button>`).join('')}</div>`))+group('Поверхность',options('finish'))+group('Дорожка камней на шинке',options('pave'))+(design.pave!=='none'?group('Ряды на шинке',options('paveRows'))+range('paveCoverage','Длина дорожки',.25,.85,.05,'%',100):'')+group('Декор',options('detail'))+`<label class="builder-text-label">Гравировка внутри шинки<input type="text" name="engraving" maxlength="24" value="${escape(design.engraving)}" placeholder="Инициалы, дата, несколько слов" autocomplete="off"><small><span data-engraving-count>${design.engraving.length}</span> / 24 знака · видна в 3D</small></label>${design.accents.length?`<div class="builder-fit"><span>Авторские линии</span><p>В этом эскизе ${design.accents.length} дополнительных элементов, созданных по вашей идее.</p><button type="button" data-clear-accents>Убрать авторские линии</button></div>`:''}`;
  return `<div class="builder-summary">${specification(design).map(([k,v])=>`<div><span>${escape(k)}</span><strong>${escape(v)}</strong></div>`).join('')}</div>${designWarnings(design).map(text=>`<p class="builder-design-note">${escape(text)}</p>`).join('')}<div class="builder-export"><button type="button" data-export="png">Изображение PNG ↓</button><button type="button" data-export="glb">Модель GLB ↓</button><button type="button" data-export="json">Проект ORIGIN ↓</button><label>Открыть проект<input type="file" data-import accept="application/json,.json" hidden></label></div><div class="builder-request"><h3>Расчёт вашего кольца.</h3><p>Оставьте почту и пожелания. Конструкцию, доступность камня и стоимость подтверждает мастер.</p><label class="builder-text-label">Электронная почта<input name="email" type="email" autocomplete="email" required maxlength="254" value="${escape(emailState.email)}" placeholder="name@example.com"></label><label class="builder-text-label">Ваше имя <small>необязательно</small><input name="customerName" autocomplete="name" maxlength="80" value="${escape(emailState.name)}"></label><label class="builder-text-label">Пожелания<textarea name="comment" maxlength="2000" rows="3">${escape(emailState.comment)}</textarea></label><label class="builder-check"><input name="consent" type="checkbox" required ${emailState.consent?'checked':''}>Разрешаю использовать мою почту и данные эскиза для ответа.</label><label class="builder-honeypot" aria-hidden="true">Оставьте пустым<input name="company" tabindex="-1" autocomplete="off"></label><p class="builder-delivery-note" ${delivery?'hidden':''}>Локальный режим: заявка сохранится на этом компьютере. Отправка писем ещё не подключена.</p></div>`;
 }
 function aiPanel(){return renderFreeformPanel({design,selected:stoneCatalog.find(s=>s.id===aiStoneId),photo,photoName,aiPrompt,aiConsent,aiBusy,aiConfig,aiError,aiResult,aiFeedback,aiPart,aiView,aiStage,aiCompleted,aiPreferences,aiResultTab,aiPlan:aiRun?.plan||generationStages(design),aiRetry,recognitionHTML:recognitionPanel()});}
 function recognitionPanel(){
  const r=aiResult?.recognition;if(!r)return '';
  const labels={centerStone:'Центральный камень',ornament:'Орнамент',shank:'Шинка',shape:'Огранка',setting:'Закрепка',prongs:'Крапаны',halo:'Ореол',pave:'Дорожка',sideStones:'Боковые камни',width:'Ширина шинки',paveRows:'Ряды паве',orientation:'Положение'};
  const facts=(r.matched||[]).filter(f=>labels[f.parameter]);
  const conflicts=r.conflicts||[],notes=[...(r.limitations||[]),...(r.uncertain||[])];
  return `${r.summary?`<p class="builder-recognition-summary">${escape(r.summary)}</p>`:''}${facts.length?`<details class="builder-more"><summary>Что распознано на изображении</summary><dl class="builder-recognition-facts">${facts.map(f=>`<div><dt>${labels[f.parameter]}</dt><dd>${escape(f.parameter==='centerStone'?(f.value?'Есть':'Без камня'):(choices[f.parameter]?.[f.value]??f.value))}<small>${escape(f.evidence)}</small></dd></div>`).join('')}</dl></details>`:''}${conflicts.length?`<div class="builder-recognition-notes"><strong>Выбранный камень меняет референс</strong><p>${conflicts.map(escape).join(' ')}</p></div>`:''}${notes.length?`<details class="builder-more"><summary>Что требует уточнения · ${notes.length}</summary><ul class="builder-recognition-notes">${notes.map(n=>`<li>${escape(n)}</li>`).join('')}</ul></details>`:''}`;
 }
 function catalogPanel(){const items=stoneCatalog.filter(s=>(catalogFilter==='all'||s.family===catalogFilter)&&`${s.name} ${choices.gem[s.gem]} ${choices.shape[s.shape]}`.toLowerCase().includes(catalogQuery.toLowerCase()));
  return `<label class="builder-text-label">Найти камень<input name="catalogSearch" type="search" value="${escape(catalogQuery)}" placeholder="Сапфир, овал, изумруд…"></label><div class="builder-catalog-filters">${[['all','Все'],['clear','Бесцветные'],['color','Цветные']].map(([id,label])=>`<button type="button" data-filter="${id}" aria-pressed="${catalogFilter===id}">${label}</button>`).join('')}</div><p class="builder-help">Библиотека материалов и огранок для эскиза. Это не складской каталог: наличие и характеристики конкретного камня подтверждает мастер.</p><div class="builder-stone-grid">${items.map(s=>`<button type="button" data-stone="${s.id}" aria-pressed="${design.stoneId===s.id}"><span class="builder-catalog-gem" style="--stone:${s.color}">${icon('shape',s.shape)}</span><strong>${escape(s.name)}</strong><span>${choices.gem[s.gem]}</span><small>${choices.shape[s.shape]} · ${s.gemSize} мм</small></button>`).join('')||'<p class="builder-help">Другой запрос поможет найти подходящую огранку.</p>'}</div>`;
 }
 function welcomePanel(){return `<div class="builder-welcome"><p>Выберите свой способ. Оба сценария завершаются личным 3D-эскизом.</p><button type="button" class="builder-method-card" data-start-method="manual"><span class="builder-method-art">${icon('shank','split')}</span><span><strong>Собрать самому</strong><small>Выбирайте шинку, камень и оправу. Каждая деталь сразу появляется на кольце.</small><em>5 шагов · полный контроль</em></span><b aria-hidden="true">↗</b></button><button type="button" class="builder-method-card" data-start-method="ai"><span class="builder-method-art">${icon('shape','radiant')}</span><span><strong>Создать по фото с AI</strong><small>Добавьте фото или идею. Получите 3D-эскиз и настройте его под себя.</small><em>Референс → генерация → настройка</em></span><b aria-hidden="true">↗</b></button><p class="builder-help">У каждого способа свой черновик. Можно вернуться и продолжить.</p></div>`;}
 function renderPanel({preserve=false}={}){
  if(method==='ai'&&aiView==='result'&&!generationStages(design).includes(aiPart))aiPart='shank';
  const scroll=panel.scrollTop,opened=preserve?[...panel.querySelectorAll('details[open]')].map(el=>el.dataset.aiGroup||el.querySelector('summary')?.textContent):[];
  dialog.dataset.aiScreen=mode==='ai'?aiView:'';dialog.dataset.method=mode==='choose'?'choose':method;
  const navigation=dialog.querySelector('.builder-steps'),currentAI=mode==='summary'?'summary':aiView;
  navigation.setAttribute('aria-label',method==='ai'?'Этапы создания с AI':'Этапы ручной сборки');
  navigation.innerHTML=mode==='choose'?'<span class="builder-welcome-nav">Личный 3D-эскиз</span>':method==='ai'?[['reference','Идея'],['progress','Создание'],['result','Настройка'],['summary','Сохранение']].map(([view,label],i)=>`<button type="button" data-ai-view="${view}" class="${i<({reference:0,progress:1,result:2,summary:3}[currentAI])?'is-complete':''}" aria-current="${currentAI===view?'step':'false'}" ${aiBusy||(['result','summary'].includes(view)&&!freeComplete(design))||(view==='progress'&&!aiRun)?'disabled':''}><i>${i+1}</i><span>${label}</span></button>`).join(''):steps.map((s,i)=>`<button type="button" data-builder-step="${i}" aria-current="${i===step?'step':'false'}" class="${i<step?'is-complete':''}"><i>${i+1}</i><span>${s[0]}</span></button>`).join('');
  const methodButton=dialog.querySelector('[data-method-home]');methodButton.textContent=mode==='choose'?'Выберите способ':methodNames[method]+' · Сменить';methodButton.disabled=aiBusy||mode==='choose';
  dialog.querySelector('.builder-step-counter').textContent=mode==='choose'?'Ваше кольцо':method==='manual'?`Шаг ${step+1} из 5`:`Шаг ${{reference:1,progress:2,result:3,summary:4}[currentAI]} из 4`;
  const aiTitles={reference:['Ваша идея','Начните с референса.','Фотографии достаточно. Описание и параметры — по желанию.'],progress:['Автоматическая сборка','Создаём ваше кольцо.',''],result:['Ваш AI-эскиз','Настройте результат.','Сравните с референсом и уточните детали.']};
  const titles=mode==='choose'?['Ring Studio','Каким будет ваше кольцо?','']:mode==='summary'?steps[4]:mode==='edit'?steps[step]:mode==='ai'?aiTitles[aiView]:['Библиотека камней','Выберите свой камень.','Выбор вернёт вас к текущему шагу.'];
  panel.innerHTML=`${mode==='catalog'?'<button type="button" class="builder-back-link" data-close-catalog>← Назад к кольцу</button>':''}<div class="builder-panel-heading"><span>${titles[0]}</span><h2 id="design-title">${titles[1]}</h2><p>${titles[2]}</p></div>${mode==='choose'?welcomePanel():mode==='edit'||mode==='summary'?editor():mode==='ai'?aiPanel():catalogPanel()}`;
  if(preserve){panel.querySelectorAll('details').forEach(el=>el.open=opened.includes(el.dataset.aiGroup||el.querySelector('summary')?.textContent));panel.scrollTop=scroll;}else panel.scrollTop=0;
  const prev=dialog.querySelector('[data-builder-prev]'),next=dialog.querySelector('[data-builder-next]');
  prev.hidden=mode==='choose'||aiBusy||mode==='ai'&&aiView==='reference'||mode==='edit'&&step===0;prev.textContent=mode==='ai'?'К референсу':'Назад';
  next.hidden=mode==='choose'||mode==='catalog';next.type=isFinal()?'submit':'button';
  next.textContent=isFinal()?(delivery?'Отправить заявку':'Сохранить заявку'):mode==='ai'?(aiBusy?'Остановить':aiView==='reference'?'Создать кольцо':aiView==='progress'?'Продолжить создание':'Сохранить эскиз'):step===3?'Посмотреть итог':'Далее: '+steps[Math.min(4,step+1)][0].toLowerCase();
  next.disabled=busy||(mode==='ai'&&!aiBusy&&aiView!=='result'&&!aiConfig.configured);
  dialog.querySelector('[data-builder-reset]').disabled=aiBusy;dialog.querySelector('[data-builder-reset]').hidden=mode==='choose';
  dialog.querySelector('.builder-light-picker').hidden=mode==='choose';
  updateMeasurements();updateAIClock();
 }
 function updateMeasurements(){const d=shownDesign(),m=dimensions(d);dialog.querySelector('.builder-model-meta').textContent=`${choices.metal[d.metal]} ${d.purity} / ${d.centerStone?choices.gem[d.gem]+' / '+m.width.toFixed(1)+' × '+m.length.toFixed(1)+' мм':'Без центрального камня / '+d.width.toFixed(1)+' мм'}`;
  stage.dataset.scene=d.scene;dialog.querySelector('[data-light-name]').textContent=choices.scene[d.scene];dialog.querySelectorAll('.builder-light-picker [data-scene]').forEach(b=>(b.setAttribute('aria-pressed',String(b.dataset.scene===d.scene)),b.disabled=aiBusy));const dimensionsEl=panel.querySelector('[data-gem-dimensions]');if(dimensionsEl)dimensionsEl.textContent=`${m.width.toFixed(1)} × ${m.length.toFixed(1)} мм`;
  const fit=panel.querySelector('[data-fit-details]');if(fit)fit.textContent=d.freeform?.setting?`${d.freeform.setting.claws.length} кончиков · посадка по контуру камня`:['bezel','halfbezel','tension'].includes(d.setting)?'Посадка следует контуру камня.':`${d.prongs} крапанов · диаметр ${m.prong.toFixed(2)} мм · размер связан с камнем`;
  dialog.querySelector('[data-history=undo]').disabled=aiBusy||!store.canUndo;dialog.querySelector('[data-history=redo]').disabled=aiBusy||!store.canRedo;
  const badge=dialog.querySelector('.builder-preview-badge');badge.hidden=!aiBusy&&!aiPreview&&!comparing&&!(mode==='ai'&&design.freeform);badge.classList.toggle('is-building',aiBusy);badge.textContent=aiBusy?aiPhaseNames[aiStage]:mode==='ai'&&design.freeform&&!comparing?(aiView==='reference'?'Предыдущий эскиз':'AI-форма'):aiPreview?`${aiResult?.design?.freeform?'AI-форма':'AI'} · ещё не применён`:comparing?'Вариант A · сохранённый':'';
  dialog.querySelector('[data-compare-toggle]').hidden=!savedA;dialog.querySelector('[data-compare-toggle]').textContent=comparing?'Вернуться к B':'Сравнить с A';
 }
 function persist(){try{localStorage.setItem('origin-ring-design-v2',JSON.stringify(design));localStorage.setItem('origin-ring-'+method+'-draft',JSON.stringify(design));status.textContent='Проект сохранён в этом браузере';}catch{status.textContent='Не удалось сохранить в браузере. Скачайте проект.';}}
 function changed(coalesce=''){design=normalizeDesign(design);store.set(design,{coalesce});design=store.get();aiPreview=false;comparing=false;submitKey=null;dirty=true;persist();updateMeasurements();}
 function saveContact(){if(!isFinal()||!panel.querySelector('[name=email]'))return;const next={email:panel.querySelector('[name=email]').value,name:panel.querySelector('[name=customerName]').value,comment:panel.querySelector('[name=comment]').value,consent:panel.querySelector('[name=consent]').checked};if(JSON.stringify(next)!==JSON.stringify(emailState))submitKey=null;Object.assign(emailState,next);}
 function focusHeading(){const heading=panel.querySelector('h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
 function setMode(value){if(aiBusy)return;saveContact();if(value==='catalog')libraryReturn=mode;mode=value;if(value==='summary')step=4;if(value==='ai'&&!freeComplete(design)&&aiView==='result')aiView='reference';renderPanel();focusHeading();}
 function setStep(index){if(method!=='manual'||aiBusy)return;saveContact();mode='edit';step=Math.min(4,Math.max(0,index));renderPanel();focusHeading();}
 function startMethod(value){if(aiBusy)return;saveContact();persist();const switching=method!==value;method=value;store=stores[method];design=store.get();dirty=true;comparing=false;aiPreview=false;submitKey=null;if(switching){savedA=null;step=0;}mode=method==='ai'?'ai':'edit';if(method==='ai'&&!aiRun){aiView=freeComplete(design)?'result':'reference';aiResult=freeComplete(design)?{...aiResult,design}:null;}renderPanel();focusHeading();}
 function closeCatalog(){const target=libraryReturn|| (method==='ai'?'ai':'edit');libraryReturn='';setMode(target);}
 dialog.addEventListener('click',async event=>{
  const el=event.target;
  const start=el.closest('[data-start-method]');if(start){startMethod(start.dataset.startMethod);return;}
  if(el.closest('[data-method-home]')&&!aiBusy){setMode('choose');return;}
  if(el.closest('[data-close-catalog]')){closeCatalog();return;}
  const workspace=el.closest('[data-mode]');if(workspace){setMode(workspace.dataset.mode);return;}
  const history=el.closest('[data-history]');if(history&&!aiBusy){design=store[history.dataset.history]();aiPreview=false;comparing=false;dirty=true;submitKey=null;aiRun=null;if(method==='ai'){aiView=freeComplete(design)?'result':'reference';aiResult=freeComplete(design)?{design}:null;if(mode==='summary'&&!freeComplete(design))mode='ai';}persist();renderPanel();return;}
  const aiChoice=el.closest('[data-ai-choice]');if(aiChoice&&!aiBusy){const key=aiChoice.dataset.aiChoice,value=aiChoice.dataset.value;if(aiChoice.dataset.aiPreferenceChoice==='true'){if(value==='')delete aiPreferences[key];else aiPreferences[key]=value;}else{design[key]=value;if(key==='pave'&&design.shank==='pave')design.shank='classic';changed();if(aiResult)aiResult.design=normalizeDesign(design);}renderPanel({preserve:true});panel.querySelector(`[data-ai-choice="${key}"][data-value="${value}"]`)?.focus({preventScroll:true});return;}
  const option=el.closest('[data-choice]');if(option){const {choice,value}=option.dataset;if(['shank','profile','setting','prongs','prongStyle'].includes(choice))design.freeform=null;design[choice]=choice==='centerStone'?value==='true':choice==='prongs'?Number(value):value;if(choice==='shape')design.gemRatio=shapeRatios[value];if(choice==='pave'&&design.shank==='pave')design.shank='classic';if(choice==='shank'&&value==='pave')design.pave='shoulders';if(['gem','shape'].includes(choice))design.stoneId='';if(choice==='centerStone'&&!design.centerStone){design.halo='none';design.sideStones='none';}if(choice==='shank'&&value==='wide')design.width=Math.max(4.5,design.width);changed();const before=panel.scrollTop;renderPanel();panel.scrollTop=before;panel.querySelector(`[data-choice="${choice}"][data-value="${value}"]`)?.focus({preventScroll:true});return;}
  const aiViewButton=el.closest('[data-ai-view]');if(aiViewButton&&!aiBusy&&method==='ai'){saveContact();if(aiViewButton.dataset.aiView==='summary'){setMode('summary');return;}mode='ai';aiView=aiViewButton.dataset.aiView;renderPanel();focusHeading();return;}
  const resultTab=el.closest('[data-ai-result-tab]');if(resultTab){aiResultTab=resultTab.dataset.aiResultTab;renderPanel();return;}
  const stepButton=el.closest('[data-builder-step]');if(stepButton){setStep(Number(stepButton.dataset.builderStep));return;}
  if(el.closest('[data-builder-next]')&&mode==='ai'){
   event.preventDefault();
   if(aiBusy){aiRun.cancelled=true;aiController?.abort();return;}
   if(aiView==='result'){setMode('summary');return;}
   await generate({resume:aiView==='progress'&&!!aiRun});return;
  }
  if(el.closest('[data-builder-next]')&&mode==='edit'&&step<4){event.preventDefault();setStep(step+1);return;}
  if(el.closest('[data-builder-prev]')){if(mode==='catalog'){closeCatalog();return;}if(mode==='summary'){aiView='result';setMode('ai');return;}if(mode==='ai'){aiView='reference';aiError='';renderPanel();}else setStep(step-1);return;}
  const preset=el.closest('[data-collection]');if(preset){const selected=collections.find(p=>p.id===preset.dataset.collection);design={...defaults,...selected.design,ringSize:design.ringSize,sizeKnown:design.sizeKnown,engraving:design.engraving};changed();renderPanel();return;}
  const stoneButton=el.closest('[data-stone]');if(stoneButton){const stone=stoneCatalog.find(s=>s.id===stoneButton.dataset.stone);if(libraryReturn==='ai'&&aiView==='reference'){aiStoneId=stone.id;aiPreferences={...aiPreferences,centerStone:true,gem:stone.gem,shape:stone.shape,gemSize:stone.gemSize};libraryReturn='';setMode('ai');return;}design={...design,centerStone:true,gem:stone.gem,shape:stone.shape,gemSize:stone.gemSize,gemRatio:shapeRatios[stone.shape],stoneId:stone.id};changed();const target=libraryReturn;libraryReturn='';if(target){if(target==='ai')aiStoneId=stone.id;setMode(target);}else renderPanel();return;}
  const filter=el.closest('[data-filter]');if(filter){catalogFilter=filter.dataset.filter;renderPanel();return;}
  const scene=el.closest('button[data-scene]');if(scene&&!aiBusy){design.scene=scene.dataset.scene;changed();dialog.querySelector('.builder-light-picker').open=false;return;}
  const view=el.closest('[data-builder-view]');if(view){studio?.setView(view.dataset.builderView);dialog.querySelectorAll('[data-builder-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===view)));return;}
  const zoom=el.closest('[data-builder-zoom]');if(zoom){studio?.zoom(Number(zoom.dataset.builderZoom));return;}
  const rotate=el.closest('[data-builder-auto]');if(rotate){rotate.setAttribute('aria-pressed',String(studio?.setAutoRotate(rotate.getAttribute('aria-pressed')!=='true')));return;}
  if(el.closest('[data-compare-save]')){savedA=normalizeDesign(shownDesign());comparing=false;updateMeasurements();status.textContent='Вариант A запомнен. Изменяйте B и сравнивайте.';return;}
  if(el.closest('[data-compare-toggle]')){comparing=!comparing;aiPreview=false;dirty=true;updateMeasurements();return;}
  if(el.closest('[data-clear-accents]')){design.accents=[];changed();renderPanel();return;}
  if(el.closest('[data-builder-reset]')){aiRun=null;aiResult=null;aiView='reference';design={...defaults};changed();mode=method==='ai'?'ai':'edit';step=0;renderPanel();studio?.setView('perspective');return;}
  if(el.closest('[data-ai-stone]')){setMode('catalog');return;}
  if(el.closest('[data-ai-unlock-stone]')){aiStoneId='';for(const key of ['gem','shape','gemSize'])delete aiPreferences[key];renderPanel({preserve:true});return;}
  if(el.closest('[data-unlock-stone]')){design.stoneId='';changed();renderPanel();return;}
  if(el.closest('[data-remove-photo]')){photo='';photoName='';renderPanel();return;}
  if(el.closest('[data-free-edit]')){method='ai';stores.ai.set(design);store=stores.ai;aiResult={design:normalizeDesign(design)};aiRun=null;aiView=freeComplete(design)?'result':'reference';aiResultTab='correct';setMode('ai');return;}
  if(el.closest('[data-ai-correct]')){await generate({correct:true});return;}
  const exporting=el.closest('[data-export]');if(exporting){await exportProject(exporting.dataset.export);return;}
 });
 panel.addEventListener('input',event=>{const el=event.target;
  if(el.hasAttribute('data-ai-preference')){const key=el.dataset.aiPreference;if(el.value==='')delete aiPreferences[key];else aiPreferences[key]=key==='centerStone'?el.value==='true':el.type==='number'?Number(el.value):el.value;return;}
  if(el.hasAttribute('data-ai-design')){updateAIParameter(el);return;}
  if(el.type==='range'){design[el.name]=Number(el.value);if(el.name==='gemSize')design.stoneId='';const output=panel.querySelector(`[data-output="${el.name}"]`);if(output)output.textContent=`${(Number(el.value)*Number(el.dataset.scale||1)).toFixed(el.dataset.unit==='%'?0:1)} ${el.dataset.unit}`;changed(el.name);}
  if(el.name==='engraving'){design.engraving=el.value;panel.querySelector('[data-engraving-count]').textContent=el.value.length;changed('engraving');}
  if(el.name==='aiFeedback')aiFeedback=el.value;if(el.name==='aiPart')aiPart=el.value;if(el.name==='aiPrompt')aiPrompt=el.value;if(el.name==='aiConsent')aiConsent=el.checked;
  if(el.name==='catalogSearch'){catalogQuery=el.value;const caret=el.selectionStart;renderPanel();const input=panel.querySelector('[name=catalogSearch]');input.focus();if(input.type==='text')input.setSelectionRange(caret,caret);}
  if(['email','customerName','comment','consent'].includes(el.name))saveContact();
 });
 panel.addEventListener('change',async event=>{const el=event.target;
  if(el.hasAttribute('data-ai-preference')){const key=el.dataset.aiPreference;if(el.value==='')delete aiPreferences[key];else aiPreferences[key]=key==='centerStone'?el.value==='true':el.type==='number'?Number(el.value):el.value;if(['gem','shape','gemSize'].includes(key))aiStoneId='';renderPanel({preserve:true});return;}
  if(el.hasAttribute('data-ai-design')){updateAIParameter(el);if(el.tagName==='SELECT'||el.type==='range'){renderPanel({preserve:true});panel.querySelector(`[data-ai-design="${el.dataset.aiDesign}"]`)?.focus({preventScroll:true});}return;}
  if(el.name==='sizeUnknown'){design.sizeKnown=!el.checked;changed();renderPanel();}
  if(el.name==='referencePhoto'&&el.files[0])await loadPhoto(el.files[0]);
  if(el.hasAttribute('data-import')&&el.files[0]){
   try{if(el.files[0].size>100000)throw Error('Слишком большой проект.');const value=JSON.parse(await el.files[0].text());if(value.format!=='origin-ring-project'||value.version!==2||!value.design)throw Error('Выберите файл проекта ORIGIN версии 2.');const imported=normalizeDesign(value.design);if(value.design.freeform&&!imported.freeform)throw Error('Геометрия AI-формы повреждена.');method=imported.freeform?'ai':'manual';store=stores[method];design=imported;changed();mode=method==='ai'?'ai':'edit';aiRun=null;aiResult=freeComplete(design)?{design}:null;aiView=freeComplete(design)?'result':'reference';renderPanel();status.textContent='Проект открыт.';}catch(error){status.textContent=error.message;}
  }
 });
 async function loadPhoto(file){try{
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>12000000)throw Error('Выберите JPG, PNG или WebP до 12 МБ.');
  const bitmap=await createImageBitmap(file),ratio=Math.min(1,1600/Math.max(bitmap.width,bitmap.height)),image=document.createElement('canvas');image.width=Math.max(1,Math.round(bitmap.width*ratio));image.height=Math.max(1,Math.round(bitmap.height*ratio));const context=image.getContext('2d');context.fillStyle='#fff';context.fillRect(0,0,image.width,image.height);context.drawImage(bitmap,0,0,image.width,image.height);bitmap.close();photo=image.toDataURL('image/jpeg',.93);if(photo.length>2666600)photo=image.toDataURL('image/jpeg',.82);photoName=file.name;aiError='';aiConsent=false;renderPanel();
 }catch(error){aiError=error.message;renderPanel();}}
 function updateAIParameter(el){
  if(aiBusy)return;const key=el.dataset.aiDesign,value=el.type==='range'?Number(el.value):el.value;design[key]=value;if(key==='pave'&&design.shank==='pave')design.shank='classic';
  if(key==='shape')design.gemRatio=shapeRatios[value];if(['gem','shape','gemSize'].includes(key)){design.stoneId='';aiStoneId='';}
  if(key==='metal'){design.purity=value==='platinum'?'950':design.purity==='950'?'750':design.purity;}
  changed('ai-'+key);if(aiResult)aiResult.design=normalizeDesign(design);
  const output=panel.querySelector(`[data-ai-output="${key}"]`);if(output)output.textContent=`${Number(design[key]).toFixed(1)} ${key==='gemRatio'?'×':'мм'}`;
  status.textContent='Изменения сохранены. Кольцо обновлено в 3D.';
 }
 function aiValidation(message,selector){aiError=message;status.textContent=message;renderPanel();panel.querySelector(selector)?.focus();panel.querySelector('.builder-ai-error')?.scrollIntoView({block:'nearest'});}
 function updateAIClock(){
  const clock=panel.querySelector('[data-ai-elapsed]');if(!clock||!aiRun)return;
  const seconds=Math.floor(((aiRun.elapsed||0)+(aiBusy?Date.now()-aiRun.started:0))/1000);
  clock.textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
  const note=panel.querySelector('[data-ai-wait-note]');
  if(note&&aiBusy&&!aiRetry)note.textContent=Date.now()-aiRun.stageStarted>45000?'Детальная форма требует больше времени. Этап выполняется — ничего нажимать не нужно.':'Все этапы выполнятся автоматически. Можно вращать кольцо, пока оно создаётся.';
 }
 async function requestAIStage(run,part){
  const payload=JSON.stringify({stage:part,prompt:run.prompt,photo:run.photo,design:run.candidate.design,consent:true,feedback:run.feedback,preferences:run.preferences,stone:run.stoneId?{id:run.stoneId}:null});
  for(let attempt=0;attempt<3;attempt++){
   if(run.cancelled)throw Error('Создание остановлено. Можно продолжить с этого этапа.');
   aiRetry=attempt;aiController=new AbortController();const controller=aiController;let timedOut=false,timer;
   if(attempt){status.textContent='Восстанавливаем создание. Готовые этапы сохранены.';renderPanel();}
   try{
    if(attempt)await new Promise((resolve,reject)=>{const finish=()=>{controller.signal.removeEventListener('abort',abort);resolve();},wait=setTimeout(finish,attempt*1500),abort=()=>{clearTimeout(wait);reject(new DOMException('Остановлено','AbortError'));};controller.signal.addEventListener('abort',abort,{once:true});});
    timer=setTimeout(()=>{timedOut=true;controller.abort();},205000);
    const response=await fetch('/api/ring-ai',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:payload});
    let result;try{result=await response.json();}catch{throw Object.assign(Error('Сервер временно не ответил. Пробуем снова.'),{retryable:response.status>=500});}
    if(!response.ok)throw Object.assign(Error(result.error||'Не удалось завершить создание.'),{retryable:result.retryable===true});
    return result;
   }catch(error){
    if(run.cancelled)throw Error('Создание остановлено. Можно продолжить с этого этапа.');
    if(!(timedOut||error.retryable||error instanceof TypeError)||attempt===2)throw Error(timedOut?'DeepSeek не ответил вовремя. Готовые этапы сохранены — можно продолжить.':error.message);
   }finally{clearTimeout(timer);if(aiController===controller)aiController=null;}
  }
 }
 async function generate({correct=false,resume=false}={}){
  if(aiBusy)return;
  if(!resume){
   if(correct&&!aiFeedback.trim()){aiValidation('Напишите, что хотите изменить в кольце.','[name=aiFeedback]');return;}
   if(!correct&&!photo&&!aiPrompt.trim()){aiValidation('Добавьте фотографию или опишите вашу идею.','[name=aiPrompt]');return;}
   if(!aiConsent){aiValidation('Подтвердите отправку в DeepSeek.','[name=aiConsent]');return;}
   const invalid=panel.querySelector('[data-ai-preference]:invalid');if(invalid){invalid.reportValidity();status.textContent='Проверьте заданные размеры.';return;}
   const full=generationStages(design),plan=correct?(aiPart==='ornament'?['ornament']:full.slice(Math.max(1,full.indexOf(aiPart)))):['prepare'];const start=0;
   aiRun={candidate:{design:normalizeDesign(design),recognition:aiResult?.recognition},index:start,start,plan,prompt:aiPrompt,photo,feedback:correct?aiFeedback:'',preferences:correct?{}:{...aiPreferences},stoneId:correct?design.stoneId:aiStoneId,source:generationSource()};
   aiCompleted=[];
  }
  const run=aiRun;if(!run)return;
  if(run.source!==generationSource()){aiRun=null;aiError='Референс или параметры изменились. Запустите создание заново.';aiView='reference';renderPanel();return;}
  run.cancelled=false;run.started=Date.now();aiBusy=true;aiError='';comparing=false;aiPreview=false;aiView='progress';progressClock=setInterval(updateAIClock,1000);
  try{
   for(;run.index<run.plan.length;run.index++){
    if(run.cancelled)throw Error('Создание остановлено. Можно продолжить с этого этапа.');
    const part=run.plan[run.index];aiStage=part;aiRetry=0;run.stageStarted=Date.now();aiWorking=run.index>run.start?run.candidate.design:null;dirty=true;status.textContent=aiPhaseNames[part];renderPanel();
     const result=await requestAIStage(run,part);
     const normalized=normalizeDesign(result.design);if(part!=='prepare'&&!normalized.freeform?.[part])throw Error('Не удалось собрать детали кольца.');
     run.candidate={...result,design:normalized,recognition:result.recognition||run.candidate.recognition};aiCompleted.push(part);if(part==='prepare')run.plan=generationStages(normalized);
     aiWorking=normalized;dirty=true;
   }
   if(!freeComplete(run.candidate.design))throw Error('В кольце остались незавершённые детали. Продолжите создание.');
   aiResult=run.candidate;design=normalizeDesign({...aiResult.design,scene:design.scene});changed();aiResult.design=design;aiRun=null;aiWorking=null;aiFeedback='';aiView='result';aiResultTab='customize';status.textContent='Кольцо готово. Настройте детали или сохраните эскиз.';
  }catch(error){aiError=error.message;aiWorking=run.index>run.start?run.candidate.design:null;dirty=true;status.textContent=error.message;}
  finally{run.elapsed=(run.elapsed||0)+Date.now()-run.started;clearInterval(progressClock);progressClock=null;aiBusy=false;aiRetry=0;aiController=null;renderPanel();}
 }
 async function exportProject(format){if(!studio)return;try{if(dirty){studio.setDesign(shownDesign());dirty=false;}
  if(format==='png'){const encoded=studio.snapshot().split(',')[1],bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));downloadBlob(bytes,'ORIGIN-ring-design.png','image/png');}
  if(format==='json')downloadBlob(JSON.stringify({format:'origin-ring-project',version:2,design:shownDesign()},null,2),'ORIGIN-ring-project.json');
  if(format==='glb'){status.textContent='Подготавливаем GLB…';downloadBlob(await studio.exportGLB(),'ORIGIN-ring.glb','model/gltf-binary');}
  status.textContent='Файл подготовлен.';
 }catch{status.textContent='Не удалось подготовить файл. Попробуйте ещё раз.';}}
 const form=dialog.querySelector('#builder-form');form.addEventListener('submit',async event=>{
  event.preventDefault();if(!isFinal()||busy)return;saveContact();if(!form.reportValidity())return;if(!studio){status.textContent='3D-макет ещё не готов.';return;}
  // A request always contains the editable B project, never an unapplied AI preview.
  aiPreview=false;comparing=false;studio.setDesign(design);dirty=false;updateMeasurements();busy=true;const button=dialog.querySelector('[data-builder-next]');button.disabled=true;button.textContent='Сохраняем…';
  try{submitKey ||= crypto.randomUUID();const response=await fetch('/api/ring-requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:submitKey,design,email:emailState.email,name:emailState.name,comment:emailState.comment,consent:emailState.consent,company:panel.querySelector('[name=company]').value,preview:studio.snapshot()})});const result=await response.json();if(!response.ok)throw Error(result.error||'Не удалось сохранить заявку.');panel.innerHTML=`<div class="builder-success"><strong>ORIGIN / ${escape(result.reference)}</strong><h2>Эскиз и заявка сохранены.</h2><p>${result.delivery==='sent'?'Заявка отправлена.':'Заявка сохранена локально. Отправка писем ещё не подключена.'}</p><button type="button" data-mode="${method==='ai'?'ai':'edit'}">Вернуться к эскизу</button></div>`;button.hidden=true;status.textContent='Готово';}
  catch(error){status.textContent=error.message;}finally{busy=false;button.disabled=false;button.textContent=delivery?'Отправить заявку':'Сохранить заявку';}
 });
 async function activate(){active=true;renderPanel();if(!studio){try{studio=createRingStudio(canvas,{reduced,onAutoChange:value=>dialog.querySelector('[data-builder-auto]').setAttribute('aria-pressed',String(value))});studio.setDesign(shownDesign());studio.setView('perspective');}catch(error){status.textContent='3D недоступно. Проверьте поддержку WebGL.';console.error('ORIGIN customizer:',error);return;}}
  studio.setActive(true);studio.resize();dirty=true;status.textContent='Проект готов. Изменения видны в 3D.';focusHeading();
  try{const response=await fetch('/api/ring-config');if(response.ok){const config=await response.json();delivery=config.emailConfigured;aiConfig=config.ai||aiConfig;if(mode==='ai')renderPanel();}}catch{}
 }
 renderPanel();return {activate,setActive(value){active=value;studio?.setActive(value);},resize(){studio?.resize();},tick(time){if(!active)return;if(dirty&&studio){studio.setDesign(shownDesign());dirty=false;}studio?.tick(time);}};
}
