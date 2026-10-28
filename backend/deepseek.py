"""Server-side DeepSeek adapter. Returns a validated declarative geometry recipe."""
from pathlib import Path
import os, json, math, base64, io, hashlib, copy, re, urllib.request, urllib.error, socket, threading, time, logging
from PIL import Image, ImageOps, UnidentifiedImageError
from .ring_schema import ROOT, SCHEMA, validate_design, RecipeError
from .ring_prompts import VISION_PROMPT, INTENT_PROMPT, REVIEW_PROMPT
STONES={row[0]:{'stoneId':row[0],'gem':row[2],'shape':row[3],'gemSize':row[4]} for row in json.loads((ROOT/'src/constructor/stones.json').read_text())}
_LOCK=threading.Lock();_BUSY=threading.BoundedSemaphore(2);_TIMES=[]
_REFERENCES={};_INFLIGHT={};_STAGES={};_STAGE_INFLIGHT={}
class AIError(Exception):
    def __init__(self,message,status=502,retryable=None):
        super().__init__(message);self.status=status
        self.retryable=status in (429,502,503,504) if retryable is None else retryable

def settings():
    values={}
    file=ROOT/'.env'
    if file.is_file():
        for line in file.read_text().splitlines():
            if '=' in line and not line.lstrip().startswith('#'):
                key,value=line.split('=',1);values[key.strip()]=value.strip().strip('"\'')
    key=os.environ.get('DEEPSEEK_API_KEY') or values.get('DEEPSEEK_API_KEY','')
    model=os.environ.get('DEEPSEEK_MODEL') or values.get('DEEPSEEK_MODEL','deepseek-flash')
    return key,model if model in ('deepseek-flash','deepseek-v4-pro') else 'deepseek-flash'

def capabilities():
    key,model=settings()
    return {'configured':bool(key),'provider':'DeepSeek','model':model,'visionModel':'deepseek-flash','recipeVersion':2}

def _photo(value):
    if not value:return None
    if not isinstance(value,str) or len(value)>2800000 or not value.startswith(('data:image/jpeg;base64,','data:image/png;base64,','data:image/webp;base64,')): raise AIError('Загрузите JPG, PNG или WebP до 2 МБ.',400)
    try: raw=base64.b64decode(value.split(',',1)[1],validate=True)
    except (ValueError,IndexError): raise AIError('Не удалось прочитать фотографию.',400)
    valid=raw.startswith(b'\xff\xd8\xff') or raw.startswith(b'\x89PNG\r\n\x1a\n') or (raw[:4]==b'RIFF' and raw[8:12]==b'WEBP')
    if not valid or len(raw)>2000000: raise AIError('Некорректная фотография.',400)
    return value

def generate(body):
    # A disconnected browser can resume the same stage without paying for it twice.
    if not isinstance(body,dict):raise AIError('Некорректный запрос эскиза.',400)
    digest=hashlib.sha256(json.dumps(body,sort_keys=True,ensure_ascii=False).encode()).hexdigest()
    with _LOCK:
        now=time.monotonic()
        for stale in [k for k,(expires,_) in _STAGES.items() if expires<now]:_STAGES.pop(stale,None)
        if digest in _STAGES:return copy.deepcopy(_STAGES[digest][1])
        event=_STAGE_INFLIGHT.get(digest);owner=event is None
        if owner:event=threading.Event();_STAGE_INFLIGHT[digest]=event
    if not owner:
        if not event.wait(185):raise AIError('Этап ещё создаётся. Проверяем готовность автоматически.',504)
        with _LOCK:
            cached=_STAGES.get(digest)
            if cached:return copy.deepcopy(cached[1])
        raise AIError('Соединение прервалось. Повторяем незавершённый этап.',502)
    try:
        result=_generate(body)
        with _LOCK:
            _STAGES[digest]=(time.monotonic()+1800,copy.deepcopy(result))
            while len(_STAGES)>24:_STAGES.pop(next(iter(_STAGES)))
        return result
    finally:
        with _LOCK:_STAGE_INFLIGHT.pop(digest,None);event.set()

