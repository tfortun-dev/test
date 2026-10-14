/** Painted PNG atlases. Layout and pivots are described beside the artwork. */
export const CHARACTER_TYPES=Object.freeze(['villager','hen','rabbit','iop','cra']);
export const CHARACTER_DIRECTIONS=Object.freeze(['s','w','n','e']);
export const CHARACTER_MANIFEST_KEY='astrub-character-manifest';
const AMBIENT_TYPES=new Set(['villager','hen','rabbit']);
const DISPLAY_WIDTH={villager:46,hen:34,rabbit:31,iop:64,cra:64};
const positive=value=>Number.isFinite(value)&&value>0;
const unitInterval=value=>Number.isFinite(value)&&value>=0&&value<=1;

export function characterTextureKey(type){
  return AMBIENT_TYPES.has(type)?`astrub-ambient-${type}`:`unit-anim-${type}`;
}

/** Keep metadata tolerant of export information, but never of bad frame geometry. */
export function normalizeCharacterSheet(type,definition={}){
  const ambient=AMBIENT_TYPES.has(type);
  const frameWidth=positive(definition.frameWidth)?Math.max(1,Math.round(definition.frameWidth)):192;
  const frameHeight=positive(definition.frameHeight)?Math.max(1,Math.round(definition.frameHeight)):256;
  const columns=Math.max(ambient?4:12,positive(definition.columns)?Math.round(definition.columns):(ambient?4:12));
  const directions=Array.isArray(definition.directions)&&definition.directions.length===4
    &&CHARACTER_DIRECTIONS.every(direction=>definition.directions.includes(direction))
    ?[...definition.directions]:[...CHARACTER_DIRECTIONS];
  const rawBounds=definition.bodyBounds;
  const body=Array.isArray(rawBounds)&&rawBounds.length===4
    ?{x:rawBounds[0],y:rawBounds[1],width:rawBounds[2],height:rawBounds[3]}:rawBounds;
  const bodyBounds=body&&Number.isFinite(body.x)&&Number.isFinite(body.y)
    &&positive(body.width)&&positive(body.height)&&body.x>=0&&body.y>=0
    &&body.x+body.width<=frameWidth&&body.y+body.height<=frameHeight
    ?{...body}:{x:0,y:0,width:frameWidth,height:frameHeight};
  const rawPivot=definition.pivot;
  const pivot=Array.isArray(rawPivot)&&rawPivot.length===2?{x:rawPivot[0],y:rawPivot[1]}:rawPivot;
  const pivotX=unitInterval(pivot?.x/frameWidth)?pivot.x/frameWidth:.5;
  const pivotY=unitInterval(pivot?.y/frameHeight)?pivot.y/frameHeight:236/256;
  return {
    ...definition,type,key:characterTextureKey(type),
    path:definition.path||`/assets/sprites/${type}-atlas.png`,
    frameWidth,frameHeight,columns,directions,bodyBounds,
    originX:unitInterval(definition.originX)?definition.originX:pivotX,
    originY:unitInterval(definition.originY)?definition.originY:pivotY,
    displayWidth:positive(definition.displayWidth)?definition.displayWidth:DISPLAY_WIDTH[type],
    maxHeight:positive(definition.maxHeight)?definition.maxHeight:null,
    actions:ambient?{walk:{first:0,last:3,fps:1000/160,repeat:-1}}:{
      idle:{first:0,last:3,fps:5,repeat:-1},
      walk:{first:4,last:7,fps:8,repeat:-1},
      attack:{first:8,last:11,fps:10,repeat:0}
    }
  };
}

export function characterSheet(scene,type){
  const key=characterTextureKey(type),texture=scene.textures.exists(key)?scene.textures.get(key):null;
  if(texture?.astrubCharacter)return texture.astrubCharacter;
  const manifest=scene.cache.json.get(CHARACTER_MANIFEST_KEY);
  return normalizeCharacterSheet(type,manifest?.characters?.[type]);
}

/** Phaser accepts files enqueued while the manifest file completes. */
export function preloadCharacterSprites(scene){
  const queue=manifest=>{
    for(const type of CHARACTER_TYPES){
      const definition=manifest?.characters?.[type];
      // Missing artwork remains absent rather than silently drawing a proxy.
      if(!definition)continue;
      const sheet=normalizeCharacterSheet(type,definition);
      if(!scene.textures.exists(sheet.key))scene.load.spritesheet(sheet.key,sheet.path,{
        frameWidth:sheet.frameWidth,frameHeight:sheet.frameHeight,
        endFrame:sheet.columns*sheet.directions.length-1
      });
    }
  };
  if(scene.cache.json.exists(CHARACTER_MANIFEST_KEY)){
    queue(scene.cache.json.get(CHARACTER_MANIFEST_KEY));return;
  }
  const event=`filecomplete-json-${CHARACTER_MANIFEST_KEY}`;
  const onManifest=(_key,_type,data)=>queue(data);
  scene.load.once(event,onManifest);
  // A failed JSON request must not leave a listener behind across scene restarts.
  scene.load.once('complete',()=>scene.load.off(event,onManifest));
  scene.load.json(CHARACTER_MANIFEST_KEY,'/assets/sprites/manifest.json');
}

export function installCharacterMetadata(scene){
  for(const type of CHARACTER_TYPES){
    const key=characterTextureKey(type);
    if(scene.textures.exists(key))scene.textures.get(key).astrubCharacter=characterSheet(scene,type);
  }
}

export function characterFrame(sheet,direction,pose=0){
  const row=Math.max(0,sheet.directions.indexOf(direction));
  return row*sheet.columns+pose;
}

export function sizeCharacterSprite(sprite,type){
  const sheet=characterSheet(sprite.scene,type);
  // Alpha traces and transparent margins never make the visible body smaller.
  const scale=Math.min(sheet.displayWidth/sheet.bodyBounds.width,
    sheet.maxHeight?sheet.maxHeight/sheet.bodyBounds.height:Infinity);
  return sprite.setOrigin(sheet.originX,sheet.originY).setScale(scale);
}
