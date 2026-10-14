import Phaser from 'phaser';
import './style.css';
import './progress.js';
import {VillageScene} from './game/VillageScene.js';
import {BattleScene} from './game/BattleScene.js';
import {BUILDINGS,TROOPS,STORAGE_KEY,MAP_SIZE,getState,number,costText,upgradeCost,upgrade,train,hasBarracks,tick,resetGame,canAfford,canBuild,cap,getProductionInfo,RESOURCE_META} from './game/state.js';
import {formatCountdown,remainingMs,upgradeProgress} from './game/time.js';
import {missingResources,expeditionRequirement,rewardPreview} from './ui.js';

const $=id=>document.getElementById(id);
const setText=(id,text)=>{const el=$(id);if(el&&el.textContent!==text)el.textContent=text;};
const isNewPlayer=!localStorage.getItem(STORAGE_KEY);

const BUILD_CATEGORIES=[
  {key:'resources',label:'Production',types:['sawmill','mine','tower'],thumb:'/assets/ui-premium/cat_resources.png'},
  {key:'economy',label:'Stockage',types:['warehouse'],thumb:'/assets/ui-premium/cat_economy.png'},
  {key:'army',label:'Armée',types:['barracks'],thumb:'/assets/ui-premium/cat_army.png'}
];

export const game=new Phaser.Game({
  type:Phaser.AUTO,
  parent:'game',
  backgroundColor:'#95c675',
  scale:{mode:Phaser.Scale.RESIZE,width:window.innerWidth,height:window.innerHeight},
  render:{pixelArt:false,antialias:true,powerPreference:'high-performance'},
  scene:[VillageScene,BattleScene]
});