def _generate(body):
    key,model=settings()
    if not key: raise AIError('Добавьте DEEPSEEK_API_KEY в локальный .env и повторите запрос.',503,retryable=False)
    if not isinstance(body,dict) or body.get('consent') is not True: raise AIError('Подтвердите отправку описания и фото в DeepSeek.',400)
    prompt=body.get('prompt','')
    if not isinstance(prompt,str) or len(prompt)>4000:raise AIError('Описание: до 4000 символов.',400)
    prompt=prompt.strip()
    stage=body.get('stage','prepare')
    if stage not in ('prepare','shank','ornament','mount','setting'):raise AIError('Неизвестный этап генерации.',400)
    photo=_photo(body.get('photo'))
    if type(body.get('reanalyze',False)) is not bool:raise AIError('Некорректный режим распознавания.',400)
    try: current=validate_design(body.get('design',{}))
    except RecipeError as e: raise AIError(str(e),400)
    if not prompt:
        if photo:prompt='Повтори кольцо с картинки'
        elif stage!='prepare' and current.get('freeform'):prompt='Сохрани существующее кольцо и внеси только указанные изменения.'
        else:raise AIError('Добавьте фотографию или опишите вашу идею.',400)
    body={**body,'prompt':prompt}
    preferences=body.get('preferences',{})
    allowed_preferences={'metal','gem','shape','setting','ringSize','gemSize','width','thickness','headLift','finish','halo','pave','paveRows','orientation','centerStone','ornament','openwork'}
    if not isinstance(preferences,dict) or set(preferences)-allowed_preferences:raise AIError('Неизвестные параметры генерации.',400)
    def with_preferences(design):
        values={**design,**preferences}
        if 'shape' in preferences:values['gemRatio']=SCHEMA['shapeRatios'].get(preferences['shape'],1) if isinstance(preferences['shape'],str) else 1
        if values['metal']=='platinum':values['purity']='950'
        elif values['purity']=='950':values['purity']='750'
        try:return validate_design(values)
        except RecipeError as error:raise AIError(str(error),400) from error
    current=with_preferences(current)
    locked=None
    if body.get('stone'):
        stone=body['stone']
        if not isinstance(stone,dict) or set(stone)-{'id','gem','shape','gemSize'}: raise AIError('Некорректный выбранный камень.',400)
        if stone.get('id') not in STONES: raise AIError('Выберите камень из библиотеки.',400)
        locked=dict(STONES[stone['id']])
    if not _BUSY.acquire(blocking=False): raise AIError('Два эскиза уже готовятся. Повторите чуть позже.',429)
    try:
        with _LOCK:
            now=time.monotonic();_TIMES[:]=[t for t in _TIMES if now-t<3600]
            if len(_TIMES)>=120: raise AIError('Лимит AI-запросов на этот час исчерпан. Повторите позже.',429,retryable=False)
            _TIMES.append(now)
        started=time.monotonic();usage={'totalTokens':0,'calls':0};deadline=started+180
        reference=None
        if photo and stage=='prepare':
            reference=_reference_analysis(key,photo,usage,deadline,refresh=body.get('reanalyze',False))
        elif photo:
            # The accepted recipe is authoritative after preparation. A cache miss must
            # not rerun recognition halfway through a build and reinterpret the ring.
            digest=hashlib.sha256((VISION_PROMPT+REVIEW_PROMPT+photo).encode()).hexdigest()
            with _LOCK:
                cached=_REFERENCES.get(digest)
                if cached and cached[0]>time.monotonic():reference=copy.deepcopy(cached[1])
        if stage!='prepare':
            from .freeform_ai import generate_part
            if locked:current=validate_design({**current,**locked,'centerStone':True})
            if stage in ('mount','setting') and photo and reference:photo=_head_crop(photo,reference.get('headBox'))
            result=generate_part(stage,body,current,reference,key=key,model='deepseek-flash' if photo else model,chat=_chat,usage=usage,deadline=deadline,photo=photo)
            result['elapsed']=round(time.monotonic()-started,1)
            return result
        request={'request':prompt.strip()}
        if reference:request['referenceAnalysis']=reference
        exact_copy=photo and re.fullmatch(r'(?:повтори|воссоздай|скопируй)(?: это)?(?: кольцо)? (?:с|по) (?:картинки|картинке|фото|фотографии|изображения|изображению|эскиза|эскизу)[.!]?',prompt.strip(),re.I)
        intent={'features':{}} if exact_copy else _extract(key,model,INTENT_PROMPT,json.dumps(request,ensure_ascii=False),usage,deadline,source=prompt.strip())
        design,recognition=compile_design(reference,intent,prompt.strip(),current,locked)
        design=with_preferences(design)
        if locked:design['centerStone']=True
        title=f"{SCHEMA['choices']['shape'][design['shape']]} · {SCHEMA['choices']['gem'][design['gem']]}" if design['centerStone'] else 'Кольцо без центрального камня'
        explanation='Кольцо без центрального камня. '+SCHEMA['choices']['ornament'][design['ornament']]+'.' if not design['centerStone'] else ' '.join([f"{SCHEMA['choices']['shank'][design['shank']]} шинка, {SCHEMA['choices']['setting'][design['setting']].lower()} закрепка.",
            f"{design['prongs']} крапана." if design['setting'] not in ('bezel','halfbezel','tension') else '',
            f"Ореол: {SCHEMA['choices']['halo'][design['halo']].lower()}. Дорожка: {SCHEMA['choices']['pave'][design['pave']].lower()}."])
        return {'title':title,'explanation':explanation,'design':design,'recognition':recognition,'provider':'DeepSeek','model':model,'elapsed':round(time.monotonic()-started,1),'usage':usage,'recipeVersion':2,'pipelineVersion':5}
    finally:_BUSY.release()


