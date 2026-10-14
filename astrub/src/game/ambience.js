import {xy} from './isometric.js';
import {unitDepth} from './renderLayers.js';
import {createAmbienceArt,AMBIENCE_SPRITES} from './ambienceArt.js';
import {characterTextureKey,sizeCharacterSprite} from './characterSprites.js';
import {AMBIENCE_MAX_ACTORS,ambientCellFree,ambientDirection,buildingsSignature,chooseAmbientRoute,createAmbientGrid,findAmbientPath} from './ambiencePaths.js';

/** Decorative passers-by only. No interactive object, timer, tween or saved state. */
export class VillageAmbience {
  constructor(scene,{sizes,mapSize,buildings,random=Math.random}){
    this.scene=scene;this.sizes=sizes;this.mapSize=mapSize;this.random=random;
    this.actors=[];this.maxActors=AMBIENCE_MAX_ACTORS;this.spawnDelay=750;
    this.spawnCount=0;this.paused=false;this.destroyed=false;
    this.motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion=this.motionPreference.matches;
    this.onMotionChange=event=>{
      this.reducedMotion=event.matches;
      if(this.reducedMotion)this.clearActors();
      this.spawnDelay=750;
    };
    this.motionPreference.addEventListener('change',this.onMotionChange);
    this.onVisibilityChange=()=>{if(document.hidden)this.paused=true;};
    document.addEventListener('visibilitychange',this.onVisibilityChange);
    this.onSceneDestroy=()=>this.destroy();
    this.scene.events.once('destroy',this.onSceneDestroy);
    createAmbienceArt(scene);this.updateObstacles(buildings);
  }
  updateObstacles(buildings){
    if(this.destroyed)return;
    const signature=buildingsSignature(buildings);
    if(signature===this.buildingSignature)return;
    this.buildingSignature=signature;
    this.grid=createAmbientGrid(buildings,this.sizes,this.mapSize);
    for(const actor of [...this.actors]){
      const start={i:Math.round(actor.i),j:Math.round(actor.j)};
      // A new building may cover a decorative passer. Remove it instead of
      // teleporting it through the building or leaving it trapped underneath.
      if(!ambientCellFree(this.grid,start.i,start.j)){this.removeActor(actor);continue;}
      const goal=actor.path.at(-1);
      const route=findAmbientPath(this.grid,start,goal);
      if(!route.length){this.removeActor(actor);continue;}
      actor.path=route;actor.waypointIndex=0;actor.reroutes++;
    }
  }
  spawn(){
    if(this.destroyed||this.reducedMotion||this.paused||this.actors.length>=this.maxActors)return false;
    const path=chooseAmbientRoute(this.grid,this.random,this.spawnCount===0);
    if(!path.length)return false;
    const kind=['hen','villager','rabbit','villager'][this.spawnCount%4];
    const textureKey=characterTextureKey(kind);
    if(!this.scene.textures.exists(textureKey))return false;
    const config=AMBIENCE_SPRITES[kind],at=path[0],point=xy(at.i,at.j);
    const sprite=sizeCharacterSprite(this.scene.add.image(point.x,point.y,textureKey,'s:0'),kind)
      .setAlpha(0).setDepth(unitDepth(point.y))
      .setName(`astrub:ambient:${kind}`);
    this.scene.layers.world.add(sprite);
    this.actors.push({kind,sprite,path,i:at.i,j:at.j,waypointIndex:1,speed:config.speed,age:0,walkTime:0,direction:'s',exitAge:null,reroutes:0});
    this.spawnCount++;return true;
  }
  update(delta,paused=false){
    if(this.destroyed)return;
    const wasPaused=this.paused;
    this.paused=paused||document.hidden||this.reducedMotion;
    if(this.paused)return;
    // Skip the resume frame, then use real frame time. Phaser's smoothed delta
    // can keep returning 16ms at low FPS, which would make these walkers crawl.
    if(wasPaused)return;
    const elapsed=Math.min(Math.max(delta,0),250);
    this.spawnDelay-=elapsed;
    if(this.spawnDelay<=0){
      this.spawn();this.spawnDelay=6000+this.random()*3500;
    }
    for(const actor of [...this.actors]){
      actor.age+=elapsed;
      if(actor.exitAge!==null){
        actor.exitAge+=elapsed;actor.sprite.setAlpha(Math.max(0,1-actor.exitAge/700));
        if(actor.exitAge>=700)this.removeActor(actor);
        continue;
      }
      actor.sprite.setAlpha(Math.min(1,actor.age/700));
      const target=actor.path[actor.waypointIndex];
      if(!target){actor.exitAge=0;continue;}
      const point=xy(actor.i,actor.j),end=xy(target.i,target.j);
      const dx=end.x-point.x,dy=end.y-point.y,distance=Math.hypot(dx,dy),step=actor.speed*elapsed/1000;
      if(distance>.01)actor.direction=ambientDirection(target.i-actor.i,target.j-actor.j,actor.direction);
      if(distance<=step){actor.i=target.i;actor.j=target.j;actor.waypointIndex++;}
      else{const ratio=step/distance;actor.i+=(target.i-actor.i)*ratio;actor.j+=(target.j-actor.j)*ratio;}
      actor.walkTime+=elapsed;
      const pose=Math.floor(actor.walkTime/AMBIENCE_SPRITES[actor.kind].cadence)%4;
      const current=xy(actor.i,actor.j);
      actor.sprite.setPosition(current.x,current.y).setDepth(unitDepth(current.y)).setFrame(`${actor.direction}:${pose}`);
    }
  }
  removeActor(actor){
    actor.sprite.destroy();this.actors=this.actors.filter(item=>item!==actor);
  }
  clearActors(){for(const actor of [...this.actors])this.removeActor(actor);}
  destroy(){
    if(this.destroyed)return;
    this.destroyed=true;this.clearActors();
    this.motionPreference.removeEventListener('change',this.onMotionChange);
    document.removeEventListener('visibilitychange',this.onVisibilityChange);
    this.scene.events.off('destroy',this.onSceneDestroy);
  }
}
