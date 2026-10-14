import {characterSheet,characterTextureKey,installCharacterMetadata} from './characterSprites.js';

/** Painted animation poses, exported from RGBA artwork without runtime drawing. */
export const AMBIENCE_SPRITES=Object.freeze({
  villager:{speed:36,cadence:160},
  hen:{speed:32,cadence:140},
  rabbit:{speed:47,cadence:115}
});
export const AMBIENCE_DIRECTIONS=Object.freeze(['s','w','n','e']);

export function createAmbienceArt(scene){
  installCharacterMetadata(scene);
  for(const kind of Object.keys(AMBIENCE_SPRITES)){
    const key=characterTextureKey(kind);
    if(!scene.textures.exists(key))continue;
    const texture=scene.textures.get(key),sheet=characterSheet(scene,kind);
    for(let row=0;row<sheet.directions.length;row++)for(let pose=0;pose<4;pose++){
      const name=`${sheet.directions[row]}:${pose}`;
      if(!texture.has(name))texture.add(name,0,pose*sheet.frameWidth,row*sheet.frameHeight,sheet.frameWidth,sheet.frameHeight);
    }
  }
}