let selectedId=null, buildMode=null, movingId=null, toastTimeout=null, buildMenuOpen=false;
let lastSelectionId=null, detailsOpen=false, activeBuildCategory='resources';
let placement=null;
const modalReturnFocus=new Map();
const modalIds=['help-overlay','expedition-overlay'];
const shortage=cost=>missingResources(cost,getState().resources,RESOURCE_META);
function visibleModal(){return modalIds.map($).find(el=>el&&!el.classList.contains('hidden'));}
function syncSceneInput(){
  const enabled=!visibleModal();
  for(const scene of game.scene.getScenes(true)){
    scene.input.enabled=enabled;
    if(scene.input.keyboard){
      if(!enabled)scene.input.keyboard.resetKeys();
      scene.input.keyboard.enabled=enabled;
    }
  }
  document.body.classList.toggle('modal-open',!enabled);
}
function setModalOpen(id,open){
  const overlay=$(id);
  if(!overlay)return;
  if(open){
    if(!overlay.classList.contains('hidden'))return;
    for(const otherId of modalIds)if(otherId!==id)setModalOpen(otherId,false);
    modalReturnFocus.set(id,document.activeElement);
    closeSettingsMenu();
    const dialog=overlay.matches('[role="dialog"]')?overlay:overlay.querySelector('[role="dialog"]')||overlay.firstElementChild;
    dialog?.setAttribute('role','dialog');
    dialog?.setAttribute('aria-modal','true');
  }
  const changed=overlay.classList.contains('hidden')===open;
  overlay.classList.toggle('hidden',!open);
  overlay.setAttribute('aria-hidden',String(!open));
  syncSceneInput();
  if(!changed)return;
  if(open){
    queueMicrotask(()=>{
      if(!overlay.classList.contains('hidden'))overlay.querySelector('button:not(:disabled), [tabindex="0"]')?.focus();
    });
  }else{
    const previous=modalReturnFocus.get(id);
    const target=previous?.isConnected&&previous.getClientRects().length&&!previous.disabled
      ?previous:id==='expedition-overlay'?$('raid-btn'):game.canvas;
    target?.focus({preventScroll:true});
    modalReturnFocus.delete(id);
  }
}
function setDetailsOpen(open){
  detailsOpen=Boolean(open);
  $('building-details').classList.toggle('hidden',!detailsOpen);
  $('selection-info-toggle').setAttribute('aria-expanded',String(detailsOpen));
  $('selection-info-toggle').setAttribute('aria-label',detailsOpen?'Masquer les informations':'Afficher les informations');
}
function toast(msg){
  const el=$('toast');el.textContent=msg;el.classList.add('visible');
  clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('visible'),2900);
}
function resourceHud(){
  const r=getState().resources;
  const storageCap=Math.max(1, cap());
  const keys=['gold','wood','stone'];
  for(const key of keys){
    const value=r[key] ?? 0;
    $(`${key}-value`).textContent=number(value);
    $(`${key}-label`).textContent=RESOURCE_META[key].hud;
    const capacityLabel=$(`${key}-capacity`);
    if(capacityLabel)capacityLabel.textContent=`/ ${number(storageCap)}`;
    const card=$(`${key}-value`)?.closest('.resource');
    if(card){
      const ratio=Math.max(0, Math.min(1, value / storageCap));
      card.style.setProperty('--fill', String(ratio));
      card.setAttribute('data-amount', String(value));
      card.setAttribute('data-cap', String(storageCap));
      card.title=`${number(value)} ${RESOURCE_META[key].label} sur ${number(storageCap)} de stockage`;
    }
  }
}
function setBuildMenu(open){
  buildMenuOpen=open;
  const widget=$('village-controls');
  const toggle=$('build-toggle');
  if(widget) widget.classList.toggle('closed', !open);
  if(toggle){ toggle.setAttribute('aria-expanded', open ? 'true' : 'false'); toggle.title = open ? 'Fermer le menu de construction' : 'Construire'; toggle.setAttribute('aria-label', toggle.title); }
  if(open)refreshBuildAvailability();
}
function toggleBuildMenu(force){
  setBuildMenu(typeof force==='boolean' ? force : !buildMenuOpen);
}
function makeBuildFilters(){
  const el=$('build-filters');
  if(!el)return;
  el.innerHTML='';
  for(const category of BUILD_CATEGORIES){
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='build-filter'+(activeBuildCategory===category.key?' active':'');
    btn.setAttribute('role','tab');
    btn.setAttribute('aria-selected', String(activeBuildCategory===category.key));
    btn.dataset.category = category.key;
    btn.innerHTML=`<img class="build-filter-thumb" src="${category.thumb}" alt="" loading="eager"/><span class="build-filter-copy">${category.label}</span>`;
    btn.addEventListener('click',()=>{ activeBuildCategory=category.key; makeBuildFilters(); makePalette(); });
    el.append(btn);
  }
}
function makePalette(){
  const el=$('build-palette');el.innerHTML='';
  const allowed = BUILD_CATEGORIES.find(c=>c.key===activeBuildCategory)?.types ?? BUILD_CATEGORIES[0].types;
  if($('build-description'))$('build-description').textContent=activeBuildCategory==='resources'?'Produisez vos ressources, puis récoltez les réserves.':activeBuildCategory==='economy'?'Augmentez la capacité de stockage de votre village.':'Formez les troupes qui partiront en expédition.';
  for(const [key,b] of Object.entries(BUILDINGS)){
    if(key==='townhall'||!allowed.includes(key))continue;
    const btn=document.createElement('button');
    btn.type='button';
    btn.dataset.building=key;
    btn.className='build-card'+(buildMode===key?' active':'');
    btn.setAttribute('aria-pressed', String(buildMode===key));
    btn.title=b.desc+'\n'+costText(b.cost);
    btn.innerHTML=`<img class="build-thumb" src="/assets/buildings/b-${key}.png" alt="" loading="eager"/><span class="build-name">${b.label}</span><span class="build-cost">${costText(b.cost)}</span><small class="build-card-status"></small><span class="build-card-cta">Construire</span>`;
    btn.addEventListener('click',()=>{
      if(!game.scene.isActive('VillageScene')||btn.disabled)return;
      setBuildMenu(true);
      game.events.emit('astrub:build',key);
    });
    el.append(btn);
  }
  refreshBuildAvailability();
}
function hasOpenBuildSlot(type){
  if(!canAfford(BUILDINGS[type].cost))return false;
  for(let y=1;y<MAP_SIZE-2;y++)for(let x=1;x<MAP_SIZE-2;x++)if(canBuild(type,x,y))return true;
  return false;
}
function refreshBuildAvailability(){
  for(const btn of $('build-palette').querySelectorAll('[data-building]')){
    const def=BUILDINGS[btn.dataset.building];
    const missing=shortage(def.cost);
    const reason=missing.length?`Manque ${missing.join(' · ')}`:!hasOpenBuildSlot(btn.dataset.building)?'Aucun emplacement libre sur la carte':'';
    btn.disabled=Boolean(reason);
    btn.title=`${def.desc}\n${costText(def.cost)}${reason?'\n'+reason:''}`;
    btn.querySelector('.build-card-status').textContent=reason||'Choisir un emplacement';
    btn.querySelector('.build-card-cta').textContent=buildMode===btn.dataset.building?'Sélectionné':'Construire';
  }
  if(buildMode&&!canAfford(BUILDINGS[buildMode].cost)){
    // State events can arrive during place(); let that transaction finish first.
    queueMicrotask(()=>{
      if(buildMode&&!canAfford(BUILDINGS[buildMode].cost)){
        game.events.emit('astrub:cancelPlacement');
        toast('Construction annulée : les ressources disponibles ont changé.');
      }
    });
  }
}
function placementHud(){
  const panel=$('placement-status');
  if(!panel)return;
  const building=movingId!==null?getState().buildings.find(b=>b.id===movingId):null;
  const type=building?.type||buildMode;
  const active=Boolean(type)&&game.scene.isActive('VillageScene');
  panel.classList.toggle('hidden',!active);
  if(!active){placement=null;return;}
  const def=BUILDINGS[type];
  setText('placement-title',building?`Déplacer : ${def.label}`:`Construire : ${def.label}`);
  const valid=placement?.valid;
  panel.classList.toggle('invalid',valid===false);
  panel.classList.toggle('valid',valid===true);
  const keyboard=window.matchMedia('(pointer:fine)').matches?' · Entrée pour confirmer':'';
  const instruction=valid===true?'Emplacement libre':valid===false?'Zone occupée ou hors de la carte':'Visez une case libre sur la carte';
  setText('placement-copy',`${building?'Déplacement gratuit':costText(def.cost)} · ${instruction}. Cliquez pour placer${keyboard} · Échap pour annuler.`);
}
function refreshSelectionTimer(){
  const b=getState().buildings.find(b=>b.id===selectedId);
  if(!b||!game.scene.isActive('VillageScene'))return;
  if(b.type==='barracks'&&getState().queue.length){
    const next=Math.min(...getState().queue.map(q=>q.ends));
    $('training-info').textContent=`En stock : ${getState().troops.iop} Iop(s), ${getState().troops.cra} Crâ(s). Prochaine unité dans ${formatCountdown(remainingMs(next))}.`;
  }
  if(!b.upgradingUntil)return;
  const timeLeft=remainingMs(b.upgradingUntil);
  const text=formatCountdown(timeLeft);
  const clock=$('selection-live-timer');
  if(clock.textContent!==text)clock.textContent=text;
  $('selection-progress').style.width=`${(upgradeProgress(b)*100).toFixed(2)}%`;
  if(timeLeft===0)$('selection-state').textContent='Finalisation…';

}
function selectionHud(){
  const b=getState().buildings.find(b=>b.id===selectedId);
  const panel=$('selection-panel');
  const hasSelection=Boolean(b) && game.scene.isActive('VillageScene');
  document.body.classList.toggle('selection-open', hasSelection);
  if(!hasSelection){
    panel.classList.add('hidden');
    lastSelectionId=null;
    setDetailsOpen(false);
    return;
  }
  if(lastSelectionId!==b.id){lastSelectionId=b.id;setDetailsOpen(b.type==='barracks');}
  panel.classList.remove('hidden');
  const def=BUILDINGS[b.type];
  $('selection-title').textContent=def.label;
  $('selection-eyebrow').textContent=b.type==='townhall'?'BÂTIMENT PRINCIPAL':'BÂTIMENT DU VILLAGE';
  $('selection-description').textContent=def.desc;
  $('selection-level').textContent=String(b.level);
  $('selection-level').parentElement.title=`Niveau ${b.level} sur 5`;
  const upgrading=b.upgradingUntil>Date.now();
  $('selection-state').textContent=upgrading?'Amélioration en cours':'Disponible';
  const producer=getProductionInfo(b), collecting=$('collect-panel');
  collecting.classList.toggle('hidden',!producer);
  $('collect-btn').classList.toggle('hidden',!producer);
  if(producer){
    const atCapacity=cap()-getState().resources[producer.resource]<1;
    $('collect-resource-name').textContent=`RÉSERVE DE ${producer.label.toUpperCase()}`;
    $('collect-amount').textContent=`${number(producer.ready)} / ${number(producer.capacity)}`;
    $('collect-fill').style.width=`${Math.min(100,(producer.stored/producer.capacity)*100).toFixed(1)}%`;
    $('collect-fill').classList.toggle('full',producer.full);
    $('collect-btn').querySelector('.action-label').textContent='Récolter';
    $('collect-btn').disabled=producer.ready<1||atCapacity;
    $('collect-btn').title=atCapacity?'Stockage plein : dépensez des ressources ou améliorez un entrepôt.':producer.ready<1?'La réserve est encore vide. La production continue.':`Récolter ${number(Math.min(producer.ready,Math.floor(cap()-getState().resources[producer.resource])))} ${producer.label}`;
    $('collect-btn').setAttribute('aria-label',$('collect-btn').title);
    $('collect-tip').textContent=atCapacity
      ? 'Stockage plein : dépensez des ressources ou améliorez un entrepôt.'
      : producer.full?'Réserve pleine ! Cliquez pour la vider et relancer la production.'
      : 'Cliquer sur ce bâtiment récolte aussi ses ressources.';
  }
  const moveLabel=movingId===b.id?'Annuler le déplacement':'Déplacer';
  $('move-btn').querySelector('.action-label').textContent=moveLabel;
  $('move-btn').title=moveLabel;
  $('move-btn').setAttribute('aria-label',moveLabel);
  $('move-btn').classList.toggle('moving',movingId===b.id);
  $('move-instruction').classList.toggle('hidden',movingId!==b.id);
  $('selection-timer').classList.toggle('hidden',!upgrading);
  const cost=upgradeCost(b),button=$('upgrade-btn');
  const upgradeMissing=shortage(cost);
  const upgradeReason=upgrading?'Amélioration en cours : attendez la fin du chantier.':b.level>=5?'Niveau maximum atteint (5).':upgradeMissing.length?`Il manque ${upgradeMissing.join(' · ')}.`:'';
  $('selection-upgrade-cost').textContent=b.level>=5?'Niveau maximum':`Niveau ${b.level+1} : ${costText(cost)}`;
  const upgradeLabel=upgrading?'Amélioration en cours':(b.level>=5?'Niveau maximum':'Améliorer');
  button.querySelector('.action-label').textContent=upgradeLabel;
  button.title=upgradeReason||`Améliorer au niveau ${b.level+1} : ${costText(cost)}`;
  button.setAttribute('aria-label',upgradeLabel);
  button.disabled=upgrading||b.level>=5||!canAfford(cost);
  if($('selection-feedback')){
    const collectReason=producer&&$('collect-btn').disabled?$('collect-btn').title:'';
    const feedback=upgradeReason||`Amélioration : ${costText(cost)}`;
    setText('selection-feedback',movingId===b.id?'Choisissez un emplacement libre · Échap pour annuler.':`${collectReason}${collectReason?' · ':''}${feedback}`);
  }
  const training=$('train-controls');
  training.classList.toggle('hidden',b.type!=='barracks');
  if(b.type==='barracks'){
    const pending=getState().queue;
    const next=pending.length?Math.min(...pending.map(q=>q.ends)):0;
    $('training-info').textContent=`Armée : ${getState().troops.iop} Iop(s), ${getState().troops.cra} Crâ(s). ${pending.length?`${pending.length} unité(s) en formation · prochaine dans ${formatCountdown(remainingMs(next))}.`:'Aucune formation en cours.'}`;
    for(const trainButton of training.querySelectorAll('[data-unit]')){
      const troop=TROOPS[trainButton.dataset.unit];
      const trainingCost={gold:troop.gold,wood:troop.wood,stone:0};
      const missing=shortage(trainingCost);
      const reason=missing.length?`Manque ${missing.join(' · ')}`:'';
      trainButton.disabled=Boolean(reason);
      trainButton.title=reason||`Former un ${troop.label} · ${costText(trainingCost)} · ${troop.trainSeconds} s`;
      trainButton.innerHTML=`<span>${troop.icon} Former un ${troop.label}</span><small class="train-cost">${reason||`${costText(trainingCost)} · ${troop.trainSeconds} s`}</small>`;
    }
  }
  if(upgrading)refreshSelectionTimer();
}
function troopHud(data){
  const palette=$('troop-palette');palette.innerHTML='';
  for(const [key,t] of Object.entries(TROOPS)){
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='build-card'+(data.chosen===key?' active':'');
    btn.disabled=data[key]<=0;
    btn.setAttribute('aria-pressed',String(data.chosen===key));
    btn.title=btn.disabled?`Tous les ${t.label}s ont été déployés.`:`Sélectionner les ${t.label}s pour les déployer dans la zone claire.`;
    btn.innerHTML=`<span class="build-glyph">${t.icon}</span><span class="build-name">${t.label}</span><span class="build-cost">${data[key]} disponible(s)</span><small class="build-card-status">${btn.disabled?'Tous déployés':data.chosen===key?'Prêt à déployer':'Choisir'}</small>`;
    btn.addEventListener('click',()=>game.events.emit('astrub:chooseTroop',key));
    palette.append(btn);
  }
}
function render(){
  resourceHud();selectionHud();refreshBuildAvailability();placementHud();
  const overlay=$('expedition-overlay');
  if(overlay&&!overlay.classList.contains('hidden'))expeditionHud();
}
function expeditionHud(){
  const state=getState();
  const requirement=expeditionRequirement(hasBarracks(),state.troops);
  $('expedition-army').innerHTML=Object.entries(TROOPS).map(([key,t])=>`<article class="expedition-unit"><span class="expedition-unit-symbol" aria-hidden="true">${t.icon}</span><div><span class="panel-eyebrow">${key==='iop'?'CORPS À CORPS':'À DISTANCE'}</span><strong>${t.label}</strong><small>${t.hp} PV · ${t.damage} dégâts</small></div><b class="expedition-unit-count">${number(state.troops[key])}<small>prêts</small></b></article>`).join('');
  const count=Object.values(state.troops).reduce((sum,n)=>sum+n,0);
  setText('expedition-summary',requirement||`${count} unité${count>1?'s':''} disponible${count>1?'s':''}`);
  $('expedition-summary').classList.toggle('unavailable',Boolean(requirement));
  const preview=rewardPreview(state.resources,cap());
  $('expedition-rewards').innerHTML=Object.entries(preview).map(([key,reward])=>`<div class="reward-chip"><span>${RESOURCE_META[key].icon} ${RESOURCE_META[key].label}</span><strong>+${number(reward.amount)}</strong>${reward.receivable<reward.amount?`<small>${number(reward.receivable)} récupérables · stockage limité</small>`:''}</div>`).join('');
  const capped=Object.values(preview).some(reward=>reward.receivable<reward.amount);
  $('expedition-note').textContent=`Les unités déployées quittent votre armée, même si vous rentrez avant la victoire. Les unités non déployées restent au village.${capped?' Dépensez vos ressources ou améliorez un entrepôt pour récupérer tout le butin.':''}`;
  $('expedition-start').disabled=Boolean(requirement);
  $('expedition-start').title=requirement||'Rejoindre le camp et choisir les unités à déployer';
  $('expedition-start').setAttribute('aria-describedby','expedition-summary expedition-note');
}
function openExpedition(){
  if(!game.scene.isActive('VillageScene'))return;
  game.events.emit('astrub:cancelPlacement');
  game.events.emit('astrub:closeSelection');
  setBuildMenu(false);
  expeditionHud();
  setModalOpen('expedition-overlay',true);
}
function closeExpedition(){setModalOpen('expedition-overlay',false);}
function startExpedition(){
  const requirement=expeditionRequirement(hasBarracks(),getState().troops);
  if(requirement){expeditionHud();return;}
  closeExpedition();
  selectedId=null;buildMode=null;movingId=null;selectionHud();placementHud();
  game.scene.stop('VillageScene');
  game.scene.start('BattleScene');
}
$('upgrade-btn').addEventListener('click',()=>{
  if(selectedId==null)return;
  const ret=upgrade(selectedId);
  toast(ret.ok?'Amélioration lancée. Elle se termine même hors ligne.':ret.msg);
  game.events.emit('astrub:rerender');render();
});
$('collect-btn').addEventListener('click',()=>{
  if(selectedId!==null)game.events.emit('astrub:collect',selectedId);
});
$('move-btn').addEventListener('click',()=>{
  if(selectedId!==null)game.events.emit('astrub:move',selectedId);
});
for(const b of document.querySelectorAll('[data-unit]'))b.addEventListener('click',()=>{
  const ret=train(b.dataset.unit);
  toast(ret.ok?`${TROOPS[b.dataset.unit].label} en entraînement !`:ret.msg);
  render();
});
$('build-toggle').addEventListener('click',()=>toggleBuildMenu());
$('build-close')?.addEventListener('click',()=>setBuildMenu(false));
$('placement-cancel')?.addEventListener('click',()=>game.events.emit('astrub:cancelPlacement'));
$('raid-btn').addEventListener('click',openExpedition);
$('expedition-close')?.addEventListener('click',closeExpedition);
$('expedition-cancel')?.addEventListener('click',closeExpedition);
$('expedition-start')?.addEventListener('click',startExpedition);
$('leave-battle').addEventListener('click',()=>game.events.emit('astrub:leaveBattle'));
$('close-selection').addEventListener('click',()=>game.events.emit('astrub:closeSelection'));
$('selection-info-toggle').addEventListener('click',()=>setDetailsOpen(!detailsOpen));
$('detail-close').addEventListener('click',()=>setDetailsOpen(false));
const help=()=>{setBuildMenu(false);setModalOpen('help-overlay',true);};
const closeHelp=()=>{setModalOpen('help-overlay',false);};
const settingsMenu=$('settings-popover');
function closeSettingsMenu(){
  if(settingsMenu)settingsMenu.classList.add('hidden');
  $('menu-settings')?.setAttribute('aria-expanded','false');
}
function toggleSettingsMenu(force){
  if(!settingsMenu)return;
  const open=typeof force==='boolean' ? force : settingsMenu.classList.contains('hidden');
  settingsMenu.classList.toggle('hidden', !open);
  $('menu-settings')?.setAttribute('aria-expanded', String(open));
}
function resetVillage(){
  if(!confirm('Réinitialiser complètement votre village local ?'))return;
  resetGame();
  closeHelp();
  closeExpedition();
  closeSettingsMenu();
  selectedId=null;buildMode=null;movingId=null;
  game.scene.start('VillageScene');
  toast('Votre village a été réinitialisé.');
}
for(const id of ['info-toggle','menu-help']){const el=$(id); if(el) el.addEventListener('click',help);}
for(const id of ['camera-home','menu-home']){const el=$(id); if(el) el.addEventListener('click',()=>{closeSettingsMenu();game.events.emit('astrub:cameraCenter');});}
$('menu-settings')?.addEventListener('click',(event)=>{
  event.stopPropagation();
  toggleSettingsMenu();
});
$('menu-reset')?.addEventListener('click',resetVillage);
$('help-close').addEventListener('click',closeHelp);
$('help-play').addEventListener('click',closeHelp);
$('reset-progress').addEventListener('click',resetVillage);
document.addEventListener('click',(event)=>{
  const target=event.target;
  if(!settingsMenu || settingsMenu.classList.contains('hidden')) return;
  if(target instanceof Node && !settingsMenu.contains(target) && !$('menu-settings')?.contains(target)) closeSettingsMenu();
});
for(const id of modalIds)$(id)?.addEventListener('click',event=>{
  if(event.target===$(id))setModalOpen(id,false);
});
for(const [id,direction] of [['zoom-out',-1],['zoom-in',1]])$(id)?.addEventListener('click',()=>game.events.emit('astrub:zoom',direction));

