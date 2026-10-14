import test from 'node:test';
import assert from 'node:assert/strict';
import {AMBIENCE_MAX_ACTORS,ambientCellFree,ambientDirection,buildingsSignature,chooseAmbientRoute,createAmbientGrid,findAmbientPath} from '../src/game/ambiencePaths.js';

const sizes={townhall:[3,3],farm:[2,2],small:[1,1]};
const village=[{id:1,type:'townhall',x:19,y:19},{id:2,type:'farm',x:16,y:21},{id:3,type:'farm',x:24,y:21}];
function validRoute(grid,path){
  assert.ok(path.length>1);
  for(let n=0;n<path.length;n++){
    const cell=path[n];assert.ok(ambientCellFree(grid,cell.i,cell.j));
    if(n)assert.equal(Math.abs(cell.i-path[n-1].i)+Math.abs(cell.j-path[n-1].j),1,'pas cardinal, sans diagonale à travers un bâtiment');
  }
}
test('les passants contournent les empreintes sans sortir du quartier borné',()=>{
  const grid=createAmbientGrid(village,sizes,42);
  assert.equal(grid.blocked.size,17);
  assert.equal(AMBIENCE_MAX_ACTORS,4);
  let seed=17;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  for(let n=0;n<80;n++)validRoute(grid,chooseAmbientRoute(grid,random,n===0));
  const first=chooseAmbientRoute(grid,()=>.5,true);
  assert.ok(first.some(cell=>Math.abs(cell.i-grid.center.i)<=3&&Math.abs(cell.j-grid.center.j)<=3),'le premier passage reste près du cœur du village');
});
test('une construction ou un déplacement exige une nouvelle route sûre',()=>{
  const grid=createAmbientGrid(village,sizes,42);
  const start={i:13,j:23},goal={i:27,j:23};
  const original=findAmbientPath(grid,start,goal);
  validRoute(grid,original);
  const next=[...village,{id:4,type:'farm',x:20,y:22}];
  const changed=createAmbientGrid(next,sizes,42);
  const detour=findAmbientPath(changed,start,goal);
  validRoute(changed,detour);
  assert.ok(detour.length>original.length);
  assert.notEqual(buildingsSignature(next),buildingsSignature(village));
  assert.equal(buildingsSignature(village),buildingsSignature(village.map(b=>({...b,level:2,stored:99}))),'une récolte ou une amélioration ne remplace pas les routes');
  const moved=next.map(b=>b.id===4?{...b,x:18,y:23}:b);
  validRoute(createAmbientGrid(moved,sizes,42),findAmbientPath(createAmbientGrid(moved,sizes,42),start,goal));
});
test('aucun passant ne naît dans une empreinte, et un quartier fermé échoue proprement',()=>{
  const grid=createAmbientGrid(village,sizes,42);
  assert.deepEqual(findAmbientPath(grid,{i:19,j:19},{i:27,j:23}),[]);
  const sealed={...grid,blocked:new Set()};
  for(let i=grid.bounds.minI;i<=grid.bounds.maxI;i++)for(let j=grid.bounds.minJ;j<=grid.bounds.maxJ;j++)sealed.blocked.add(`${i},${j}`);
  assert.deepEqual(chooseAmbientRoute(sealed,()=>.5),[]);
});
test('un cœur déplacé en bord de carte conserve des limites valides',()=>{
  const grid=createAmbientGrid([{id:1,type:'townhall',x:1,y:1}],sizes,42);
  assert.ok(grid.bounds.minI>=1&&grid.bounds.minJ>=1);
  assert.ok(grid.bounds.maxI<41&&grid.bounds.maxJ<41);
  validRoute(grid,chooseAmbientRoute(grid,()=>.6));
});
test('les quatre pas isométriques utilisent quatre directions et gardent la pose à l’arrêt',()=>{
  assert.equal(ambientDirection(1,0),'e');
  assert.equal(ambientDirection(-1,0),'w');
  assert.equal(ambientDirection(0,1),'s');
  assert.equal(ambientDirection(0,-1),'n');
  assert.equal(ambientDirection(0,0,'w'),'w');
});
