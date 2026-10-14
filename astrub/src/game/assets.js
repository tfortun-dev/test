/** Painted world artwork is loaded as PNGs; no generated Canvas proxies. */
export const DECOR_SPRITES=Object.freeze({
  'tree-0':'tree-0.png','tree-1':'tree-1.png',
  'decor-cart':'decor-cart.png','decor-crate':'decor-crate.png',
  'decor-fountain':'decor-fountain.png','decor-ore':'decor-ore.png',
  'decor-rock':'decor-rock.png'
});
export function preloadWorldDecor(scene){
  for(const [key,file] of Object.entries(DECOR_SPRITES)){
    if(!scene.textures.exists(key))scene.load.image(key,`/assets/decor/${file}`);
  }
}
/** Fail visibly when the required artwork is absent instead of drawing a proxy. */
export function createArt(scene){
  const required=['townhall','sawmill','mine','warehouse','barracks','tower'].map(type=>'b-'+type);
  required.push('tree-0','tree-1');
  const missing=required.filter(key=>!scene.textures.exists(key));
  if(missing.length)throw new Error(`Sprites du village manquants : ${missing.join(', ')}`);
}
