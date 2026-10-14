/** Every PNG has transparent pixels and a ground-contact pivot near the bottom. */
export const BUILDING_VISUALS = Object.freeze({
  townhall: { width: 220, maxHeight: 320, originY: 0.985, shadowScale: .47, shadowHeight: 21, shadowOffsetY: -5 },
  sawmill:  { width: 170, maxHeight: 190, originY: 0.985, shadowScale: .46, shadowHeight: 16, shadowOffsetY: -4 },
  mine:     { width: 180, maxHeight: 210, originY: 0.985, shadowScale: .46, shadowHeight: 17, shadowOffsetY: -4 },
  warehouse:{ width: 142, maxHeight: 166, originY: 0.985, shadowScale: .45, shadowHeight: 16, shadowOffsetY: -4 },
  barracks: { width: 134, maxHeight: 214, originY: 0.985, shadowScale: .43, shadowHeight: 16, shadowOffsetY: -6 },
  tower:    { width: 178, maxHeight: 188, originY: 0.985, shadowScale: .46, shadowHeight: 16, shadowOffsetY: -4 }
});

/** Footprint remains independent from graphic width. Only renderer is affected. */
export function spriteDimensions(type, imageWidth, imageHeight,visual=null) {
  const cfg=BUILDING_VISUALS[type];
  if(!cfg || !imageWidth || !imageHeight) return null;
  const body=visual?.bodyBounds??{x:0,y:0,width:imageWidth,height:imageHeight};
  const ratio=Math.min(cfg.width/body.width,cfg.maxHeight/body.height);
  return {scale:ratio,width:imageWidth*ratio,height:imageHeight*ratio,
    bodyWidth:body.width*ratio,bodyHeight:body.height*ratio,
    originX:visual?visual.pivot.x/imageWidth:.5,originY:visual?visual.pivot.y/imageHeight:cfg.originY};
}

export function spriteShadow(type, spriteWidth, footprintHeight=1){
  const cfg=BUILDING_VISUALS[type];
  if(!cfg)return {width:spriteWidth*.44,height:16+(footprintHeight-1)*3,offsetY:-4};
  return {
    width: Math.max(30, spriteWidth*cfg.shadowScale),
    height: cfg.shadowHeight + Math.max(0, footprintHeight-1)*3,
    offsetY: cfg.shadowOffsetY
  };
}

export function sizeBuildingSprite(sprite,type){
  // Image.width is a single frame; texture source width is the complete atlas.
  const d=spriteDimensions(type,sprite.width,sprite.height,sprite.texture?.astrubBuildingVisual);
  if(!d)return sprite;
  return sprite.setOrigin(d.originX,d.originY).setScale(d.scale);
}

/** Keep the HUD above painted masonry rather than above transparent atlas padding. */
export function buildingSpriteTop(sprite){
  const visual=sprite.texture?.astrubBuildingVisual;
  return visual?sprite.y+(visual.bodyBounds.y-visual.pivot.y)*sprite.scaleY:sprite.y-sprite.displayHeight*sprite.originY;
}