def _reference_analysis(key,photo,usage,deadline,refresh=False):
    """Bounded memory-only cache; text edits cannot randomly change a recognized image."""
    digest=hashlib.sha256((VISION_PROMPT+REVIEW_PROMPT+photo).encode()).hexdigest()
    with _LOCK:
        now=time.monotonic()
        for stale in [name for name,(expires,_) in _REFERENCES.items() if expires<now]:_REFERENCES.pop(stale,None)
        if not refresh and digest in _REFERENCES:
            usage['referenceCached']=True;return copy.deepcopy(_REFERENCES[digest][1])
        event=_INFLIGHT.get(digest);owner=event is None
        if owner:
            event=threading.Event();_INFLIGHT[digest]=event
            if refresh:_REFERENCES.pop(digest,None)
    if not owner:
        if not event.wait(max(0,deadline-time.monotonic())):raise AIError('Проверка изображения ещё не завершена. Попробуйте позже.',504)
        with _LOCK:
            cached=_REFERENCES.get(digest)
            if cached:usage['referenceCached']=True;return copy.deepcopy(cached[1])
        raise AIError('Не удалось завершить проверку изображения. Попробуйте другой ракурс.',422)
    try:
        reference=_extract(key,'deepseek-flash',VISION_PROMPT,[{'type':'text','text':'Inspect this ring reference. Return observable features only.'},{'type':'image_url','image_url':{'url':photo,'detail':'original'}}],usage,deadline,vision=True)
        if reference.get('subject')!='ring':raise AIError('На изображении не удалось уверенно определить кольцо. Загрузите чёткий эскиз или крупный план одного кольца.',422)
        no_center=reference['features'].get('centerStone',{})
        if no_center.get('value') is False and no_center.get('confidence',0)>=.65:
            reference['headBox']=None
        elif any(reference['features'].get(k,{}).get('confidence',0)<.82 for k in ('setting','halo','width','pave',*(['prongs'] if reference['features'].get('setting',{}).get('value') not in ('bezel','halfbezel','tension') else []),*(['paveRows'] if reference['features'].get('pave',{}).get('value')!='none' else []))) or reference['features'].get('prongStyle',{}).get('value')=='double':
            closeup=_head_crop(photo,reference.get('headBox'))
            review=_extract(key,'deepseek-flash',REVIEW_PROMPT,[{'type':'text','text':'Image1: whole ring, check band width and parallel pave rows. Image2: head crop, check halo and actual claw tips. Tip coordinates refer to image2.'},{'type':'image_url','image_url':{'url':photo,'detail':'original'}},{'type':'image_url','image_url':{'url':closeup,'detail':'original'}}],usage,deadline,vision=True)
            reference=merge_observations(reference,review)
        with _LOCK:
            _REFERENCES[digest]=(time.monotonic()+3600,copy.deepcopy(reference))
            while len(_REFERENCES)>8:_REFERENCES.pop(next(iter(_REFERENCES)))
        return reference
    finally:
        with _LOCK:_INFLIGHT.pop(digest,None);event.set()


