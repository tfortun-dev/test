import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {CHARACTER_MANIFEST_KEY,CHARACTER_TYPES,characterFrame,normalizeCharacterSheet,preloadCharacterSprites,sizeCharacterSprite} from '../src/game/characterSprites.js';
import {directionFromVector} from '../src/game/unitAnimations.js';

test('les quatre vues isométriques gardent la direction du trajet et des poses',()=>{
  const directions=[['s',-10,5],['w',-10,-5],['n',10,-5],['e',10,5]];
  const sheet=normalizeCharacterSheet('cra');
  for(const [direction,dx,dy] of directions){
    assert.equal(directionFromVector(dx,dy),direction);
    const row=sheet.directions.indexOf(direction);
    assert.equal(Math.floor(characterFrame(sheet,direction,4)/sheet.columns),row,'une marche conserve sa vue');
    assert.equal(Math.floor(characterFrame(sheet,direction,11)/sheet.columns),row,'une attaque conserve sa vue');
  }
  assert.equal(directionFromVector(.01,.01,'n'),'n','aucun retournement pendant un arrêt');
  const reordered=normalizeCharacterSheet('iop',{directions:['e','n','w','s']});
  assert.equal(characterFrame(reordered,'s',8),44,'le manifest reste autoritaire sur l’ordre des lignes');
});

test('un manifest chargé en cours de preload ajoute les cinq PNG et ne recharge pas les textures',()=>{
  const loader=new EventEmitter(),queued=[];
  loader.json=(key,path)=>queued.push({kind:'json',key,path});
  loader.spritesheet=(key,path,geometry)=>queued.push({kind:'sheet',key,path,geometry});
  const stored=new Map(),textures=new Set();
  const scene={load:loader,cache:{json:{exists:key=>stored.has(key),get:key=>stored.get(key)}},textures:{exists:key=>textures.has(key)}};
  preloadCharacterSprites(scene);
  assert.equal(queued.length,1,'les PNG attendent les dimensions réelles du manifest');
  const manifest={characters:Object.fromEntries(CHARACTER_TYPES.map(type=>[type,{path:`/art/${type}.png`,frameWidth:192,frameHeight:256,columns:['iop','cra'].includes(type)?12:4}]))};
  stored.set(CHARACTER_MANIFEST_KEY,manifest);
  loader.emit(`filecomplete-json-${CHARACTER_MANIFEST_KEY}`,CHARACTER_MANIFEST_KEY,'json',manifest);
  const sheets=queued.filter(file=>file.kind==='sheet');
  assert.equal(sheets.length,5);
  assert.ok(sheets.every(file=>file.path.startsWith('/art/')&&file.geometry.frameWidth===192));
  assert.equal(sheets.find(file=>file.key==='unit-anim-iop').geometry.endFrame,47);
  assert.equal(sheets.find(file=>file.key==='astrub-ambient-rabbit').geometry.endFrame,15);
  for(const file of sheets)textures.add(file.key);
  preloadCharacterSprites(scene);
  assert.equal(queued.length,6,'un retour combat/village réutilise les textures déjà chargées');
});

test('un manifest incomplet ne recrée pas de proxy et son écouteur disparaît après échec',()=>{
  const loader=new EventEmitter(),queued=[];
  loader.json=()=>{};loader.spritesheet=key=>queued.push(key);
  const scene={load:loader,cache:{json:{exists:()=>false,get:()=>null}},textures:{exists:()=>false}};
  preloadCharacterSprites(scene);
  loader.emit(`filecomplete-json-${CHARACTER_MANIFEST_KEY}`,CHARACTER_MANIFEST_KEY,'json',{characters:{hen:{columns:4}}});
  assert.deepEqual(queued,['astrub-ambient-hen']);
  preloadCharacterSprites(scene);
  assert.equal(loader.listenerCount(`filecomplete-json-${CHARACTER_MANIFEST_KEY}`),1);
  loader.emit('complete');
  assert.equal(loader.listenerCount(`filecomplete-json-${CHARACTER_MANIFEST_KEY}`),0);
});

test('les marges transparentes ne réduisent pas le corps et son pivot reste stable',()=>{
  const sheet=normalizeCharacterSheet('villager',{frameWidth:192,frameHeight:256,
    bodyBounds:[47,42,98,192],pivot:[96,236],displayWidth:46});
  const texture={astrubCharacter:sheet};
  const scene={textures:{exists:()=>true,get:()=>texture},cache:{json:{get:()=>null}}};
  const sprite={scene,setOrigin(x,y){this.originX=x;this.originY=y;return this;},setScale(scale){this.scaleX=scale;this.scaleY=scale;return this;}};
  sizeCharacterSprite(sprite,'villager');
  assert.equal(sprite.scaleX*sheet.bodyBounds.width,46,'la largeur désigne le corps, pas la cellule vide');
  assert.equal(sprite.scaleY,sprite.scaleX,'aucune déformation verticale');
  assert.equal(sprite.originX,.5);assert.equal(sprite.originY,236/256);
  const objectBounds=normalizeCharacterSheet('villager',{bodyBounds:{x:47,y:42,width:98,height:192}});
  assert.deepEqual(objectBounds.bodyBounds,sheet.bodyBounds,'les deux formats du manifest sont admis');
  const fallback=normalizeCharacterSheet('villager',{bodyBounds:[-1,0,1000,20]});
  assert.equal(fallback.bodyBounds.width,192,'des limites invalides reviennent à la cellule entière');
  const capped=normalizeCharacterSheet('villager',{bodyBounds:[47,42,98,192],maxHeight:60});
  texture.astrubCharacter=capped;sizeCharacterSprite(sprite,'villager');
  assert.equal(sprite.scaleY*capped.bodyBounds.height,60,'un éventuel plafond de hauteur conserve les proportions');
});
