"""Regression checks for the deterministic AI-to-geometry boundary (no API spending)."""
import math
import unittest
from backend.deepseek import compile_design, merge_observations, _validate_extraction, AIError, STONES
from backend.ring_schema import SCHEMA, RecipeError, validate_design


def observed(**values):
    return {'subject':'ring','summary':'Кольцо','imageType':'cad','fullPaveVisible':False,
            'features':{key:{'value':value,'confidence':.95,'evidence':'Видно на изображении'} for key,value in values.items()}}


class RingAIContract(unittest.TestCase):
    def compile(self,reference=None,intent=None,prompt='Повтори кольцо',current=None,locked=None):
        return compile_design(reference,intent or {'features':{}},prompt,current or SCHEMA['defaults'],locked)

    def test_copy_does_not_inherit_unrelated_project_features(self):
        current={**SCHEMA['defaults'],'shank':'rope','gem':'ruby','halo':'double','sideStones':'cluster','detail':'milgrain','scene':'velvet','ringSize':20}
        design,_=self.compile(observed(shape='round',halo='single',prongs=4,pave='shoulders'),current=current)
        self.assertEqual((design['shank'],design['gem'],design['sideStones'],design['detail']),('classic','diamond','none','none'))
        self.assertEqual((design['scene'],design['ringSize']),('velvet',20))
        self.assertEqual(design['accents'],[])

    def test_explicit_text_changes_only_named_fields(self):
        design,_=self.compile(observed(shape='round',halo='single',prongs=4,pave='shoulders'),{'features':{'halo':{'value':'none','evidence':'без ореола'}}},'Повтори, но без ореола')
        self.assertEqual((design['shape'],design['prongs'],design['pave'],design['halo']),('round',4,'shoulders','none'))

    def test_false_cad_colors_never_become_materials(self):
        design,_=self.compile(observed(shape='round',gem='emerald',metal='rose',engraving='CAD'))
        self.assertEqual((design['gem'],design['metal'],design['engraving']),('diamond','white',''))

    def test_colored_render_keeps_visible_colors(self):
        ref=observed(shape='round',gem='sapphire',metal='rose');ref['imageType']='photo'
        design,_=self.compile(ref)
        self.assertEqual((design['gem'],design['metal']),('sapphire','rose'))

    def test_shaded_green_gem_is_not_false_color_metal(self):
        ref=observed(shape='emerald');ref.update(visibleGemColor='green',visibleMetalColor='yellow')
        design,_=self.compile(ref)
        self.assertEqual((design['gem'],design['metal']),('emerald','yellow'))

    def test_green_cad_supports_are_not_real_metal(self):
        ref=observed(shape='round',gem='sapphire',metal='yellow');ref.update(visibleGemColor='blue',visibleMetalColor='nonmetal')
        design,_=self.compile(ref)
        self.assertEqual((design['gem'],design['metal']),('diamond','white'))

    def test_hidden_band_does_not_gain_full_pave(self):
        design,notes=self.compile(observed(shape='round',pave='full'))
        self.assertEqual(design['pave'],'shoulders');self.assertTrue(notes['uncertain'])

    def test_visible_full_pave_is_supported(self):
        ref=observed(shape='round',pave='full');ref['fullPaveVisible']=True
        self.assertEqual(self.compile(ref)[0]['pave'],'full')

    def test_catalog_stone_is_canonical_and_reports_conflict(self):
        lock=next(stone for stone in STONES.values() if stone['shape']=='oval')
        design,notes=self.compile(observed(shape='round',gemSize=6.5),locked=lock)
        self.assertEqual(design['shape'],'oval');self.assertEqual(design['gemSize'],lock['gemSize'])
        self.assertEqual(design['gemRatio'],SCHEMA['shapeRatios']['oval']);self.assertTrue(notes['conflicts'])

    def test_round_has_no_perspective_stretch(self):
        self.assertEqual(self.compile(observed(shape='round',gemRatio=1.5))[0]['gemRatio'],1)

    def test_non_round_ratio_survives_validation(self):
        design=validate_design({'shape':'emerald','gemRatio':1.375})
        self.assertEqual(design['gemRatio'],1.375)

    def test_old_projects_receive_shape_ratio(self):
        self.assertEqual(validate_design({'shape':'oval'})['gemRatio'],1.35)

    def test_confidence_does_not_silently_invent_detail(self):
        ref=observed(shape='round',detail='gallery');ref['features']['detail']['confidence']=.4
        design,notes=self.compile(ref)
        self.assertEqual(design['detail'],'none');self.assertTrue(notes['uncertain'])

    def test_unsubstantiated_overrides_are_rejected(self):
        with self.assertRaises(AIError):self.compile(observed(shape='round'),{'features':{'halo':{'value':'double','evidence':'два ореола'}}})

    def test_generated_paths_and_unknown_fields_are_rejected(self):
        for key,value in [('accents',[]),('code','alert(1)'),('ringSize',18),('scene','velvet')]:
            with self.subTest(key=key),self.assertRaises(RecipeError):
                _validate_extraction({'features':{key:{'value':value,'evidence':'test'}}})

    def test_non_finite_and_out_of_bounds_values_are_rejected(self):
        for value in (math.nan,math.inf,0,99,True):
            with self.subTest(value=value),self.assertRaises(RecipeError):
                _validate_extraction({'features':{'gemSize':{'value':value,'evidence':'test'}}})

    def test_four_double_claws_from_located_tips(self):
        first=observed(shape='emerald',prongs=8)
        review=observed(shape='emerald');review['clawGroups']=[{'tips':[[x,y],[x+.025,y]]} for x,y in ((.2,.2),(.7,.2),(.2,.8),(.7,.8))]
        merged=merge_observations(first,_validate_extraction(review,True))
        self.assertEqual(self.compile(merged)[0]['prongs'],4)
        self.assertEqual(self.compile(merged)[0]['prongStyle'],'double')

    def test_duplicate_claw_tip_is_not_counted_twice(self):
        ref=observed(shape='round');ref['clawGroups']=[{'tips':[[.2,.2]]},{'tips':[[.2,.2]]}]
        with self.assertRaises(RecipeError):_validate_extraction(ref,True)

    def test_invalid_crop_is_rejected(self):
        for box in ([0,0,0,0],[-1,0,.5,.5],[.8,0,.2,1],[0,0,math.nan,1]):
            ref=observed(shape='round');ref['headBox']=box
            with self.subTest(box=box),self.assertRaises(RecipeError):_validate_extraction(ref,True)


if __name__=='__main__':unittest.main()