window.addEventListener('astrub:guide',event=>{
  const action=event.detail?.action;
  if(action==='army'){
    game.events.emit('astrub:cancelPlacement');
    game.events.emit('astrub:closeSelection');
    activeBuildCategory='army';makeBuildFilters();makePalette();setBuildMenu(true);
  }else if(action==='upgrade'){
    const townhall=getState().buildings.find(b=>b.type==='townhall');
    if(townhall&&game.scene.isActive('VillageScene')){
      game.events.emit('astrub:cancelPlacement');
      game.scene.getScene('VillageScene').selectBuilding(townhall.id);
      setDetailsOpen(true);
    }
  }else if(action==='raid')$('raid-btn').click();
});

game.events.on('astrub:toast',toast);
game.events.on('astrub:selected',id=>{selectedId=id;render();});
game.events.on('astrub:mode',mode=>{
  buildMode=mode;makePalette();placementHud();
  if(mode){setBuildMenu(false);game.canvas?.focus({preventScroll:true});}
});
game.events.on('astrub:moving',id=>{
  movingId=id;selectionHud();placementHud();
  if(id!==null)game.canvas?.focus({preventScroll:true});
});
game.events.on('astrub:placement',data=>{placement=data;placementHud();});
game.events.on('astrub:villageStart',()=>{
  $('village-controls').classList.remove('hidden');$('battle-controls').classList.add('hidden');$('raid-btn').classList.remove('hidden');
  selectedId=null;buildMode=null;movingId=null;makeBuildFilters();makePalette();setBuildMenu(false);render();
  if(game.canvas){game.canvas.tabIndex=0;game.canvas.setAttribute('aria-label','Carte du village. Entrée pour confirmer un emplacement, Échap pour annuler.');}
  syncSceneInput();
  setTimeout(()=>window.__astrubGameReady?.(), 180);
});
game.events.on('astrub:battleStart',()=>{
  $('village-controls').classList.add('hidden');$('battle-controls').classList.remove('hidden');$('raid-btn').classList.add('hidden');
  movingId=null;
  setBuildMenu(false);
  document.body.classList.remove('selection-open');
  $('selection-panel').classList.add('hidden');
  placementHud();syncSceneInput();
});
game.events.on('astrub:troops',troopHud);
window.addEventListener('astrub:state',render);
window.addEventListener('keydown',event=>{
  const modal=visibleModal();
  if(modal){
    if(event.key==='Escape'){
      event.preventDefault();event.stopImmediatePropagation();setModalOpen(modal.id,false);
    }else if(event.key==='Tab'){
      const focusable=[...modal.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter(el=>el.getClientRects().length>0);
      const first=focusable[0],last=focusable.at(-1);
      if(first&&((event.shiftKey&&document.activeElement===first)||(!event.shiftKey&&document.activeElement===last)||!modal.contains(document.activeElement))){
        event.preventDefault();(event.shiftKey?last:first).focus();
      }
    }
    return;
  }
  if(event.key==='Escape'){
    if(settingsMenu&&!settingsMenu.classList.contains('hidden'))closeSettingsMenu();
    else if(detailsOpen&&movingId===null&&!buildMode){setDetailsOpen(false);$('selection-info-toggle').focus();}
    else if(buildMode||movingId!==null)game.events.emit('astrub:cancelPlacement');
    else if(buildMenuOpen)setBuildMenu(false);
    else if(selectedId!==null)game.events.emit('astrub:closeSelection');
    event.preventDefault();event.stopImmediatePropagation();
  }else if(event.key==='Enter'&&(buildMode||movingId!==null)){
    const target=event.target;
    if(target instanceof Element&&target.closest('button,a,input,select,textarea,[contenteditable="true"]'))return;
    event.preventDefault();
    if(placement?.valid)game.events.emit('astrub:confirmPlacement');
    else toast('Choisissez un emplacement libre sur la carte avant de confirmer.');
  }
},true);
window.addEventListener('beforeunload',()=>tick());
makeBuildFilters();makePalette();render();
// La production avance chaque seconde uniquement dans la réserve des bâtiments.
// Les ressources du HUD changent seulement au clic de récolte ou via le butin.
// Les compteurs de chantiers restent actualisés à 100 ms.
setInterval(()=>{
  const finished=tick();
  if(finished)game.events.emit('astrub:rerender');
},1000);
let lastUiFrame=0;
function liveClockFrame(timestamp){
  if(timestamp-lastUiFrame>=90){
    refreshSelectionTimer();
    lastUiFrame=timestamp;
  }
  requestAnimationFrame(liveClockFrame);
}
requestAnimationFrame(liveClockFrame);
window.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'){
    const finished=tick();
    if(finished)game.events.emit('astrub:rerender');
    render();
  }
});
if(isNewPlayer)setTimeout(help,850);
