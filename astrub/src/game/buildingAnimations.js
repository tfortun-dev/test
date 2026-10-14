/** Painted building poses exported from edited image sheets: no geometry tween. */
export const BUILDING_ANIMATION_TYPES=Object.freeze(['townhall','sawmill','mine','warehouse','barracks','tower']);
export const BUILDING_ANIMATION_MANIFEST='astrub-building-animation-manifest';
export const buildingAnimationTextureKey=type=>`b-animated-${type}`;

export function preloadBuildingAnimations(scene){
  if(!scene.cache.json.exists(BUILDING_ANIMATION_MANIFEST)){
    scene.load.json(BUILDING_ANIMATION_MANIFEST,'/assets/buildings/animated/manifest.json');
  }
  for(const type of BUILDING_ANIMATION_TYPES){
    const key=buildingAnimationTextureKey(type);
    if(!scene.textures.exists(key))scene.load.image(key,`/assets/buildings/animated/${type}-atlas.png`);
  }
}

const finite=value=>Number.isFinite(value);
/** Validate exported frame geometry before it can affect world dimensions. */
export function normalizeBuildingAnimation(definition,atlasWidth,atlasHeight){
  if(!definition)return null;
  const {frameWidth,frameHeight,frameCount}=definition;
  const rawBody=definition.bodyBounds,rawPivot=definition.pivot;
  const bodyBounds=Array.isArray(rawBody)&&rawBody.length===4?{x:rawBody[0],y:rawBody[1],width:rawBody[2],height:rawBody[3]}:rawBody;
  const pivot=Array.isArray(rawPivot)&&rawPivot.length===2?{x:rawPivot[0],y:rawPivot[1]}:rawPivot;
  const columns=definition.columns??2;
  if(![frameWidth,frameHeight,frameCount,columns].every(value=>Number.isInteger(value)&&value>0))return null;
  if(frameCount<2||frameCount>16||columns*frameWidth>atlasWidth||Math.ceil(frameCount/columns)*frameHeight>atlasHeight)return null;
  if(definition.rows!==undefined&&(!Number.isInteger(definition.rows)||definition.rows<Math.ceil(frameCount/columns)||definition.rows*frameHeight>atlasHeight))return null;
  if(!bodyBounds||![bodyBounds.x,bodyBounds.y,bodyBounds.width,bodyBounds.height].every(finite))return null;
  if(bodyBounds.x<0||bodyBounds.y<0||bodyBounds.width<=0||bodyBounds.height<=0||bodyBounds.x+bodyBounds.width>frameWidth||bodyBounds.y+bodyBounds.height>frameHeight)return null;
  if(!pivot||![pivot.x,pivot.y].every(finite)||pivot.x<0||pivot.y<0||pivot.x>frameWidth||pivot.y>frameHeight)return null;
  const frameRate=definition.frameRate??definition.fps??3;
  if(!finite(frameRate)||frameRate<=0)return null;
  return {frameWidth,frameHeight,frameCount,columns,frameRate:Math.max(2,Math.min(4,frameRate)),bodyBounds:{...bodyBounds},pivot:{...pivot}};
}

export function installBuildingAnimationFrames(scene){
  const manifest=scene.cache.json.get(BUILDING_ANIMATION_MANIFEST);
  const definitions=manifest?.buildings??manifest?.sprites??manifest??{};
  const diagnostics={valid:[],missing:[],invalid:[]};
  for(const type of BUILDING_ANIMATION_TYPES){
    const key=buildingAnimationTextureKey(type);
    if(!scene.textures.exists(key)){diagnostics.missing.push(type);continue;}
    const texture=scene.textures.get(key),source=texture.getSourceImage();
    const visual=normalizeBuildingAnimation(definitions[type],source.width,source.height);
    if(!visual){diagnostics.invalid.push(type);continue;}
    for(let index=0;index<visual.frameCount;index++){
      if(!texture.has(index))texture.add(index,0,(index%visual.columns)*visual.frameWidth,Math.floor(index/visual.columns)*visual.frameHeight,visual.frameWidth,visual.frameHeight);
    }
    texture.astrubBuildingVisual=visual;
    diagnostics.valid.push(type);
    // The still used by placement has the same canvas and ground pivot as frame 0.
    const still=scene.textures.exists(`b-${type}`)?scene.textures.get(`b-${type}`):null;
    const stillSource=still?.getSourceImage();
    if(stillSource?.width===visual.frameWidth&&stillSource?.height===visual.frameHeight)still.astrubBuildingVisual=visual;
  }
  scene.buildingAnimationDiagnostics=diagnostics;
  if(diagnostics.missing.length||diagnostics.invalid.length){
    console.warn('[Astrub sprites] Building animation assets incomplete; still images are used for unavailable entries.',{
      manifestPresent:Boolean(manifest),missingAtlases:diagnostics.missing,invalidGeometry:diagnostics.invalid
    });
  }
  return diagnostics;
}

