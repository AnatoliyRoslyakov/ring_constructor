"""Small, bounded graph of authored relief paths; no external models or source execution."""
import math,re
from .freeform_schema import number,keys,FreeformError

def validate_ornament(value,shank,basis):
    if not shank:raise FreeformError('Орнаменту нужна основа кольца.')
    keys(value,('repeat','offset','motifs'),'ornament')
    repeat=value.get('repeat')
    if type(repeat) is not int or not 1<=repeat<=20:raise FreeformError('Повтор орнамента: от 1 до 20.')
    motifs=value.get('motifs')
    if not isinstance(motifs,list) or not 1<=len(motifs)<=16 or repeat*len(motifs)>128:raise FreeformError('Орнамент: от 1 до 16 авторских элементов.')
    nodes={b['id'] for b in shank['bands']};edges=[(b['id'],b['join']) for b in shank['bands'] if not b['closed']];out=[];points_count=0
    for mi,item in enumerate(motifs):
        if isinstance(item,dict) and item.get('kind')=='scroll':
            keys(item,('id','kind','anchor','endAnchor','depth','ridge','center','radii','start','turns','clockwise','width','tip'),'scroll')
            center=item.get('center');radii=item.get('radii')
            if not isinstance(center,list) or len(center)!=3 or not isinstance(radii,list) or len(radii)!=2:raise FreeformError('Scroll needs center[u,v,h] and radii[alongMm,acrossMm].')
            u,v,h=[number(n,*bounds,'scroll.center') for n,bounds in zip(center,[(-.25,1.25),(-1,1),(0,2.8)])]
            rx,ry=[number(n,.65,2.5,'scroll.radius') for n in radii];start=math.radians(number(item.get('start',0),-360,360,'scroll.start'));turns=number(item.get('turns',1.1),.6,1.6,'scroll.turns');width=number(item.get('width'),.3,1.8,'scroll.width');tip=number(item.get('tip',.45),.2,.8,'scroll.tip')
            if type(item.get('clockwise',True)) is not bool:raise FreeformError('scroll.clockwise must be boolean.')
            cell=math.pi*(basis['ringSize']+basis['thickness']*1.16)/repeat
            path=[]
            for i in range(24):
                t=i/23;r=1-.6*t;a=start+(-1 if item.get('clockwise',True) else 1)*t*turns*math.tau
                path.append([round(u+math.cos(a)*rx*r/cell,4),round(v+math.sin(a)*ry*r/(basis['width']*.5),4),h,round(width*(1-(1-tip)*t),4)])
            item={k:v for k,v in item.items() if k in ('id','anchor','endAnchor','depth','ridge')};item.update(kind='curve',path=path)
        keys(item,('id','kind','anchor','endAnchor','depth','ridge','lobes','path'),'motif')
        name=item.get('id');kind=item.get('kind');anchor=item.get('anchor');end=item.get('endAnchor')
        if not isinstance(name,str) or not re.fullmatch(r'[A-Za-z0-9-]{1,24}',name) or name in nodes:raise FreeformError('Неверное имя элемента орнамента.')
        if kind not in ('curve','leaf'):raise FreeformError('Элемент орнамента: curve или leaf.')
        if anchor not in nodes or end is not None and end not in nodes:raise FreeformError('Орнамент должен соединяться с основой или предыдущим элементом.')
        lobes=item.get('lobes',0)
        if type(lobes) is not int or not 0<=lobes<=4:raise FreeformError('Лист: от 0 до 4 долей.')
        path=item.get('path')
        if not isinstance(path,list) or not 3<=len(path)<=24:raise FreeformError('Путь орнамента: 3–24 точки.')
        clean=[]
        for pi,p in enumerate(path):
            if not isinstance(p,list) or len(p)!=4:raise FreeformError('Точка: [вдоль ячейки, поперёк кольца, высота, ширина].')
            clean.append([number(n,*bounds,f'motifs[{mi}].path[{pi}].{label} expected {bounds}') for n,bounds,label in zip(p,[(-.75,1.75),(-1.4,1.4),(0,2.8),(.03,3.5)],['u','v','h','width'])])
        if any(math.dist(a[:3],b[:3])<.012 for a,b in zip(clean,clean[1:])):raise FreeformError('Точки орнамента слишком близки.')
        if kind=='leaf' and clean[-1][3]>.18:raise FreeformError('Кончик листа должен сужаться до 0.18 мм.')
        rails={b['id']:b for b in shank['bands']}
        for aid,point in [(anchor,clean[0])]+([(end,clean[-1])] if end else []):
            if aid in rails:
                rail=rails[aid];target=sum(p[2] for p in rail['stations'])/len(rail['stations'])/(basis['width']*.5)
                if abs(point[1]-target)>.35:raise FreeformError(f'Motif {name} anchor {aid}: v must be near {target:.3f}, not {point[1]}. Set the endpoint near that edge rail; use v=-1..1, NOT0..1.')
        points_count+=len(clean);edges.append((name,anchor))
        if end is not None:edges.append((name,end))
        nodes.add(name)
        out.append({'id':name,'kind':kind,'anchor':anchor,**({'endAnchor':end} if end is not None else {}),'depth':number(item.get('depth'),.15,1.8,'motif.depth'),'ridge':number(item.get('ridge',.6),0,1,'motif.ridge'),'lobes':lobes,'path':clean})
    if points_count*repeat>2200:raise FreeformError('Слишком сложный орнамент: уменьшите повторы или число точек.')
    # Every closed rail belongs to the same connected motif graph.
    rails=[b['id'] for b in shank['bands'] if b['closed']];visited={rails[0]}
    for _ in range(len(nodes)):
        for a,b in edges:
            if a in visited or b in visited:visited.update((a,b))
    if not nodes<=visited:raise FreeformError('Контуры основы и орнамент должны быть соединены.')
    return {'repeat':repeat,'offset':number(value.get('offset',0),0,359.99,'ornament.offset'),'motifs':out}

