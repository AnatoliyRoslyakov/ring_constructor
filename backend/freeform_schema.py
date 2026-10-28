"""Contract for authored lofts, anchored galleries and fitted gemstone contacts."""
import math

class FreeformError(ValueError):pass

def number(v,lo,hi,name):
    if type(v) not in (int,float) or not math.isfinite(v) or not lo<=v<=hi:raise FreeformError('Недопустимое значение: '+name+'='+repr(v)[:80])
    return round(v,4)

def keys(v,allowed,name):
    if not isinstance(v,dict) or set(v)-set(allowed):raise FreeformError('Неверная структура: '+name)

def profile(v):
    if not isinstance(v,list) or not 6<=len(v)<=16:raise FreeformError('Сечение должно иметь 6–16 вершин.')
    pts=[]
    for p in v:
        if not isinstance(p,list) or len(p)!=2:raise FreeformError('Неверная вершина сечения.')
        pts.append([number(p[0],-1.25,1.25,'profile.x'),number(p[1],-1.25,1.25,'profile.y')])
    if any(math.dist(a,b)<.08 for a,b in zip(pts,pts[1:]+pts[:1])):raise FreeformError('Соседние вершины сечения слишком близки.')
    area=sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(pts,pts[1:]+pts[:1]))/2
    if abs(area)<.8:raise FreeformError('Сечение слишком узкое или вырожденное.')
    # Convex authored polygons yield reliable solid loft caps and positive thickness.
    turns=[(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]) for a,b,c in zip(pts,pts[1:]+pts[:1],pts[2:]+pts[:2])]
    if any(t*area<-.0001 for t in turns):raise FreeformError('Контур сечения пересекает себя или имеет обратные углы.')
    if min(p[0] for p in pts)>-.3 or max(p[0] for p in pts)<.3 or min(p[1] for p in pts)>-.3 or max(p[1] for p in pts)<.3:raise FreeformError('Сечение должно охватывать центр.')
    return pts if area>0 else list(reversed(pts))

def controls(v):
    if not isinstance(v,list) or not 1<=len(v)<=5:raise FreeformError('Кривая требует 1–5 промежуточных точек.')
    result=[]
    for p in v:
        if not isinstance(p,list) or len(p)!=3:raise FreeformError('Неверная точка кривой.')
        result.append([number(p[0],-2.5,2.5,'control.x'),number(p[1],-.4,1.5,'control.y'),number(p[2],-2.5,2.5,'control.z')])
    if any(math.dist(a,b)<.025 for a,b in zip(result,result[1:])):raise FreeformError('Точки кривой совпадают.')
    return result

