import {characterFrame,characterSheet,installCharacterMetadata} from './characterSprites.js';

/** Painted poses: four facing rows, idle 0..3, walk 4..7, attack 8..11. */
export const UNIT_SHEET=Object.freeze({frameWidth:192,frameHeight:256,framesPerDirection:12,directions:['s','w','n','e']});
export function directionFromVector(dx,dy,previous='s'){
  if(Math.abs(dx)+Math.abs(dy)<.15)return previous;
  // Four isometric angles, matching the cardinal tile steps of village walkers.
  if(Math.abs(dy)<.15)return dx>0?'e':'w';
  if(Math.abs(dx)<.15)return dy>0?'s':'n';
  return dy>0?(dx>0?'e':'s'):(dx>0?'n':'w');
}
export function animationKey(type,action,direction){return `astrub:${type}:${action}:${direction}`;}
export function installUnitAnimations(scene){
  installCharacterMetadata(scene);
  for(const type of ['iop','cra']){
    const sheet=characterSheet(scene,type);
    if(!scene.textures.exists(sheet.key))continue;
    for(const facing of sheet.directions){
      for(const [action,{first,last,fps,repeat}] of Object.entries(sheet.actions)){
        const key=animationKey(type,action,facing);
        if(scene.anims.exists(key))continue;
        scene.anims.create({key,frames:scene.anims.generateFrameNumbers(sheet.key,{
          start:characterFrame(sheet,facing,first),end:characterFrame(sheet,facing,last)
        }),frameRate:fps,repeat});
      }
    }
  }
}
export function playUnitAnimation(sprite,type,action,facing){
  const sheet=characterSheet(sprite.scene,type),key=animationKey(type,action,facing);
  if(sprite.scene.characterMotionReduced){
    sprite.anims.stop();sprite.setFrame(characterFrame(sheet,facing,sheet.actions.idle.first));
    return;
  }
  if(sprite.anims.currentAnim?.key!==key||!sprite.anims.isPlaying)sprite.play(key,true);
  else if(sprite.anims.isPaused)sprite.anims.resume();
}