def _chat(key,model,messages,usage,deadline,vision=False,reason=False,max_tokens=None):
    remaining=deadline-time.monotonic()
    if remaining<2:raise AIError('Распознавание заняло слишком много времени. Текущий проект сохранён.',504)
    payload={'model':model,'messages':messages,'response_format':{'type':'json_object'},'max_tokens':max_tokens or (6144 if reason else 4096),
             'thinking':{'type':'enabled' if reason else 'disabled'}}
    if reason:payload['reasoning_effort']='low'
    else:payload['temperature']=.1
    request=urllib.request.Request('https://api.deepseek.com/chat/completions',data=json.dumps(payload).encode(),headers={'Authorization':'Bearer '+key,'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(request,timeout=min(75,remaining)) as response:raw=response.read(350000)
        result=json.loads(raw);choice=result['choices'][0];usage['calls']+=1;usage['totalTokens']+=result.get('usage',{}).get('total_tokens',0)
        if choice.get('finish_reason')=='length':raise RecipeError('Ответ оборван: сократите описание, не перечисляйте ненужные свойства.')
        answer=json.loads(choice['message']['content'])
        if not isinstance(answer,dict):raise RecipeError('Ответ должен быть JSON-объектом.')
        return answer
    except urllib.error.HTTPError as e:
        if e.code==401:raise AIError('DeepSeek отклонил API-ключ. Проверьте локальный .env.',502,retryable=False)
        if e.code==402:raise AIError('На аккаунте DeepSeek недостаточно средств.',502,retryable=False)
        if e.code==429:raise AIError('DeepSeek временно ограничил запросы. Попробуйте позже.',429)
        raise AIError('DeepSeek не смог обработать запрос. Повторите позже.',502)
    except (socket.timeout,TimeoutError):raise AIError('DeepSeek не ответил вовремя. Ваш текущий эскиз сохранён.',504)
    except urllib.error.URLError:raise AIError('Не удалось связаться с DeepSeek. Проверьте соединение.',502)
    except RecipeError:raise
    except (ValueError,KeyError,TypeError,IndexError) as e:raise RecipeError('Некорректный JSON ответа.') from e


def _feature_value(key,value):
    if key in SCHEMA['choices'] and key!='scene':
        if not isinstance(value,str) or value not in SCHEMA['choices'][key]:raise RecipeError('Неизвестный вариант: '+key)
    elif key in SCHEMA['ranges'] and key!='ringSize':
        low,high=SCHEMA['ranges'][key]
        if type(value) not in (int,float) or not math.isfinite(value) or not low<=value<=high:raise RecipeError('Размер вне диапазона: '+key)
    elif key in ('centerStone','openwork'):
        if type(value) is not bool:raise RecipeError('centerStone должен быть true или false.')
    elif key=='prongs':
        if type(value) is not int or value not in (4,6,8):raise RecipeError('Неверное количество крапанов.')
    elif key=='purity':
        if value not in ('585','750','950'):raise RecipeError('Неверная проба.')
    elif key=='engraving':
        if not isinstance(value,str) or len(value)>24:raise RecipeError('Неверная гравировка.')
    else:raise RecipeError('Неизвестное свойство распознавания: '+key)
    return value


def _head_crop(photo,box):
    if box is None:return photo
    try:
        with Image.open(io.BytesIO(base64.b64decode(photo.split(',',1)[1]))) as source:
            if source.width*source.height>20000000:raise AIError('Изображение слишком большое. Уменьшите его до 1600 пикселей.',400)
            image=ImageOps.exif_transpose(source).convert('RGB');w,h=image.size
            left,top,right,bottom=box;mx=(right-left)*.08;my=(bottom-top)*.08
            image=image.crop((max(0,int((left-mx)*w)),max(0,int((top-my)*h)),min(w,int((right+mx)*w)),min(h,int((bottom+my)*h))))
            scale=min(2,1200/max(image.size));image=image.resize((max(1,round(image.width*scale)),max(1,round(image.height*scale))),Image.Resampling.LANCZOS)
            buffer=io.BytesIO();image.save(buffer,format='JPEG',quality=94)
            return 'data:image/jpeg;base64,'+base64.b64encode(buffer.getvalue()).decode()
    except (UnidentifiedImageError,Image.DecompressionBombError,OSError,ValueError):raise AIError('Не удалось прочитать изображение для проверки деталей.',400)


def merge_observations(first,review):
    if review.get('subject')!='ring':raise AIError('Два этапа распознавания не смогли подтвердить силуэт. Загрузите более чёткий эскиз.',422)
    result={**first,'features':dict(first['features']),'uncertain':list(first.get('uncertain',[]))}
    for color in ('visibleGemColor','visibleMetalColor'):
        if review.get(color,'unknown')!='unknown':result[color]=review[color]
    if review.get('imageType')=='photo' and first.get('imageType')=='cad':result['imageType']='photo'
    for key,item in review['features'].items():
        before=result['features'].get(key)
        if before is None or item['confidence']>=before['confidence']:
            if before and before['value']!=item['value'] and before['confidence']>=.8 and item['confidence']>=.8:
                result['uncertain'].append('Два ракурса допускают разное прочтение: '+key+'. Использован результат проверки; уточните параметр при необходимости.')
            result['features'][key]=item
    result['fullPaveVisible']=first.get('fullPaveVisible',False) and review.get('fullPaveVisible',False)
    groups=review.get('clawGroups',[])
    if len(groups) in (4,6,8):
        result['features']['prongs']={'value':len(groups),'confidence':.95,'evidence':'Позиции крапанов проверены по видимым кончикам на увеличенном фрагменте.'}
        if sum(len(group['tips'])==2 for group in groups)>=len(groups)*.75:
            result['features']['prongStyle']={'value':'double','confidence':.95,'evidence':'В каждой угловой позиции видны два соседних кончика крапанов.'}
    result['unsupported']=list(dict.fromkeys(first.get('unsupported',[])+review.get('unsupported',[])))[:12]
    return result


def _validate_extraction(answer,vision=False):
    allowed={'subject','summary','features','uncertain','unsupported','imageType','fullPaveVisible','headBox','clawGroups','visibleGemColor','visibleMetalColor'} if vision else {'features','unsupported'}
    if set(answer)-allowed or not isinstance(answer.get('features'),dict):raise RecipeError('Неверная структура распознавания.')
    if vision and (answer.get('subject') not in ('ring','not_ring','unclear') or not isinstance(answer.get('summary'),str)):raise RecipeError('Не определён предмет изображения.')
    if vision and (answer.get('imageType','sketch') not in ('cad','sketch','photo','mixed') or type(answer.get('fullPaveVisible',False)) is not bool):raise RecipeError('Не определён тип изображения.')
    if answer.get('visibleGemColor','unknown') not in ('clear','blue','green','red','purple','pink','yellow','unknown') or answer.get('visibleMetalColor','unknown') not in ('silver','yellow','rose','nonmetal','unknown'):raise RecipeError('Неизвестный наблюдаемый цвет.')
    if answer.get('headBox') is not None:
        box=answer['headBox']
        if not isinstance(box,list) or len(box)!=4 or any(type(n) not in (int,float) or not math.isfinite(n) or not 0<=n<=1 for n in box) or box[2]-box[0]<.04 or box[3]-box[1]<.04:raise RecipeError('Неверная область центрального камня.')
    groups=answer.get('clawGroups',[])
    if not isinstance(groups,list) or len(groups)>8:raise RecipeError('Неверные позиции крапанов.')
    locations=[]
    for group in groups:
        if not isinstance(group,dict) or set(group)!={'tips'} or not isinstance(group['tips'],list) or not 1<=len(group['tips'])<=2:raise RecipeError('Неверная группа кончиков крапана.')
        for point in group['tips']:
            if not isinstance(point,list) or len(point)!=2 or any(type(n) not in (int,float) or not math.isfinite(n) or not 0<=n<=1 for n in point):raise RecipeError('Неверная точка крапана.')
            if any(math.dist(point,previous)<.012 for previous in locations):raise RecipeError('Один кончик крапана посчитан дважды.')
            locations.append(point)
    for key,item in answer['features'].items():
        if not isinstance(item,dict) or set(item)-({'value','evidence','confidence'} if vision else {'value','evidence'}):raise RecipeError('Неверная структура признака: '+key)
        _feature_value(key,item.get('value'))
        if not isinstance(item.get('evidence'),str) or not 1<=len(item['evidence'])<=400:raise RecipeError('Нет основания для признака: '+key)
        if vision and (type(item.get('confidence')) not in (int,float) or not math.isfinite(item['confidence']) or not 0<=item['confidence']<=1):raise RecipeError('Неверная уверенность признака.')
    for field in ('uncertain','unsupported'):
        if field in answer and (not isinstance(answer[field],list) or len(answer[field])>12 or any(not isinstance(s,str) or len(s)>300 for s in answer[field])):raise RecipeError('Неверное пояснение: '+field)
    return answer


def _extract(key,model,system,content,usage,deadline,vision=False,source=None,reason_first=False):
    messages=[{'role':'system','content':system},{'role':'user','content':content}]
    # A single bounded schema repair, not a silent fallback to another ring.
    for attempt in range(2):
        try:
            answer=_validate_extraction(_chat(key,model,messages,usage,deadline,vision,reason=vision and (reason_first or attempt>0)),vision)
            if source:
                for field,item in answer['features'].items():
                    if item['evidence'].casefold() not in source.casefold():raise RecipeError('evidence for '+field+' is not a literal substring: '+item['evidence']+'. Quote the entire original clause without ellipsis, or omit this field.')
            return answer
        except RecipeError as error:
            usage.setdefault('repairs',[]).append(str(error))
            logging.getLogger(__name__).warning('Reference validation (attempt %s): %s',attempt+1,error)
            if attempt:raise AIError('AI не смог надёжно разобрать признаки кольца. Уточните описание или выберите другой ракурс.',422) from error
            messages.append({'role':'user','content':'The previous response failed the contract: '+str(error)+'. Return a complete corrected JSON object, using only allowed properties. Do not invent missing features.'})


def compile_design(reference,intent,prompt,current,locked=None):
    """Deterministic priority: neutral base < observed features < explicit text < catalog stone.

    Raw AI paths never enter geometry. Unknown features remain visible as assumptions.
    """
    values={};matched=[];uncertain=list(reference.get('uncertain',[])) if reference else []
    limitations=list(reference.get('unsupported',[])) if reference else []
    conflicts=[]
    observation_summary=''
    if reference:
        _validate_extraction(reference,True)
        physical_colors=reference.get('visibleMetalColor') in ('silver','yellow','rose')
        for key,item in reference['features'].items():
            if reference.get('imageType')=='cad' and not physical_colors and key in ('metal','gem','finish','purity','engraving'):
                continue
            threshold=.85 if key in ('finish','purity','engraving') else .5 if key in ('gemRatio','width') else .65
            if item['confidence']>=threshold:
                values[key]=item['value'];matched.append({'parameter':key,'value':item['value'],'evidence':item['evidence']})
            else:uncertain.append(f"{SCHEMA['choices'].get(key,{}).get(item['value'],key)}: {item['evidence']}")
        if values.get('pave')=='full' and not reference.get('fullPaveVisible'):
            values['pave']='shoulders'
            matched=[{**f,'value':'shoulders'} if f['parameter']=='pave' else f for f in matched]
            uncertain.append('Паве на невидимой нижней части шинки не подтверждено; сохранена дорожка на плечах.')
        if not any(key in values for key in ('shape','shank','setting','halo','centerStone','ornament')):raise AIError('Силуэт кольца плохо различим. Нужен более крупный и чёткий ракурс.',422)
        if 'prongs' not in values and 'prongs' in reference['features'] and reference['features']['prongs']['confidence']>=.5:
            values['prongs']=reference['features']['prongs']['value']
            uncertain.append(f"Число крапанов предварительно принято равным {values['prongs']} по видимым позициям; скрытая сторона не подтверждена.")
        if physical_colors:
            if 'gem' not in values:
                proxy={'clear':'diamond','blue':'sapphire','green':'emerald','red':'ruby','purple':'amethyst','pink':'morganite','yellow':'citrine'}.get(reference.get('visibleGemColor'))
                if proxy:values['gem']=proxy
            if 'metal' not in values:values['metal']={'silver':'white','yellow':'yellow','rose':'rose'}[reference['visibleMetalColor']]
        parts=[]
        for field in ('shape','setting','halo','pave','sideStones'):
            if field in values:parts.append(SCHEMA['choices'][field][values[field]])
        if values.get('pave','none')!='none' and 'paveRows' in values:parts.append(SCHEMA['choices']['paveRows'][values['paveRows']]+' паве')
        if 'prongs' in values and values.get('setting') not in ('bezel','halfbezel','tension'):parts.append(str(values['prongs'])+' позиции крапанов')
        if values.get('centerStone') is False:parts.insert(0,'без центрального камня')
        if values.get('ornament','none')!='none':parts.append(SCHEMA['choices']['ornament'][values['ornament']]+' орнамент')
        observation_summary='По изображению: '+', '.join(parts).lower()+'.'
    _validate_extraction(intent)
    for key,item in intent['features'].items():
        if item['evidence'].casefold() not in prompt.casefold():raise AIError('AI не подтвердил изменения вашим описанием. Уточните желаемые изменения.',422)
        values[key]=item['value']
    limitations.extend(intent.get('unsupported',[]))
    # Preserve no unrelated features from the project opened before this request.
    design={**SCHEMA['defaults'],**values,'accents':[],'stoneId':''}
    if 'gemRatio' not in values:design['gemRatio']=SCHEMA['shapeRatios'][design['shape']]
    if design['shank']=='pave' and design['pave']=='none':design['pave']='shoulders'
    if locked:
        if reference and any(k in values and values[k]!=locked[k] for k in ('gem','shape','gemSize')):
            conflicts.append('Выбранный камень из библиотеки заменяет центральный камень референса. Для повторения формы на фото снимите фиксацию камня.')
        design.update(locked);design['centerStone']=True;design['gemRatio']=SCHEMA['shapeRatios'][design['shape']]
    if design['ornament']!='none' and 'finish' not in values:design['finish']='satin'
    if not design['centerStone'] and design['ornament']!='none' and 'width' not in values:
        design['width']=5.5
        uncertain.append('Ширина орнаментального кольца предварительно принята 5.5 мм; её можно изменить.')
    if not design['centerStone']:
        design.update(halo='none',sideStones='none',stoneId='')
    if design['metal']=='platinum':design['purity']='950'
    elif design['purity']=='950':design['purity']='750'
    design.update({key:current[key] for key in ('ringSize','sizeKnown','scene')})
    design=validate_design(design)
    if design['sideShape']=='halfmoon':limitations=[note for note in limitations if not any(word in note.casefold() for word in ('полумеся','полумесяч','halfmoon'))]
    if design['sideShape']=='trapezoid':limitations=[note for note in limitations if not any(word in note.casefold() for word in ('трапец','trapezoid'))]
    missing=[key for key in ('gemSize','width','thickness') if key not in values and not (locked and key=='gemSize')]
    if missing:uncertain.append('Размеры без отметок на эскизе взяты как исходные пропорции; их можно уточнить в параметрах.')
    if reference and any(key not in values for key in ('gem','metal')):uncertain.append('Цвета CAD и чёрно-белого эскиза не определяют материал. Неуказанные материалы приняты нейтральными.')
    return design,{'summary':observation_summary, 'matched':matched,
                   'uncertain':list(dict.fromkeys(uncertain))[:12],'limitations':list(dict.fromkeys(limitations))[:12],'conflicts':conflicts}
