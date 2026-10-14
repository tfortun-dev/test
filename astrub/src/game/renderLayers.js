/**
 * Explicit compositing layers. Tall decorations, buildings and troops belong to
 * the SAME depth-sorted world layer: separating them into fixed visual layers
 * would make it impossible for a troop to pass behind a house and then in front.
 *
 * terrain -> ground details -> depth-sorted world -> world feedback -> placement -> HUD.
 * The DOM panels remain above the canvas independently of Phaser.
 */
import { TH, xy } from './isometric.js';

export const RENDER_LAYERS = Object.freeze({
  terrain: -400, decals: -300, world: 0, effects: 100, preview: 150, hud: 200
});

export function createRenderLayers(scene){
  const result={};
  for(const [key,depth] of Object.entries(RENDER_LAYERS)){
    result[key]=scene.add.layer().setDepth(depth).setName('astrub:'+key);
  }
  return result;
}

export function entityDepth(floorY, offset=0){
  return Math.round(floorY * 100) + offset;
}
export function buildingFootY(building, dimensions){
  const [w,h]=dimensions;
  // The front vertex of a multi-cell footprint is what should sort the house.
  return xy(building.x+(w-1),building.y+(h-1)).y + TH*.18;
}
export function buildingDepth(building, dimensions){
  return entityDepth(buildingFootY(building, dimensions),20);
}
export function unitDepth(floorY){return entityDepth(floorY,30);}
export function decorDepth(floorY){return entityDepth(floorY,10);}