def fit_coverage(part,shank,basis,target):
    """Bounded CPU footprint fit: thicken authored strokes, retain actual open areas."""
    from PIL import Image,ImageDraw
    import copy
    length=math.pi*(basis['ringSize']+basis['thickness']*1.16)/part['repeat'];width=basis['width'];scale=24
    w=max(24,round(length*scale));h=max(24,round(width*scale))
    def coverage(value):
        image=Image.new('1',(w,h));draw=ImageDraw.Draw(image)
        for band in shank['bands']:
            offset=sum(p[2] for p in band['stations'])/len(band['stations']);thick=sum(p[3] for p in band['stations'])/len(band['stations']);y=(offset+width*.5)*scale
            draw.rectangle((0,y-thick*scale*.5,w,y+thick*scale*.5),fill=1)
        for m in value['motifs']:
            for a,b in zip(m['path'],m['path'][1:]):
                ax,ay=a[0]*length*scale,(a[1]+1)*width*.5*scale;bx,by=b[0]*length*scale,(b[1]+1)*width*.5*scale
                for shift in (-w,0,w):
                    r=(a[3]+b[3])*.25*scale;draw.line((ax+shift,ay,bx+shift,by),fill=1,width=max(1,round(r*2)))
                    for x,y in ((ax+shift,ay),(bx+shift,by)):draw.ellipse((x-r,y-r,x+r,y+r),fill=1)
        return sum(image.getdata())/(w*h)
    if coverage(part)>=target:return part
    best=part
    for factor in (1.15,1.35,1.6,1.9,2.2):
        candidate=copy.deepcopy(part)
        for m in candidate['motifs']:
            for i,p in enumerate(m['path']):p[3]=round(min(.18 if m['kind']=='leaf' and i==len(m['path'])-1 else 3.5 if m['kind']=='leaf' else 2,p[3]*factor),4)
        filled=coverage(candidate)
        if filled>.88:break
        best=candidate
        if filled>=target:break
    return best
