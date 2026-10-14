/**
 * Offline-baked sprite sheets: four facing rows, 16 frames/row.
 * frame 0..3 idle, 4..9 walk, 10..15 attack. No live 3D rendering.
 */
export const UNIT_SHEET={frameWidth:108,frameHeight:116,framesPerDirection:16,directions:['s','w','n','e']};
export function directionFromVector(dx,dy,previous='s'){
  if(Math.abs(dx)+Math.abs(dy)<.15)return previous;
  return Math.abs(dx)>Math.abs(dy) ? (dx>0?'e':'w'):(dy>0?'s':'n');
}
export function animationKey(type,action,direction){return `astrub:${type}:${action}:${direction}`;}
export function installUnitAnimations(scene){
  for(const type of ['iop','cra']){
    if(!scene.textures.exists('unit-anim-'+type))continue;
    for(let row=0;row<UNIT_SHEET.directions.length;row++){
      const facing=UNIT_SHEET.directions[row],start=row*16;
      for(const [action,first,last,fps,repeat] of [
        ['idle',0,3,5,-1],['walk',4,9,10,-1],['attack',10,15,13,0]
      ]){
        const key=animationKey(type,action,facing);
        if(scene.anims.exists(key))continue;
        scene.anims.create({key,frames:scene.anims.generateFrameNumbers('unit-anim-'+type,
          {start:start+first,end:start+last}),frameRate:fps,repeat});
      }
    }
  }
}
export function playUnitAnimation(sprite,type,action,facing){
  const key=animationKey(type,action,facing);
  if(sprite.anims.currentAnim?.key!==key)sprite.play(key,true);
}
