/** Tiny original Canvas sprites: four directions and four walking poses. */
export const AMBIENCE_SPRITES = Object.freeze({
  villager:{scale:.64,speed:36,cadence:160},
  hen:{scale:.52,speed:32,cadence:140},
  rabbit:{scale:.48,speed:47,cadence:115}
});
export const AMBIENCE_DIRECTIONS=['s','e','n','w'];
const W=64,H=80,FOOT=72;
const outline='#4e3c2f';
function oval(c,x,y,rx,ry,fill,stroke=outline){
  c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();
  if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}
}
function shape(c,points,fill){
  c.beginPath();c.moveTo(...points[0]);for(const point of points.slice(1))c.lineTo(...point);c.closePath();
  c.fillStyle=fill;c.fill();c.strokeStyle=outline;c.lineWidth=2;c.lineJoin='round';c.stroke();
}
function line(c,x,y,endX,endY,color,width=3){
  c.beginPath();c.moveTo(x,y);c.lineTo(endX,endY);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();
}
function villager(c,direction,pose){
  const side=direction==='e'||direction==='w',back=direction==='n';
  const stride=[-3,0,3,0][pose],bob=pose%2?-1:0;
  c.save();c.translate(0,bob);
  line(c,27,58,27+stride,68,'#594d41',7);line(c,36,58,36-stride,68,'#6c5743',7);
  oval(c,27+stride,69,5,2.5,'#5b3d2b');oval(c,36-stride,69,5,2.5,'#5b3d2b');
  shape(c,[[23,35],[40,35],[42,56],[35,61],[21,57]],'#5b9a92');
  shape(c,[[23,39],[38,39],[36,60],[25,58]],back?'#50867e':'#ead6a5');
  line(c,21,41,18-stride/2,53,'#deb68a',6);
  line(c,41,41,45+stride/2,50,'#deb68a',6);
  if(!back){
    shape(c,[[39,49],[50,49],[49,60],[40,60]],'#b68750');
    c.beginPath();c.arc(45,49,5,Math.PI,Math.PI*2);c.strokeStyle='#705036';c.lineWidth=2;c.stroke();
    oval(c,43,48,3,3,'#90b34c',null);oval(c,48,47,3,3,'#d9aa53',null);
  }
  oval(c,32,25,11,12,'#f0cc98');
  if(back)oval(c,32,25,10,10,'#91653e');
  else{
    oval(c,side?38:28,27,1.25,1.7,'#383b35',null);
    if(!side)oval(c,36,27,1.25,1.7,'#383b35',null);
    line(c,side?36:29,32,side?40:34,32,'#ab7552',1.4);
    if(side)oval(c,43,29,2.4,2,'#f0cc98');
  }
  shape(c,[[21,20],[25,10],[38,10],[44,20]],'#b8874e');
  shape(c,[[20,17],[43,17],[47,22],[18,22]],'#e8c879');
  line(c,24,17,40,17,'#627e45',3);
  c.restore();
}
function hen(c,direction,pose){
  const back=direction==='n',side=direction==='e'||direction==='w',stride=[-3,0,3,0][pose];
  line(c,26,62,26+stride,70,'#d0923b',3);line(c,37,62,37-stride,70,'#d0923b',3);
  line(c,23+stride,71,29+stride,71,'#b67c32',2);line(c,34-stride,71,40-stride,71,'#b67c32',2);
  const bob=pose%2?-1:0;
  c.save();c.translate(0,bob);
  shape(c,side?[[19,53],[11,35],[25,40],[32,55]]:[[24,47],[16,35],[33,38],[41,50]],'#d7ae70');
  oval(c,31,52,17,13,'#fff1d0');
  oval(c,side?27:back?33:30,54,9,8,'#e5d1a5');
  const hx=side?43:32;
  oval(c,hx,39,10,12,'#fff2d4');
  oval(c,hx-5,28,3,5,'#d55035');oval(c,hx,26,3,6,'#e56341');oval(c,hx+5,28,3,5,'#d55035');
  if(!back){
    shape(c,side?[[51,38],[59,42],[51,45]]:[[28,41],[36,41],[32,47]],'#f3b343');
    oval(c,side?47:27,37,1.8,2,'#3c3c31',null);
    if(!side)oval(c,37,37,1.8,2,'#3c3c31',null);
    oval(c,side?49:32,49,3,4,'#d7503c');
  }
  c.restore();
}
function rabbit(c,direction,pose){
  const side=direction==='e'||direction==='w',back=direction==='n',stride=[-2,1,3,0][pose];
  const bob=[0,-3,-4,-1][pose];
  oval(c,25+stride,69,7,3,'#cbbb9e');oval(c,40-stride,69,6,3,'#e7dcc3');
  c.save();c.translate(0,bob);
  oval(c,19,55,7,7,'#fff0d0');oval(c,31,56,17,12,'#ddd0b4');
  const hx=side?43:32;
  oval(c,hx-5,29,4,15,'#eee1c7');oval(c,hx+5,28,4,16,'#eee1c7');
  oval(c,hx-5,28,1.7,10,'#d5a3a0',null);oval(c,hx+5,27,1.7,11,'#d5a3a0',null);
  oval(c,hx,47,11,12,'#f2e7cf');
  if(!back){
    oval(c,side?48:27,45,1.8,2,'#393c35',null);
    if(!side)oval(c,37,45,1.8,2,'#393c35',null);
    oval(c,side?54:32,51,2,1.5,'#b78683');
    line(c,side?49:21,51,side?58:27,53,'#ab987e',1);
    if(!side)line(c,37,53,43,51,'#ab987e',1);
  }
  c.restore();
}
export function createAmbienceArt(scene){
  const painters={villager,hen,rabbit};
  for(const [kind,paint] of Object.entries(painters)){
    const textureKey=`astrub-ambient-${kind}`;
    if(scene.textures.exists(textureKey))continue;
    const canvas=document.createElement('canvas');canvas.width=W*4;canvas.height=H*4;
    const c=canvas.getContext('2d');
    for(let row=0;row<4;row++)for(let pose=0;pose<4;pose++){
      c.save();c.translate(pose*W,row*H);
      oval(c,32,FOOT,17,4,'rgba(38,57,30,.17)',null);
      if(AMBIENCE_DIRECTIONS[row]==='w'){c.translate(W,0);c.scale(-1,1);}
      paint(c,AMBIENCE_DIRECTIONS[row],pose);c.restore();
    }
    const texture=scene.textures.addCanvas(textureKey,canvas);
    for(let row=0;row<4;row++)for(let pose=0;pose<4;pose++)texture.add(`${AMBIENCE_DIRECTIONS[row]}:${pose}`,0,pose*W,row*H,W,H);
  }
}
