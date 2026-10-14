import test from 'node:test';
import assert from 'node:assert/strict';
import {xy} from '../src/game/isometric.js';
import {RENDER_LAYERS,entityDepth,buildingDepth,buildingFootY,unitDepth,decorDepth} from '../src/game/renderLayers.js';
import {BUILDING_VISUALS,spriteDimensions} from '../src/game/spriteCatalog.js';
import {directionFromVector,animationKey,UNIT_SHEET} from '../src/game/unitAnimations.js';

test('les calques restent dans leur ordre logique',()=>{
  assert.ok(RENDER_LAYERS.terrain<RENDER_LAYERS.decals);
  assert.ok(RENDER_LAYERS.decals<RENDER_LAYERS.world);
  assert.ok(RENDER_LAYERS.world<RENDER_LAYERS.effects);
  assert.ok(RENDER_LAYERS.effects<RENDER_LAYERS.preview);
  assert.ok(RENDER_LAYERS.preview<RENDER_LAYERS.hud);
});
test('bâtiments / unités / arbres sont triés par la même profondeur de contact',()=>{
  const b={x:14,y:14},foot=buildingFootY(b,[2,2]);
  const depth=buildingDepth(b,[2,2]);
  assert.equal(foot,xy(15,15).y+38*.18);
  assert.ok(unitDepth(foot-40)<depth,'troupe derrière le bâtiment');
  assert.ok(unitDepth(foot+40)>depth,'troupe devant le bâtiment');
  assert.ok(decorDepth(foot-1)<decorDepth(foot+1),'ordre des arbres');
  assert.equal(entityDepth(39,20),3920);
});
test('les six sprites partagent un point d’ancrage au sol cohérent',()=>{
  assert.equal(Object.keys(BUILDING_VISUALS).length,6);
  for(const type of Object.keys(BUILDING_VISUALS)){
    const dims=spriteDimensions(type,352,420);
    assert.ok(dims.scale>0 && dims.scale<1);
    assert.ok(dims.width<=BUILDING_VISUALS[type].width+.1);
    assert.ok(dims.height<=BUILDING_VISUALS[type].maxHeight+.1);
    assert.equal(dims.originY,.985);
  }
});
test('les animations disposent de quatre directions, 16 images par direction',()=>{
  assert.deepEqual(UNIT_SHEET.directions,['s','w','n','e']);
  assert.equal(UNIT_SHEET.framesPerDirection*UNIT_SHEET.directions.length,64);
  assert.equal(directionFromVector(20,3),'e');
  assert.equal(directionFromVector(-20,3),'w');
  assert.equal(directionFromVector(0,-9),'n');
  assert.equal(directionFromVector(0,9),'s');
  assert.equal(directionFromVector(0,0,'w'),'w');
  assert.equal(animationKey('iop','attack','n'),'astrub:iop:attack:n');
});
