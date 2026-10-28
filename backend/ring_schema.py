"""Shared, bounded RingRecipe v2 validation. No generated source is executed."""
from pathlib import Path
import json, math, re
ROOT=Path(__file__).resolve().parents[1]
SCHEMA=json.loads((ROOT/'src/constructor/schema.json').read_text())
class RecipeError(ValueError): pass

def validate_design(value, *, partial=False):
    if not isinstance(value,dict): raise RecipeError('Параметры должны быть объектом.')
    result=dict(SCHEMA['defaults']);result['accents']=[]
    allowed=set(result)
    if set(value)-allowed: raise RecipeError('Рецепт содержит неизвестные параметры.')
    for key,options in SCHEMA['choices'].items():
        if key in value:
            if not isinstance(value[key],str) or value[key] not in options: raise RecipeError('Неизвестный вариант: '+key)
            result[key]=value[key]
    for key,(low,high) in SCHEMA['ranges'].items():
        if key in value:
            number=value[key]
            if isinstance(number,bool) or not isinstance(number,(int,float)) or not math.isfinite(number) or not low<=number<=high: raise RecipeError('Размер вне диапазона: '+key)
            result[key]=round(number,3)
    if 'prongs' in value and (type(value['prongs']) is not int or value['prongs'] not in (4,6,8)): raise RecipeError('Неверное количество крапанов.')
    result['prongs']=value.get('prongs',6)
    result['purity']=value.get('purity','750')
    if result['metal']=='platinum': result['purity']='950'
    if result['purity'] not in ('585','750','950') or (result['metal']=='platinum')!=(result['purity']=='950'): raise RecipeError('Проба не соответствует металлу.')
    result['sizeKnown']=value.get('sizeKnown',True) is not False
    engraving=value.get('engraving','')
    if not isinstance(engraving,str) or len(engraving)>24: raise RecipeError('Гравировка длиннее 24 символов.')
    result['engraving']=re.sub(r'[<>\x00-\x1f]','',engraving)
    stone_id=value.get('stoneId','')
    if not isinstance(stone_id,str) or (stone_id and not re.fullmatch(r'[A-Z0-9-]{1,32}',stone_id)): raise RecipeError('Некорректный камень.')
    result['stoneId']=stone_id
    accents=value.get('accents',[])
    if not isinstance(accents,list) or len(accents)>8: raise RecipeError('Не больше 8 авторских линий.')
    total_points=0
    for item in accents:
        if not isinstance(item,dict) or set(item)-{'kind','points','radius','mirrorX','basis'} or item.get('kind')!='sweep': raise RecipeError('Неизвестная операция геометрии.')
        points=item.get('points');radius=item.get('radius',.25)
        if not isinstance(points,list) or not 3<=len(points)<=12: raise RecipeError('Линия должна содержать 3–12 точек.')
        if type(radius) not in (int,float) or not math.isfinite(radius) or not .15<=radius<=.65: raise RecipeError('Недопустимое сечение линии.')
        clean_points=[]
        for point in points:
            if not isinstance(point,list) or len(point)!=3 or any(type(n) not in (int,float) or not math.isfinite(n) or abs(n)>18 for n in point): raise RecipeError('Точка вне рабочего объёма.')
            if point[1]<-result['ringSize']/2-result['thickness']-1: raise RecipeError('Линия пересекает основание кольца.')
            clean_points.append([round(n,3) for n in point])
        if any(math.dist(a,b)<.02 for a,b in zip(clean_points,clean_points[1:])): raise RecipeError('Соседние точки линии совпадают.')
        basis=item.get('basis')
        if basis is not None and (not isinstance(basis,list) or len(basis)!=4 or any(type(n) not in (int,float) or not math.isfinite(n) or not low<=n<=high for n,(low,high) in zip(basis,[(14,23),(4,12),(0,3),(1.2,3)]))): raise RecipeError('Неверная база авторской линии.')
        total_points+=len(points)*(2 if item.get('mirrorX') is True else 1)
        result['accents'].append({'kind':'sweep','points':clean_points,'radius':round(radius,3),'mirrorX':item.get('mirrorX') is True,**({'basis':basis} if basis is not None else {})})
    if total_points>144: raise RecipeError('Превышен бюджет сложности геометрии.')
    result['version']=2
    return result
