export const TW=76;
export const TH=38;
export const xy = (i,j) => ({x:(i-j)*TW/2, y:(i+j)*TH/2});
export const ij = (x,y) => ({i:Math.round((x/(TW/2)+y/(TH/2))/2),j:Math.round((y/(TH/2)-x/(TW/2))/2)});
export const hash=(x,y,extra=0)=>{
  let v=(x*12345+y*57261+extra*27883)>>>0;
  v=(v^(v>>>13))*1274126177;
  return ((v^(v>>>16))>>>0)/4294967295;
};
export function tilePoly(g,x,y,color,alpha=1,stroke=0) {
  const p=xy(x,y);
  g.fillStyle(color,alpha);
  g.fillPoints([
    {x:p.x,y:p.y-TH/2},
    {x:p.x+TW/2,y:p.y},
    {x:p.x,y:p.y+TH/2},
    {x:p.x-TW/2,y:p.y}
  ],true);
  if(stroke){g.lineStyle(.65,stroke,.3);g.strokePoints([
    {x:p.x,y:p.y-TH/2},{x:p.x+TW/2,y:p.y},
    {x:p.x,y:p.y+TH/2},{x:p.x-TW/2,y:p.y}
  ],true);}
}
