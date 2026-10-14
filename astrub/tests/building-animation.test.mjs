import test from 'node:test';
import assert from 'node:assert/strict';
import {BuildingAnimator,normalizeBuildingAnimation} from '../src/game/buildingAnimations.js';
import {BUILDING_VISUALS,sizeBuildingSprite,buildingSpriteTop} from '../src/game/spriteCatalog.js';

const exported={frameWidth:512,frameHeight:512,frameCount:4,columns:2,frameRate:4,bodyBounds:{x:72,y:104,width:360,height:382},pivot:{x:254,y:488}};
function eventTarget(extra={}){
  const listeners=new Map();
  return {...extra,listeners,addEventListener(name,fn){listeners.set(name,fn);},removeEventListener(name,fn){if(listeners.get(name)===fn)listeners.delete(name);}};
}
function setup(){
  const motion=eventTarget({matches:false}),visibility=eventTarget({hidden:false});
  const events={once(){},off(){}};
  const animator=new BuildingAnimator({events},{motionPreference:motion,visibilityTarget:visibility});
  const image={active:true,width:512,height:512,x:34,y:728,depth:7100,data:{buildingId:17},input:{pixelPerfect:true},texture:{key:'b-animated-townhall',astrubBuildingVisual:normalizeBuildingAnimation(exported,1024,1024)},frame:0,
    setOrigin(x,y){this.originX=x;this.originY=y;return this;},setScale(scale){this.scaleX=scale;this.scaleY=scale;this.displayHeight=this.height*scale;return this;},setFrame(frame){this.frame=frame;return this;}};
  sizeBuildingSprite(image,'townhall');
  animator.attach(image,'townhall',17);
  return {animator,image,motion,visibility};
}

test('changer de pose garde le pied, la silhouette dimensionnée, le tri et la sélection',()=>{
  const {animator,image}=setup(),first=image.frame;
  const anchored={x:image.x,y:image.y,originX:image.originX,originY:image.originY,scaleX:image.scaleX,scaleY:image.scaleY,depth:image.depth,data:image.data,input:image.input};
  assert.equal(image.texture.astrubBuildingVisual.frameWidth,512,'mesure d’une frame, jamais de l’atlas entier');
  assert.ok(exported.bodyBounds.width*image.scaleX<=BUILDING_VISUALS.townhall.width+.01);
  assert.equal(buildingSpriteTop(image),image.y+(exported.bodyBounds.y-exported.pivot.y)*image.scaleY);
  animator.update(250);
  assert.notEqual(image.frame,first,'une vraie image différente est affichée');
  animator.attach(image,'townhall',17);
  assert.equal(animator.entries.get(17).elapsed,250,'un rerender de sélection ne redémarre pas la boucle');
  animator.update(250);
  assert.notEqual(image.frame,first);
  for(const [key,value] of Object.entries(anchored))assert.equal(image[key],value,`${key} reste attaché au bâtiment`);
  animator.destroy();
});

test('les pauses ne rattrapent pas le temps caché et tous les écouteurs sont retirés',()=>{
  const {animator,image,motion,visibility}=setup();
  animator.update(250);const frame=image.frame,elapsed=animator.entries.get(17).elapsed;
  animator.update(5000,true);
  assert.equal(image.frame,frame,'modale ou placement : aucune pose ne défile');
  visibility.hidden=true;visibility.listeners.get('visibilitychange')();animator.update(5000);
  assert.equal(animator.entries.get(17).elapsed,elapsed,'onglet caché : aucune avance de boucle');
  visibility.hidden=false;animator.update(5000);
  assert.equal(animator.entries.get(17).elapsed,elapsed,'la première frame de retour ignore le long délai');
  animator.update(250);assert.notEqual(image.frame,frame);
  motion.listeners.get('change')({matches:true});assert.equal(image.frame,0);
  animator.update(250);assert.equal(image.frame,0,'mouvement réduit : pose de référence fixe');
  animator.destroy();animator.destroy();
  assert.equal(motion.listeners.size,0);assert.equal(visibility.listeners.size,0);assert.equal(animator.entries.size,0);
  animator.update(250);assert.equal(image.frame,0,'un ancien animateur détruit ne touche plus au sprite');
});

test('un atlas incohérent est refusé et le retrait d’un bâtiment retire sa boucle',()=>{
  assert.deepEqual(normalizeBuildingAnimation({...exported,rows:2,fps:4,frameRate:undefined,bodyBounds:[72,104,360,382],pivot:[254,488]},1024,1024),normalizeBuildingAnimation(exported,1024,1024),'les tuples du packer et les objets donnent la même géométrie');
  assert.equal(normalizeBuildingAnimation(exported,1024,512),null,'frames hors image');
  assert.equal(normalizeBuildingAnimation({...exported,pivot:{x:256,y:600}},1024,1024),null,'pivot hors frame');
  assert.equal(normalizeBuildingAnimation({...exported,bodyBounds:{...exported.bodyBounds,width:999}},1024,1024),null,'corps hors frame');
  const {animator,image}=setup();animator.detach(17);const frame=image.frame;
  animator.update(250);assert.equal(image.frame,frame);assert.equal(animator.entries.size,0);
  image.texture={key:'b-townhall'};assert.equal(animator.attach(image,'townhall',17),false,'le still reste utilisable sans animation');
  animator.destroy();
});