def validate_part(stage,v,previous=None):
    previous=previous or {}
    if stage=='shank':
        keys(v,('bands',),'shank');bands=v.get('bands')
        if not isinstance(bands,list) or not 1<=len(bands)<=5:raise FreeformError('Шинка должна содержать 1–5 авторских контуров.')
        out=[];ids=set();closed=set()
        for b in bands:
            keys(b,('id','closed','join','stations','profile'),'band');name=b.get('id')
            if not isinstance(name,str) or not name.isascii() or not name.replace('-','').isalnum() or len(name)>24 or name in ids:raise FreeformError('Идентификаторы контуров должны быть короткими и уникальными.')
            ids.add(name)
            if type(b.get('closed')) is not bool:raise FreeformError('Укажите замкнутость контура.')
            points=b.get('stations')
            if not isinstance(points,list) or not (8 if b['closed'] else 3)<=len(points)<=24:raise FreeformError('Замкнутый контур требует 8–24 сечений, открытый — 3–24.')
            clean=[]
            for p in points:
                if not isinstance(p,list) or len(p)!=6:raise FreeformError('Сечение: [угол, отступ, смещение, ширина, толщина, поворот].')
                clean.append([number(n,*bounds,'station') for n,bounds in zip(p,[(0,359.99),(0,4),(-6,6),(.65,12),(.7,3),(-60,60)])])
            if any(b[0]-a[0]<4 for a,b in zip(clean,clean[1:])):raise FreeformError('Углы сечений должны возрастать с шагом не меньше 4°.')
            if b['closed']:
                if clean[0][0]!=0 or max([b[0]-a[0] for a,b in zip(clean,clean[1:])]+[360-clean[-1][0]])>90:raise FreeformError('Замкнутые контуры начинаются с 0° и покрывают весь круг без разрывов больше 90°.')
                closed.add(name)
            elif b.get('join') not in closed:raise FreeformError('Открытая ветвь должна соединяться с предыдущим замкнутым контуром.')
            out.append({'id':name,'closed':b['closed'],'stations':clean,'profile':profile(b.get('profile')),**({'join':b['join']} if not b['closed'] else {})})
        if not closed:raise FreeformError('Нужен хотя бы один замкнутый контур вокруг пальца.')
        return {'bands':out}
    if stage=='ornament':
        from .ornament_schema import validate_ornament
        return validate_ornament(v,previous.get('shank'),previous['basis'])
    if stage=='mount':
        if not previous.get('shank'):raise FreeformError('Сначала создайте шинку.')
        keys(v,('seat','links'),'mount');seat=v.get('seat');keys(seat,('depth','radius'),'seat')
        seat={'depth':number(seat.get('depth'),.07,.26,'seat.depth'),'radius':number(seat.get('radius'),.15,.5,'seat.radius')}
        links=v.get('links');ids={b['id'] for b in previous['shank']['bands']}
        if not isinstance(links,list) or not 2<=len(links)<=24:raise FreeformError('Оправа требует 2–24 соединений.')
        out=[];sides=set()
        for link in links:
            keys(link,('band','at','to','controls','radius','profile'),'link')
            if link.get('band') not in ids:raise FreeformError('Соединение ссылается на отсутствующий контур шинки.')
            angle=number(link.get('at'),15,165,'link.at');sides.add(angle<90)
            out.append({'band':link['band'],'at':angle,'to':number(link.get('to'),0,359.99,'link.to'),'controls':controls(link.get('controls')),'radius':number(link.get('radius'),.18,.9,'link.radius'),'profile':profile(link.get('profile'))})
        if len(sides)<2:raise FreeformError('Оправа должна соединяться с обеими сторонами шинки.')
        if not {b['id'] for b in previous['shank']['bands'] if b['closed']}<={l['band'] for l in out}:raise FreeformError('Нужно соединить с оправой каждый замкнутый контур шинки.')
        return {'seat':seat,'links':out}
    if stage=='setting':
        if not previous.get('mount'):raise FreeformError('Сначала создайте соединение с оправой.')
        keys(v,('claws','rims'),'setting');claws=v.get('claws',[]);rims=v.get('rims',[])
        if not isinstance(claws,list) or len(claws)>12 or not isinstance(rims,list) or len(rims)>4:raise FreeformError('Закрепка: до 12 крапанов и 4 ободков.')
        out=[]
        for claw in claws:
            keys(claw,('angle','root','controls','radius','tip','contact','profile'),'claw')
            out.append({'angle':number(claw.get('angle'),0,359.99,'claw.angle'),'root':number(claw.get('root'),0,359.99,'claw.root'),'controls':controls(claw.get('controls')),'radius':number(claw.get('radius'),.18,.55,'claw.radius'),'tip':number(claw.get('tip'),.35,1,'claw.tip'),'contact':number(claw.get('contact'),.04,.16,'claw.contact'),'profile':profile(claw.get('profile'))})
        clean_rims=[];full=False
        for rim in rims:
            keys(rim,('from','to','height','radius'),'rim');start=number(rim.get('from'),0,359.99,'rim.from');end=number(rim.get('to'),0,360,'rim.to')
            if end-start<20:raise FreeformError('Дуга ободка должна идти вперёд минимум на 20°.')
            full|=end-start>=350
            clean_rims.append({'from':start,'to':end,'height':number(rim.get('height'),.015,.10,'rim.height'),'radius':number(rim.get('radius'),.15,.5,'rim.radius')})
        angles=sorted(c['angle'] for c in out)
        if len(angles)>1 and min([b-a for a,b in zip(angles,angles[1:])]+[angles[0]+360-angles[-1]])<2:raise FreeformError('Позиции крапанов не должны совпадать.')
        if not full:
            # Opposing partial rims hold a stone without adding invented claws.
            merged=[]
            for rim in sorted(clean_rims,key=lambda r:r['from']):
                if merged and rim['from']<=merged[-1][1]:merged[-1][1]=max(merged[-1][1],rim['to'])
                else:merged.append([rim['from'],rim['to']])
            coverage=sum(b-a for a,b in merged)
            contacts=angles+[a+(b-a)*i/math.ceil((b-a)/10) for a,b in merged for i in range(math.ceil((b-a)/10)+1)]
            contacts=sorted(set(a%360 for a in contacts))
            gap=max([b-a for a,b in zip(contacts,contacts[1:])]+[contacts[0]+360-contacts[-1]]) if contacts else 360
            if not ((len(out)>=3 and gap<=175) or (coverage>=60 and gap<=150)):raise FreeformError('Закрепка должна охватывать камень: минимум три крапана или противоположные дуги ободка с суммарным охватом от 60° и просветами не больше 150°.')
        return {'claws':out,'rims':clean_rims}
    raise FreeformError('Неизвестный этап свободной генерации.')

def validate_freeform(v):
    if v is None:return None
    keys(v,('version','basis','shank','ornament','mount','setting','revision'),'freeform')
    if v.get('version')!=1:raise FreeformError('Неизвестная версия авторской геометрии.')
    basis=v.get('basis');keys(basis,('ringSize','width','thickness','gemSize','headLift'),'basis')
    clean_basis={key:number(basis.get(key),lo,hi,key) for key,(lo,hi) in {'ringSize':(14,23),'width':(1.5,12),'thickness':(1.2,3),'gemSize':(4,12),'headLift':(0,3)}.items()}
    out={'version':1,'basis':clean_basis,'revision':int(number(v.get('revision',1),1,10000,'revision')),'shank':None,'ornament':None,'mount':None,'setting':None}
    for stage in ('shank','ornament','mount','setting'):
        if v.get(stage) is not None:out[stage]=validate_part(stage,v[stage],out)
    return out
