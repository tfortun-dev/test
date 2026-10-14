/* Sprites provisoires dessinés par Canvas, sans fichiers externes. Remplaçables par des PNG. */
const COLORS={
  townhall:['#3a93aa','#2b6f8f'],sawmill:['#cc8646','#9b5736'],
  mine:['#667eae','#3e587d'],warehouse:['#5d9d83','#397d67'],
  barracks:['#bf637b','#8d4467'],tower:['#8d97b8','#546c9b']
};
function polygon(c,coords,fill,stroke='#654b39',width=3){
  c.beginPath();c.moveTo(...coords[0]);for(let i=1;i<coords.length;i++)c.lineTo(...coords[i]);c.closePath();
  c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.lineJoin='round';c.stroke();}
}
function ellipse(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,2*Math.PI);c.fillStyle=color;c.fill();}
function line(c,x1,y1,x2,y2,color='#927248',width=2){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();}
function windowPane(c,x,y,scale=1){
  c.save();c.translate(x,y);c.scale(scale,scale);
  polygon(c,[[-8,-7],[1,-11],[10,-6],[10,12],[0,16],[-8,11]],'#8d623d','#e5b869',3);
  polygon(c,[[-4,-4],[1,-7],[6,-4],[6,8],[1,11],[-4,8]],'#346e7a','#d8eaca',1.5);
  line(c,1,-7,1,11,'#eac78d',1.2);line(c,-4,2,6,2,'#eac78d',1.2);
  c.restore();
}
function roof(c,front,back){
  c.save();c.shadowColor='rgba(40,51,47,.20)';c.shadowBlur=8;c.shadowOffsetY=5;
  c.beginPath();c.moveTo(51,110);
  c.bezierCurveTo(58,70,68,52,107,47);
  c.bezierCurveTo(132,43,157,55,174,72);
  c.bezierCurveTo(186,83,199,106,212,109);
  c.bezierCurveTo(199,108,193,113,180,124);
  c.bezierCurveTo(153,105,112,89,68,125);
  c.closePath();c.fillStyle=front;c.fill();c.lineWidth=5;c.strokeStyle='#d6b06a';c.stroke();c.restore();
  c.beginPath();c.moveTo(104,48);c.bezierCurveTo(129,40,151,52,173,72);c.bezierCurveTo(185,89,184,108,180,123);
  c.lineTo(176,121);c.bezierCurveTo(170,85,145,72,104,48);c.closePath();c.fillStyle=back;c.fill();
  c.strokeStyle='rgba(24,58,69,.25)';c.lineWidth=2;
  for(let i=0;i<4;i++){
    c.beginPath();c.moveTo(64+i*12,92+i*-9);c.quadraticCurveTo(95+i*10,85+i*-7,136+i*10,102+i*-1);c.stroke();
  }
  line(c,53,113,68,126,'#e8c27a',5);line(c,179,124,211,110,'#e8c27a',5);
}
function flag(c,x,y,color='#d76d53'){
  line(c,x,y+52,x,y-12,'#7b6038',3);
  c.beginPath();c.moveTo(x,y-11);c.quadraticCurveTo(x+24,y-22,x+31,y-8);
  c.lineTo(x+19,y+7);c.quadraticCurveTo(x+8,y-2,x,y+1);c.closePath();c.fillStyle=color;c.fill();
  ellipse(c,x,y-13,4,4,'#f6d980');
}
function baseHouse(c,kind){
  const [r1,r2]=COLORS[kind];
  ellipse(c,137,208,97,20,'rgba(37,65,31,.25)');
  polygon(c,[[39,189],[119,164],[224,188],[138,219]],'#bcab75','#8d8756',2);
  polygon(c,[[61,113],[126,82],[204,114],[204,180],[134,202],[61,180]],'#f8dda0','#8b6640',4);
  polygon(c,[[61,113],[126,82],[134,118],[134,202],[61,180]],'#d7b17c','#876544',2.5);
  polygon(c,[[134,118],[204,114],[204,180],[134,202]],'#f2d4a0','#8b6640',2.5);
  line(c,68,116,68,177,'#a8784b',6);line(c,137,126,137,195,'#a8784b',6);line(c,199,116,199,179,'#a8784b',6);
  windowPane(c,89,153,.8);windowPane(c,181,145,.7);
  polygon(c,[[141,160],[158,148],[176,154],[176,189],[141,201]],'#654531','#ca9b62',3);
  ellipse(c,169,173,2.7,2.7,'#f6cf72');
  roof(c,r1,r2);
}
function special(c,kind){
  if(kind==='townhall'){
    polygon(c,[[112,53],[127,28],[157,31],[168,59]],'#f5ddb0','#946b44',4);
    polygon(c,[[108,51],[128,14],[156,20],[172,61]],'#447e9a','#d9b779',5);
    ellipse(c,143,43,12,12,'#ead69a');ellipse(c,143,43,9,9,'#fffae4');
    line(c,143,43,143,37,'#7b7051',2);line(c,143,43,150,46,'#7b7051',2);flag(c,164,12,'#da7955');
    polygon(c,[[96,157],[114,150],[114,174],[96,181]],'#4fa7aa','#d2b471',2);
    ellipse(c,112,183,5,5,'#f6d47d');
  }
  if(kind==='sawmill'){
    for(let j=0;j<3;j++){
      ellipse(c,69+j*9,189-j*2,6,7,'#bf844d');ellipse(c,69+j*9,189-j*2,3,4,'#e5ba78');
      line(c,53+j*9,181,80+j*9,177,'#8c5b3b',7);
    }
    ellipse(c,180,142,17,17,'#ddd9bc');ellipse(c,180,142,5,5,'#9d7849');
    for(let a=0;a<8;a++){let t=a*Math.PI/4;line(c,180+7*Math.cos(t),142+7*Math.sin(t),180+17*Math.cos(t),142+17*Math.sin(t),'#6e7b72',3);}
    polygon(c,[[102,177],[130,166],[131,190],[104,199]],'#b87943','#654631',3);
  }
  if(kind==='mine'){
    polygon(c,[[60,164],[98,145],[135,157],[139,192],[86,210],[61,191]],'#72839c','#4f6175',3);
    c.beginPath();c.moveTo(76,190);c.quadraticCurveTo(96,148,120,169);c.lineTo(121,195);c.closePath();c.fillStyle='#283b4c';c.fill();
    line(c,92,150,102,206,'#b69765',5);line(c,112,156,126,195,'#b69765',5);
    for(let i=0;i<4;i++){const x=139+i*11,y=203-i*4;polygon(c,[[x,y],[x+5,y-9],[x+13,y-5],[x+12,y+6]],i%2?'#95d9ec':'#a9b5e8',null);}
  }
  if(kind==='warehouse'){
    polygon(c,[[139,148],[186,130],[186,192],[139,207]],'#765238','#dfb879',4);
    line(c,140,170,186,153,'#d29d59',4);line(c,162,145,162,197,'#d29d59',4);
    for(let i=0;i<3;i++)polygon(c,[[63+i*18,189-i*5],[86+i*18,184-i*5],[85+i*18,199-i*5],[62+i*18,204-i*5]],'#bc874a','#815936',2);
    line(c,69,164,90,170,'#d8c598',5);
  }
  if(kind==='barracks'){
    flag(c,69,75,'#d06672');flag(c,195,69,'#dfbb69');
    polygon(c,[[150,166],[177,157],[176,190],[150,199]],'#6e5360','#dfa98c',3);
    line(c,166,164,166,187,'#e8dcc5',3);line(c,155,173,176,174,'#e8dcc5',3);
    line(c,71,154,81,173,'#b4bfc4',5);line(c,81,154,71,173,'#d8b969',4);
    ellipse(c,92,194,10,5,'#d5a557');
  }
}
function tower(c){
  ellipse(c,134,212,57,17,'rgba(37,65,31,.28)');
  polygon(c,[[92,123],[134,102],[178,123],[176,201],[134,225],[91,196]],'#eacb9a','#866344',4);
  polygon(c,[[92,123],[134,102],[134,225],[91,196]],'#d3ae79','#866344',2);
  polygon(c,[[90,109],[131,28],[180,108],[135,138]],'#587ca1','#d5b479',5);
  polygon(c,[[131,28],[180,108],[135,138]],'#3d648a','#c1a16e',3);
  windowPane(c,114,160,.9);
  polygon(c,[[149,160],[169,151],[169,193],[149,202]],'#6a4a34','#b98c5a',3);
  flag(c,138,31,'#dba35c');
}
function makeBuilding(scene,kind){
  const canvas=document.createElement('canvas');canvas.width=268;canvas.height=250;
  const c=canvas.getContext('2d');c.translate(3,0);
  if(kind==='tower')tower(c);
  else{baseHouse(c,kind);special(c,kind);}
  scene.textures.addCanvas('b-'+kind,canvas);
}
function makeTree(scene,variant){
  const cv=document.createElement('canvas');cv.width=100;cv.height=124;
  const c=cv.getContext('2d');ellipse(c,50,108,30,8,'rgba(38,87,27,.21)');
  c.strokeStyle='#805c36';c.lineWidth=11;c.lineCap='round';c.beginPath();c.moveTo(51,106);c.quadraticCurveTo(61,78,49,61);c.stroke();
  c.strokeStyle='#966e3b';c.lineWidth=5;c.beginPath();c.moveTo(54,77);c.lineTo(31,65);c.moveTo(54,80);c.lineTo(73,58);c.stroke();
  const palettes=variant===0?['#3f9e57','#7cc44e','#a2cf5a']:['#a0b84e','#e4aa4b','#ca8048'];
  for(let i=0;i<12;i++){
    const a=i*2.39,r=(i%3)*10+4;
    ellipse(c,51+Math.cos(a)*r,52+Math.sin(a)*r*.7,21-(i%3)*1,18-(i%4),palettes[i%3]);
  }
  for(let i=0;i<6;i++)ellipse(c,38+i*5,33+(i%3)*15,2,2, '#c9de76');
  scene.textures.addCanvas('tree-'+variant,cv);
}
function makeUnit(scene,type){
  const cv=document.createElement('canvas');cv.width=60;cv.height=82;const c=cv.getContext('2d');
  ellipse(c,30,72,18,6,'rgba(39,75,53,.29)');
  const isIop=type==='iop';
  polygon(c,[[21,46],[30,40],[39,46],[38,65],[23,65]],isIop?'#e2c182':'#5c9fbe','#544a4b',2);
  polygon(c,[[22,56],[29,60],[32,74],[24,74]],'#56676c','#3f4e54',1);
  polygon(c,[[33,59],[39,56],[40,73],[32,74]],'#51636c','#3f4e54',1);
  ellipse(c,30,34,14,15,'#f0c590');
  polygon(c,[[16,27],[22,17],[38,17],[44,29],[39,35],[20,34]],isIop?'#ba6c43':'#519c7d','#64493d',2);
  ellipse(c,26,35,2,2,'#393b39');ellipse(c,34,35,2,2,'#393b39');
  if(isIop){line(c,40,48,48,19,'#ecedef',5);line(c,40,40,54,44,'#c1a661',4);} else {
    c.strokeStyle='#9a6042';c.lineWidth=4;c.beginPath();c.arc(48,43,17,-Math.PI/2,Math.PI/2);c.stroke();line(c,48,27,48,59,'#e6d9b9',1.5);
  }
  scene.textures.addCanvas('unit-'+type,cv);
}
export function createArt(scene){
  for(const kind of Object.keys(COLORS)) if(!scene.textures.exists('b-'+kind))makeBuilding(scene,kind);
  for(const v of [0,1])if(!scene.textures.exists('tree-'+v))makeTree(scene,v);
  for(const t of ['iop','cra'])if(!scene.textures.exists('unit-'+t))makeUnit(scene,t);
}
