/** Small, bounded walking routes. This module never reads or changes game state. */
export const AMBIENCE_MAX_ACTORS = 4;
const key = (i,j) => `${i},${j}`;

/** Isometric cardinal steps face one of four readable sprite directions. */
export function ambientDirection(di,dj,previous='s'){
  if(Math.abs(di)+Math.abs(dj)<.001)return previous;
  return Math.abs(di)>Math.abs(dj)?(di>0?'e':'w'):(dj>0?'s':'n');
}

export function createAmbientGrid(buildings, sizes, mapSize, radius=7){
  const home=buildings.find(b=>b.type==='townhall');
  const [w,h]=sizes[home?.type] || [1,1];
  const center={i:Math.round(home?home.x+(w-1)/2:(mapSize-1)/2),j:Math.round(home?home.y+(h-1)/2:(mapSize-1)/2)};
  const bounds={minI:Math.max(1,center.i-radius),maxI:Math.min(mapSize-2,center.i+radius),minJ:Math.max(1,center.j-radius),maxJ:Math.min(mapSize-2,center.j+radius)};
  const blocked=new Set();
  for(const b of buildings){
    const dimensions=sizes[b.type];
    if(!dimensions)continue;
    for(let i=b.x;i<b.x+dimensions[0];i++)for(let j=b.y;j<b.y+dimensions[1];j++)blocked.add(key(i,j));
  }
  return {bounds,blocked,center};
}

export function ambientCellFree(grid,i,j){
  const b=grid.bounds;
  return i>=b.minI&&i<=b.maxI&&j>=b.minJ&&j<=b.maxJ&&!grid.blocked.has(key(i,j));
}

/** Cardinal neighbours keep every segment outside the building footprints. */
export function findAmbientPath(grid,start,goal){
  if(!ambientCellFree(grid,start.i,start.j)||!ambientCellFree(grid,goal.i,goal.j))return [];
  const startKey=key(start.i,start.j),goalKey=key(goal.i,goal.j);
  const queue=[start],parents=new Map([[startKey,null]]);
  // Prefer moving towards the destination; a building still forces a real detour.
  const directions=[[Math.sign(goal.i-start.i)||1,0],[0,Math.sign(goal.j-start.j)||1],[-(Math.sign(goal.i-start.i)||1),0],[0,-(Math.sign(goal.j-start.j)||1)]];
  for(let head=0;head<queue.length;head++){
    const node=queue[head],nodeKey=key(node.i,node.j);
    if(nodeKey===goalKey){
      const result=[];
      for(let at=nodeKey;at!==null;at=parents.get(at)){
        const [i,j]=at.split(',').map(Number);result.push({i,j});
      }
      return result.reverse();
    }
    for(const [di,dj] of directions){
      const next={i:node.i+di,j:node.j+dj},nextKey=key(next.i,next.j);
      if(parents.has(nextKey)||!ambientCellFree(grid,next.i,next.j))continue;
      parents.set(nextKey,nodeKey);queue.push(next);
    }
  }
  return [];
}

export function chooseAmbientRoute(grid,random=Math.random,first=false){
  const {bounds:b,center}=grid;
  for(let attempt=0;attempt<16;attempt++){
    const horizontal=first&&attempt===0?true:random()<.5;
    const offset=first&&attempt===0?3:(Math.floor(random()*9)+attempt)%9-4;
    const otherOffset=first&&attempt===0?2:(Math.floor(random()*9)+attempt*2)%9-4;
    let start,goal;
    if(horizontal){
      start={i:b.minI,j:Math.max(b.minJ,Math.min(b.maxJ,center.j+offset))};
      goal={i:b.maxI,j:Math.max(b.minJ,Math.min(b.maxJ,center.j+otherOffset))};
    }else{
      start={i:Math.max(b.minI,Math.min(b.maxI,center.i+offset)),j:b.minJ};
      goal={i:Math.max(b.minI,Math.min(b.maxI,center.i+otherOffset)),j:b.maxJ};
    }
    if(!first&&random()<.5)[start,goal]=[goal,start];
    const route=findAmbientPath(grid,start,goal);
    if(route.length>=7&&route.length<=48)return route;
  }
  return [];
}

export function buildingsSignature(buildings){
  return buildings.map(b=>`${b.id}:${b.type}:${b.x}:${b.y}`).join('|');
}