export function buildingTexture(scene,type){
  const key=buildingAnimationTextureKey(type);
  if(scene.textures.exists(key)&&scene.textures.get(key).astrubBuildingVisual)return {key,frame:0};
  return {key:`b-${type}`,frame:undefined};
}

function phaseForId(id,frameCount){
  let seed=0;
  for(const character of String(id))seed=(seed*31+character.charCodeAt(0))>>>0;
  return seed%frameCount;
}

/** An image keeps its hit area, anchor, selection data and draw order across poses. */
export class BuildingAnimator {
  constructor(scene,{motionPreference=globalThis.window?.matchMedia('(prefers-reduced-motion: reduce)'),visibilityTarget=globalThis.document}={}){
    this.scene=scene;this.entries=new Map();this.destroyed=false;this.paused=false;
    this.motionPreference=motionPreference;this.visibilityTarget=visibilityTarget;
    this.reducedMotion=Boolean(motionPreference?.matches);
    this.onMotionChange=event=>{
      this.reducedMotion=event.matches;
      if(this.reducedMotion)for(const entry of this.entries.values())this.showFrame(entry,0);
    };
    this.onVisibilityChange=()=>{if(this.visibilityTarget?.hidden)this.paused=true;};
    motionPreference?.addEventListener('change',this.onMotionChange);
    visibilityTarget?.addEventListener('visibilitychange',this.onVisibilityChange);
    this.onSceneDestroy=()=>this.destroy();
    scene.events.once('destroy',this.onSceneDestroy);
  }
  attach(image,type,id){
    if(this.destroyed)return false;
    const visual=image.texture.astrubBuildingVisual;
    if(!visual||image.texture.key!==buildingAnimationTextureKey(type))return false;
    const previous=this.entries.get(id);
    if(previous?.image===image&&previous.type===type)return true;
    const entry={image,type,id,visual,elapsed:previous?.elapsed??0,phase:previous?.phase??phaseForId(id,visual.frameCount),frame:null};
    this.entries.set(id,entry);
    this.showFrame(entry,this.reducedMotion?0:(entry.phase+Math.floor(entry.elapsed*visual.frameRate/1000))%visual.frameCount);
    return true;
  }
  showFrame(entry,index){
    if(entry.frame===index||!entry.image.active)return;
    entry.image.setFrame(index);entry.frame=index;
  }
  update(delta,paused=false){
    if(this.destroyed)return;
    const wasPaused=this.paused;
    this.paused=Boolean(paused||this.visibilityTarget?.hidden||this.reducedMotion);
    if(this.paused||wasPaused)return;
    const elapsed=Math.min(250,Math.max(0,delta));
    for(const [id,entry] of this.entries){
      if(!entry.image.active){this.entries.delete(id);continue;}
      entry.elapsed+=elapsed;
      this.showFrame(entry,(entry.phase+Math.floor(entry.elapsed*entry.visual.frameRate/1000))%entry.visual.frameCount);
    }
  }
  detach(id){this.entries.delete(id);}
  destroy(){
    if(this.destroyed)return;
    this.destroyed=true;this.entries.clear();
    this.motionPreference?.removeEventListener('change',this.onMotionChange);
    this.visibilityTarget?.removeEventListener('visibilitychange',this.onVisibilityChange);
    this.scene.events.off('destroy',this.onSceneDestroy);
  }
}
