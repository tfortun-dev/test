import Phaser from 'phaser';
import {createArt} from './assets.js';
import {xy,ij,tilePoly,hash} from './isometric.js';
import {getState,resolveBattle,TROOPS} from './state.js';
import {createRenderLayers,buildingDepth,unitDepth,decorDepth} from './renderLayers.js';
import {sizeBuildingSprite} from './spriteCatalog.js';
import {installUnitAnimations,playUnitAnimation,directionFromVector} from './unitAnimations.js';

export class BattleScene extends Phaser.Scene {
  constructor(){super('BattleScene');}
  preload(){
    for(const type of ['iop','cra']){
      const key='unit-anim-'+type;
      if(!this.textures.exists(key))this.load.spritesheet(key,`/assets/units/${type}-atlas.png`,{frameWidth:108,frameHeight:116});
    }
  }
  create(){
    createArt(this);
    this.layers=createRenderLayers(this);
    installUnitAnimations(this);
    this.cameras.main.setBackgroundColor('#9cbe76');
    if(this.textures.exists('astrub-ground')){
      this.layers.terrain.add(this.add.image(0,260,'astrub-ground').setDisplaySize(1440,950));
    }
    this.ground=this.add.graphics();this.layers.decals.add(this.ground);
    for(let s=0;s<28;s++)for(let i=0;i<14;i++){
      const j=s-i;if(j<0||j>13)continue;
      const p=xy(i,j);
      const col=(i<6&&j<6)?0x9ac878:[0x98b875,0x8cba71,0x9ec17a][Math.floor(hash(i,j,67)*3)];
      tilePoly(this.ground,i,j,col,.16,0x79975f);
      if(i+j<11&&i>0&&j>0)tilePoly(this.ground,i,j,0xbadcc0,.24);
      if(hash(i,j,71)>.91){this.ground.fillStyle(0xf6e3a6,.75);this.ground.fillCircle(p.x+4,p.y,2);}
      if(j>10&&hash(i,j,72)>.82){
        const tree=this.add.image(p.x,p.y,'tree-'+(i%2)).setOrigin(.5,.985).setScale(.67).setDepth(decorDepth(p.y));
        this.layers.world.add(tree);
      }
    }
    this.targets=[];
    this.makeTarget(8,8,'b-barracks',130,'Camp des bandits');
    this.makeTarget(10,6,'b-tower',65,'Golden Vault');
    this.makeTarget(6,10,'b-warehouse',75,'Réserve');
    this.units=[];
    this.used={iop:0,cra:0};this.chosen='iop';this.over=false;this.finalized=false;
    this.cameras.main.setZoom(Math.min(.97,window.innerWidth<800?.72:.91));
    this.cameras.main.centerOn(0,258);
    this.input.on('pointerdown',this.deploy,this);
    this.pickTroop=(t)=>{this.chosen=t;this.game.events.emit('astrub:troops',this.getAvailable());};
    this.leave=()=>{this.finish(false);this.scene.start('VillageScene');};
    this.game.events.on('astrub:chooseTroop',this.pickTroop);
    this.game.events.on('astrub:leaveBattle',this.leave);
    this.events.once('shutdown',()=>{
      this.game.events.off('astrub:chooseTroop',this.pickTroop);
      this.game.events.off('astrub:leaveBattle',this.leave);
    });
    const title=this.add.text(0,125,'ZONE DE DÉPLOIEMENT',{
      fontFamily:'Trebuchet MS, sans-serif',fontSize:'13px',color:'#e9ffcf',fontStyle:'900',stroke:'#557d57',strokeThickness:4
    }).setOrigin(.5);
    this.layers.hud.add(title);
    this.game.events.emit('astrub:battleStart');
    this.game.events.emit('astrub:troops',this.getAvailable());
    this.game.events.emit('astrub:toast','Placez vos troupes dans la zone claire, puis observez leur attaque !');
    this.events.once('shutdown',()=>{this.ground=null;});
  }
  makeTarget(i,j,texture,hp,name){
    const p=xy(i,j),type=texture.replace('b-','');
    const shadow=this.add.ellipse(p.x,p.y+12,104,31,0x233b27,.3).setDepth(unitDepth(p.y+12)-20);
    this.layers.world.add(shadow);
    const building={x:i,y:j};
    const img=sizeBuildingSprite(this.add.image(p.x,p.y+12,texture),type)
      .setDepth(buildingDepth(building,[2,2]))
      .setTint(texture==='b-barracks'?0xffdddd:0xf9ede0);
    this.layers.world.add(img);
    const bar=this.add.graphics();this.layers.effects.add(bar);
    const target={img,bar,x:p.x,y:p.y,barY:p.y+12-img.displayHeight*img.originY-19,hp,maxHp:hp,name};
    this.targets.push(target);this.drawHP(target);
  }
  drawHP(t){
    t.bar.clear();if(t.hp<=0)return;
    const w=83,x=t.x-w/2,y=t.barY;
    t.bar.fillStyle(0x4e3b33,.88);t.bar.fillRoundedRect(x-2,y-2,w+4,10,4);
    t.bar.fillStyle(t.hp/t.maxHp>.4?0x9cda7c:0xeaa05c,1);
    t.bar.fillRoundedRect(x,y,Math.max(0,w*t.hp/t.maxHp),6,2);
  }
  getAvailable(){
    return {iop:Math.max(0,getState().troops.iop-this.used.iop),cra:Math.max(0,getState().troops.cra-this.used.cra),chosen:this.chosen};
  }
  deploy(pointer){
    if(this.over||!pointer.leftButtonDown())return;
    const p=this.cameras.main.getWorldPoint(pointer.x,pointer.y);
    const a=ij(p.x,p.y);
    if(a.i<0||a.j<0||a.i>13||a.j>13||a.i+a.j>=12){this.game.events.emit('astrub:toast','Déployez les troupes dans la zone claire, à gauche du camp.');return;}
    const type=this.chosen;
    if(this.getAvailable()[type]<=0){this.game.events.emit('astrub:toast',`Plus de ${TROOPS[type].label} disponibles. Sélectionnez une autre troupe.`);return;}
    const t=TROOPS[type];
    const animated=this.textures.exists('unit-anim-'+type);
    const image=this.add.sprite(p.x,p.y,animated?'unit-anim-'+type:'unit-'+type)
      .setOrigin(.5,.92).setScale(.88).setDepth(unitDepth(p.y));
    this.layers.world.add(image);
    const unit={image,type,x:p.x,y:p.y,hp:t.hp,attackTimer:0,speed:t.speed,dead:false,facing:'s',animated};
    if(animated){
      playUnitAnimation(image,type,'idle','s');
      image.on('animationcomplete',()=>{
        if(!unit.dead&&image.active)playUnitAnimation(image,type,'idle',unit.facing);
      });
    }
    this.units.push(unit);this.used[type]++;
    this.game.events.emit('astrub:troops',this.getAvailable());
  }
  update(time,dt){
    if(this.over)return;
    const delta=Math.min(dt,70)/1000;
    for(const u of this.units){
      if(u.dead)continue;
      const alive=this.targets.filter(t=>t.hp>0);
      if(!alive.length){this.win();break;}
      let target=alive[0],dist=Infinity;
      for(const t of alive){const d=Math.hypot(t.x-u.x,t.y-u.y);if(d<dist){dist=d;target=t;}}
      u.facing=directionFromVector(target.x-u.x,target.y-u.y,u.facing);
      const reach=u.type==='cra'?75:35;
      if(dist>reach){
        const step=Math.min(u.speed*delta,dist-reach);
        u.x+=(target.x-u.x)/dist*step;u.y+=(target.y-u.y)/dist*step;
        u.image.setPosition(u.x,u.y).setDepth(unitDepth(u.y));
        if(u.animated)playUnitAnimation(u.image,u.type,'walk',u.facing);
      }else if(time>u.attackTimer){
        if(u.animated)playUnitAnimation(u.image,u.type,'attack',u.facing);
        u.attackTimer=time+(u.type==='iop'?760:1040);
        target.hp=Math.max(0,target.hp-TROOPS[u.type].damage);
        this.drawHP(target);
        this.cameras.main.shake(32,.0007);
        if(target.hp<=0){
          this.tweens.add({targets:target.img,alpha:0,scaleX:.4,scaleY:.4,duration:400,ease:'Cubic.easeIn'});
          this.game.events.emit('astrub:toast',`${target.name} détruit !`);
        }else{target.img.setTint(0xffd4b9);this.time.delayedCall(100,()=>target.img?.active&&target.img.setTint(0xfce5d1));}
      }else if(u.animated&&(!u.image.anims.isPlaying || u.image.anims.currentAnim?.key.includes(':walk:'))){
        playUnitAnimation(u.image,u.type,'idle',u.facing);
      }
    }
    if(this.targets.every(t=>t.hp<=0))this.win();
  }
  win(){
    if(this.over)return;this.over=true;
    this.finish(true);
    this.game.events.emit('astrub:toast','VICTOIRE ! +650 kamas, +250 vivres, +140 élixirs');
    const victoryLabel=this.add.text(0,195,'VICTOIRE !',{
      fontFamily:'Trebuchet MS, sans-serif',fontSize:'44px',fontStyle:'900',color:'#fff9da',stroke:'#417151',strokeThickness:8
    }).setOrigin(.5);
    this.layers.hud.add(victoryLabel);
    this.time.delayedCall(3000,()=>this.scene.start('VillageScene'));
  }
  finish(victory){if(this.finalized)return;this.finalized=true;resolveBattle(this.used,victory);}
}
