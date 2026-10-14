import Phaser from 'phaser';
import { BUILDINGS, MAP_SIZE, buildingAt, canBuild, canMove, collect, getProductionInfo, getState, moveBuilding, number, place } from './state.js';
import { createArt } from './assets.js';
import { xy, ij, hash, TW, TH, tilePoly } from './isometric.js';
import { formatCountdown, remainingMs, upgradeProgress } from './time.js';
import {createRenderLayers, buildingDepth, decorDepth} from './renderLayers.js';
import {sizeBuildingSprite} from './spriteCatalog.js';

export class VillageScene extends Phaser.Scene {
  constructor(){ super('VillageScene'); }
  preload(){
    // On ne recharge pas les sprites quand on revient d'un combat.
    const loadOnce=(key,url)=>{if(!this.textures.exists(key))this.load.image(key,url);};
    loadOnce('astrub-ground','/assets/prairie-astrub-etendue.webp');
    for(const type of Object.keys(BUILDINGS))loadOnce('b-'+type,`/assets/buildings/b-${type}.png`);
    // No optional decor sprites for the gameplay-first version.
  }
  create(){
    createArt(this);
    this.cameras.main.setBackgroundColor('#8dbb60');
    this.layers=createRenderLayers(this);
    this.drawGround();
    this.drawDecor();
    this.buildingObjects=[];
    this.buildMode=null;this.moveId=null;this.selectedId=null;this.lastPlacement=null;
    this.renderBuildings();
    this.ghost=this.add.graphics();
    this.movePreview=this.add.image(0,0,'b-sawmill').setOrigin(.5,.985).setAlpha(.68).setVisible(false);
    this.layers.preview.add([this.ghost,this.movePreview]);
    this.cameraZoom=window.innerWidth<900?.72:.80;
    this.minZoom=window.innerWidth<900?.64:.68;
    this.maxZoom=2.35;
    this.cameras.main.setZoom(this.cameraZoom);
    this.cameras.main.setBounds(-1750,-300,3500,2300);
    this.centerCamera();
    this.keys=this.input.keyboard.addKeys({up:'Z',up2:'W',left:'Q',left2:'A',down:'S',right:'D',escape:'ESC',home:'H'});
    this.input.mouse.disableContextMenu();
    this.dragging=false;this.panCandidate=null;this.lastPointer=null;
    this.input.on('pointerdown',(pointer,over)=>this.onPointerDown(pointer,over));
    this.input.on('pointermove',pointer=>this.onPointerMove(pointer));
    this.input.on('pointerup',pointer=>this.onPointerUp(pointer));
    this.input.on('wheel',(_pointer,_objects,_dx,dy)=>this.zoomCamera(dy>0?-1:1));
    this.sceneBuild=(type)=>this.changeBuildMode(type);
    this.sceneMove=(id)=>this.changeMoveMode(id);
    this.sceneCollect=(id)=>this.collectBuilding(id);
    this.sceneSelectClose=()=>{this.cancelMove();this.selectBuilding(null);};
    this.sceneRefresh=()=>this.renderBuildings();
    this.sceneCenter=()=>this.centerCamera();
    this.sceneZoom=direction=>this.zoomCamera(direction);
    this.sceneCancelPlacement=()=>{
      if(this.moveId!==null)this.cancelMove();
      if(this.buildMode)this.changeBuildMode(null);
    };
    this.sceneConfirmPlacement=()=>this.confirmPlacement();
    this.game.events.on('astrub:cameraCenter',this.sceneCenter);
    this.game.events.on('astrub:zoom',this.sceneZoom);
    this.game.events.on('astrub:build',this.sceneBuild);
    this.game.events.on('astrub:move',this.sceneMove);
    this.game.events.on('astrub:collect',this.sceneCollect);
    this.game.events.on('astrub:closeSelection',this.sceneSelectClose);
    this.game.events.on('astrub:rerender',this.sceneRefresh);
    this.game.events.on('astrub:cancelPlacement',this.sceneCancelPlacement);
    this.game.events.on('astrub:confirmPlacement',this.sceneConfirmPlacement);
    this.events.once('shutdown',()=>{
      this.game.events.off('astrub:cameraCenter',this.sceneCenter);
      this.game.events.off('astrub:zoom',this.sceneZoom);
      this.game.events.off('astrub:build',this.sceneBuild);
      this.game.events.off('astrub:move',this.sceneMove);
      this.game.events.off('astrub:collect',this.sceneCollect);
      this.game.events.off('astrub:closeSelection',this.sceneSelectClose);
      this.game.events.off('astrub:rerender',this.sceneRefresh);
      this.game.events.off('astrub:cancelPlacement',this.sceneCancelPlacement);
      this.game.events.off('astrub:confirmPlacement',this.sceneConfirmPlacement);
    });
    this.lastTimerRefresh=0;
    this.lastProductionRefresh=0;
    this.game.events.emit('astrub:villageStart');
    this.time.delayedCall(80,()=>{if(this.sys.isActive())this.renderBuildings();});
  }
  centerCamera(){
    const middle=(MAP_SIZE-2)/2;
    const p=xy(middle,middle);
    this.cameras.main.centerOn(p.x,p.y+20);
  }
  zoomCamera(direction){
    this.cameraZoom=Phaser.Math.Clamp(this.cameraZoom+(direction>0?.12:-.12),this.minZoom,this.maxZoom);
    this.cameras.main.setZoom(this.cameraZoom);
  }
  drawGround(){
    // La prairie fournie par l'utilisateur : l'original est au centre du grand sol,
    // les bordures sont prolongees par symetrie. Aucune grille verte opaque par-dessus.
    if(this.textures.exists('astrub-ground')){
      this.layers.terrain.add(this.add.image(0,(MAP_SIZE-1)*TH/2,'astrub-ground')
        .setDisplaySize(3500,2300));
    }else{
      const g=this.add.graphics();this.layers.terrain.add(g);
      for(let i=0;i<MAP_SIZE;i++)for(let j=0;j<MAP_SIZE;j++)tilePoly(g,i,j,0x90c66e,1);
    }
    // La grille de placement n'apparait qu'au moment de construire/deplacer.
  }
  drawDecor(){
    // Version 0.5.1 gameplay-first: no surrounding trees or props for now.
    // We keep the function so décor can be reintroduced later.
    return;
  }
  renderBuildings(){
    if(!this.sys.isActive()) return;
    for(const obj of this.buildingObjects){
      for(const key of ['image','label','glow','shadow','progress','harvest'])obj[key]?.destroy();
    }
    this.buildingObjects=[];
    const now=Date.now();
    for(const b of getState().buildings){
      const [w,h]=BUILDINGS[b.type].size;
      const p=xy(b.x+(w-1)/2,b.y+(h-1)/2);
      const floorY=p.y+12;
      const depth=buildingDepth(b,[w,h]);
      // No baked ground shadow for now: the clean gameplay prototype reads better without it.
      const shadow=null;
      let glow=null;
      if(b.id===this.selectedId){
        glow=this.add.ellipse(p.x,floorY,w*TW*.77,28+(h-1)*8,0xe6f8a0,.26)
          .setDepth(depth-3);
        this.layers.world.add(glow);
      }
      const image=sizeBuildingSprite(
        this.add.image(p.x,floorY,'b-'+b.type),b.type
      ).setDepth(depth).setData('buildingId',b.id);
      image.setInteractive({pixelPerfect:true,alphaTolerance:18,useHandCursor:true});
      this.layers.world.add(image);
      // World HUD lives in a separate top layer, so building geometry never
      // accidentally masks resource badges or the remaining construction time.
      const badgeY=floorY-image.displayHeight*image.originY-15;
      const active=b.upgradingUntil>now;
      let label=null,progress=null;
      if(active){
        label=this.add.text(p.x,badgeY,
          `⏳ ${formatCountdown(remainingMs(b.upgradingUntil,now))}`,{
          fontFamily:'Trebuchet MS, sans-serif',fontSize:'14px',
          fontStyle:'bold',color:'#fff9e2',backgroundColor:'#344f40',
          padding:{x:8,y:4}
        }).setOrigin(.5);
        this.layers.hud.add(label);
      }
      if(active){progress=this.add.graphics();this.layers.hud.add(progress);}
      // No floating resource counter above producer buildings anymore:
      // production is revealed in the side panel and can be collected on click.
      const harvest=null;
      const entry={image,label,glow,shadow,progress,harvest,buildingId:b.id,barX:p.x-38,barY:badgeY+15};
      this.buildingObjects.push(entry);
      if(progress)this.drawUpgradeBar(entry,upgradeProgress(b,now));
    }
    this.updateProductionLabels();
    if(this.selectedId&&!getState().buildings.find(b=>b.id===this.selectedId))this.selectBuilding(null);
  }
  drawUpgradeBar(entry,percent){
    const g=entry.progress;
    if(!g)return;
    g.clear();
    g.fillStyle(0x173c31,.95);g.fillRoundedRect(entry.barX-2,entry.barY-2,80,9,4);
    g.fillStyle(0xb9e77e,1);g.fillRoundedRect(entry.barX,entry.barY,Math.max(0,76*percent),5,2);
  }
  updateBuildingTimers(now=Date.now()){
    const buildings=getState().buildings;
    for(const entry of this.buildingObjects){
      if(!entry.progress)continue;
      const b=buildings.find(building=>building.id===entry.buildingId);
      if(!b||!b.upgradingUntil)continue;
      const caption=`⏳ ${formatCountdown(remainingMs(b.upgradingUntil,now))}`;
      if(entry.label.text!==caption)entry.label.setText(caption);
      this.drawUpgradeBar(entry,upgradeProgress(b,now));
    }
  }
  updateProductionLabels(){
    // Floating counters above buildings were removed in v0.5.8.
    return;
  }
  collectBuilding(id){
    const result=collect(id);
    if(result.ok){
      this.game.events.emit('astrub:toast',`${result.icon} +${number(result.amount)} ${result.label} récoltés !`);
    }else if(result.msg.startsWith('Stockage plein')){
      this.game.events.emit('astrub:toast',result.msg);
    }
    this.updateProductionLabels();
    return result;
  }
  cancelMove(){
    if(this.moveId===null)return;
    this.moveId=null;
    this.lastPlacement=null;this.lastPlacementKey=null;
    this.ghost.clear();
    this.movePreview.setVisible(false);
    this.game.events.emit('astrub:moving',null);
  }
  changeMoveMode(id){
    if(id===this.moveId){this.cancelMove();return;}
    const b=getState().buildings.find(b=>b.id===id);
    if(!b)return;
    this.buildMode=null;
    this.game.events.emit('astrub:mode',null);
    this.moveId=id;
    this.lastPlacement=null;this.lastPlacementKey=null;
    this.selectBuilding(id);
    this.game.events.emit('astrub:moving',id);
    this.ghost.clear();this.movePreview.setVisible(false);
  }
  changeBuildMode(type){
    this.cancelMove();
    this.buildMode=(type===this.buildMode?null:type);
    this.lastPlacement=null;this.lastPlacementKey=null;
    this.selectBuilding(null);
    this.ghost.clear();
    this.game.events.emit('astrub:mode',this.buildMode);
    this.movePreview.setVisible(false);
  }
  drawGhost(pointer){
    const moving=this.moveId!==null?getState().buildings.find(b=>b.id===this.moveId):null;
    const type=moving?.type||this.buildMode;
    if(!type||!pointer){this.ghost.clear();this.movePreview.setVisible(false);return;}
    // HTML controls sit above the canvas. Moving onto "Valider" must keep the
    // aimed tile instead of replacing it with a tile underneath that button.
    if(!this.pointerIsOnMap(pointer))return;
    const world=this.cameras.main.getWorldPoint(pointer.x,pointer.y);
    const at=ij(world.x,world.y);const [w,h]=BUILDINGS[type].size;
    const x=at.i-Math.floor(w/2),y=at.j-Math.floor(h/2);
    const valid=moving?canMove(moving.id,x,y):canBuild(type,x,y);
    this.drawPlacementPreview({type,x,y,valid,moving:Boolean(moving),movingId:moving?.id??null});
  }
  pointerIsOnMap(pointer){
    const canvas=this.game.canvas,rect=canvas.getBoundingClientRect();
    const clientX=rect.left+pointer.x*rect.width/this.scale.gameSize.width;
    const clientY=rect.top+pointer.y*rect.height/this.scale.gameSize.height;
    return document.elementFromPoint(clientX,clientY)===canvas;
  }
  drawPlacementPreview(placement){
    const {type,x,y,valid,moving,movingId}=placement;
    const [w,h]=BUILDINGS[type].size;
    this.ghost.clear();this.movePreview.setVisible(false);
    this.lastPlacement=placement;
    const placementKey=`${type}:${x}:${y}:${valid}:${movingId??''}`;
    if(placementKey!==this.lastPlacementKey){
      this.lastPlacementKey=placementKey;
      this.game.events.emit('astrub:placement',{type,x,y,valid,moving});
    }
    for(let i=x;i<x+w;i++)for(let j=y;j<y+h;j++) tilePoly(this.ghost,i,j,valid?0xe6ed99:0xe96d5a,.57);
    {
      const p=xy(x+(w-1)/2,y+(h-1)/2);
      this.movePreview.setTexture('b-'+type).setPosition(p.x,p.y+12);
      sizeBuildingSprite(this.movePreview,type);
      this.movePreview.setTint(valid?0xffffff:0xffb3a5).setVisible(true);
    }
  }
  confirmPlacement(){
    const preview=this.lastPlacement;
    if(!preview||(!this.buildMode&&this.moveId===null))return;
    const moving=this.moveId!==null?getState().buildings.find(b=>b.id===this.moveId):null;
    const type=moving?.type||this.buildMode;
    if(preview.type!==type||preview.moving!==Boolean(moving)||preview.movingId!==(moving?.id??null))return;
    const valid=moving?canMove(moving.id,preview.x,preview.y):canBuild(type,preview.x,preview.y);
    if(!valid){
      this.drawPlacementPreview({...preview,valid:false});
      this.game.events.emit('astrub:toast','Cet emplacement n’est plus disponible. Choisissez une case libre et vérifiez vos ressources.');
      return;
    }
    this.commitPlacement(preview.x,preview.y);
  }
  commitPlacement(x,y){
    if(this.moveId!==null){
      const selected=getState().buildings.find(b=>b.id===this.moveId);
      if(!selected){this.cancelMove();return;}
      const result=moveBuilding(selected.id,x,y);
      if(result.ok){
        this.cancelMove();
        this.renderBuildings();
        this.selectBuilding(selected.id);
        this.game.events.emit('astrub:toast',`${BUILDINGS[selected.type].label} déplacé !`);
      }else this.game.events.emit('astrub:toast',result.msg);
      return;
    }
    if(this.buildMode){
      const type=this.buildMode;
      const result=place(type,x,y);
      if(result.ok){
        this.renderBuildings();
        this.game.events.emit('astrub:toast',`${BUILDINGS[type].label} construit !`);
        this.changeBuildMode(null);
      }else this.game.events.emit('astrub:toast',result.msg);
    }
  }
  onPointerDown(pointer,over){
    if(!this.pointerIsOnMap(pointer))return;
    if(pointer.rightButtonDown()||pointer.middleButtonDown()){
      this.dragging=true;
      this.panCandidate=null;
      this.lastPointer={x:pointer.x,y:pointer.y};
      return;
    }
    if(!pointer.leftButtonDown())return;
    const world=this.cameras.main.getWorldPoint(pointer.x,pointer.y);
    const at=ij(world.x,world.y);
    if(this.moveId!==null||this.buildMode){
      const moving=this.moveId!==null?getState().buildings.find(b=>b.id===this.moveId):null;
      if(this.moveId!==null&&!moving){this.cancelMove();return;}
      const [w,h]=BUILDINGS[moving?.type||this.buildMode].size;
      this.commitPlacement(at.i-Math.floor(w/2),at.j-Math.floor(h/2));
      return;
    }
    const hit=over?.find(obj=>obj.getData?.('buildingId'));
    this.panCandidate={x:pointer.x,y:pointer.y,at,hitId:hit?.getData('buildingId'),dragged:false};
    this.lastPointer={x:pointer.x,y:pointer.y};
  }
  onPointerMove(pointer){
    if(this.panCandidate&&pointer.isDown&&!this.panCandidate.dragged){
      if(Math.hypot(pointer.x-this.panCandidate.x,pointer.y-this.panCandidate.y)>7){
        this.panCandidate.dragged=true;
        this.dragging=true;
      }
    }
    if(this.dragging&&this.lastPointer){
      const dx=(pointer.x-this.lastPointer.x)/this.cameraZoom;
      const dy=(pointer.y-this.lastPointer.y)/this.cameraZoom;
      this.cameras.main.scrollX-=dx;
      this.cameras.main.scrollY-=dy;
      this.lastPointer={x:pointer.x,y:pointer.y};
    }
    if(this.buildMode||this.moveId!==null)this.drawGhost(pointer);
  }
  onPointerUp(_pointer){
    const click=this.panCandidate;
    this.panCandidate=null;
    this.dragging=false;
    this.lastPointer=null;
    if(click&&!click.dragged){
      const b=click.hitId
        ?getState().buildings.find(item=>item.id===click.hitId)
        :buildingAt(click.at.i,click.at.j);
      this.selectBuilding(b?.id??null);
      if(b&&getProductionInfo(b))this.collectBuilding(b.id);
    }
  }
  selectBuilding(id){
    this.selectedId=id;
    this.game.events.emit('astrub:selected',id);
    this.renderBuildings();
  }
  update(time,delta){
    if(Phaser.Input.Keyboard.JustDown(this.keys.home))this.centerCamera();
    if(time-this.lastTimerRefresh>=90){
      this.updateBuildingTimers();
      this.lastTimerRefresh=time;
    }
    if(time-this.lastProductionRefresh>=400){
      this.updateProductionLabels();
      this.lastProductionRefresh=time;
    }
    if(Phaser.Input.Keyboard.JustDown(this.keys.escape)){
      if(this.moveId!==null)this.cancelMove();
      else if(this.buildMode)this.changeBuildMode(null);
      else if(this.selectedId)this.selectBuilding(null);
    }
    let x=0,y=0;
    if(this.keys.left.isDown||this.keys.left2.isDown)x=-1;
    if(this.keys.right.isDown)x=1;
    if(this.keys.up.isDown||this.keys.up2.isDown)y=-1;
    if(this.keys.down.isDown)y=1;
    if(x||y){this.cameras.main.scrollX+=x*delta*.50/this.cameraZoom;this.cameras.main.scrollY+=y*delta*.50/this.cameraZoom;}
  }
}
