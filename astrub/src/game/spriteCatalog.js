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
export function spriteDimensions(type, imageWidth, imageHeight) {
  const cfg=BUILDING_VISUALS[type];
  if(!cfg || !imageWidth || !imageHeight) return null;
  const ratio=Math.min(cfg.width/imageWidth,cfg.maxHeight/imageHeight);
  return {scale:ratio, width:imageWidth*ratio, height:imageHeight*ratio, originY:cfg.originY};
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
  const d=spriteDimensions(type,sprite.width,sprite.height);
  if(!d)return sprite;
  return sprite.setOrigin(.5,d.originY).setScale(d.scale);
}
