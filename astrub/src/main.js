import Phaser from 'phaser';
import './style.css';
import './ui-skin.css';
import './progress.js';
import {VillageScene} from './game/VillageScene.js';
import {BattleScene} from './game/BattleScene.js';
import {BUILDINGS,TROOPS,STORAGE_KEY,MAP_SIZE,getState,number,upgradeCost,upgrade,train,hasBarracks,tick,resetGame,canAfford,canBuild,cap,getProductionInfo,RESOURCE_META} from './game/state.js';
import {formatCountdown,remainingMs,upgradeProgress} from './game/time.js';
import {missingResources,expeditionRequirement,rewardPreview} from './ui.js';

const $=id=>document.getElementById(id);
const setNodeText=(el,value)=>{const text=String(value);if(el&&el.textContent!==text)el.textContent=text;};
const setText=(id,text)=>setNodeText($(id),text);
const setAttributeValue=(el,name,value)=>{const text=String(value);if(el&&el.getAttribute(name)!==text)el.setAttribute(name,text);};
const resourceIcon={gold:'kamas',wood:'vivres',stone:'elixirs'};
const costSummary=cost=>Object.entries(cost).filter(([,amount])=>amount>0).map(([key,amount])=>`${number(amount)} ${RESOURCE_META[key].label}`).join(' · ')||'Gratuit';
function renderCost(container,cost,seconds=null){
  if(!container)return;
  for(const key of Object.keys(RESOURCE_META)){
    let resource=container.querySelector(`[data-cost-resource="${key}"]`);
    if(!resource){
      resource=document.createElement('span');
      resource.className='cost-resource';resource.dataset.costResource=key;
      resource.innerHTML=`<span class="cost-icon ui-icon icon-${resourceIcon[key]}" aria-hidden="true"></span><span class="cost-amount"></span>`;
      container.append(resource);
    }
    const amount=cost[key]??0;
    resource.classList.toggle('hidden',amount<=0);
    setNodeText(resource.querySelector('.cost-amount'),number(amount));
    setAttributeValue(resource,'aria-label',`${number(amount)} ${RESOURCE_META[key].label}`);
  }
  if(seconds!==null){
    let duration=container.querySelector('.cost-time');
    if(!duration){duration=document.createElement('span');duration.className='cost-time';container.append(duration);}
    setNodeText(duration,`${seconds} s`);
  }
  const description=`${costSummary(cost)}${seconds!==null?` · ${seconds} secondes`:''}`;
  setAttributeValue(container,'aria-label',description);
  setAttributeValue(container,'title',description);
}
function setDisabled(button,disabled){
  const value=Boolean(disabled);
  if(button.disabled!==value)button.disabled=value;
  setAttributeValue(button,'aria-disabled',value);
}
const isNewPlayer=!localStorage.getItem(STORAGE_KEY);

const BUILD_CATEGORIES=[
  {key:'resources',label:'Production',types:['sawmill','mine','tower'],icon:'resources'},
  {key:'economy',label:'Stockage',types:['warehouse'],icon:'storage'},
  {key:'army',label:'Armée',types:['barracks'],icon:'army'}
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
const modalIds=['help-overlay','expedition-overlay','reset-overlay'];
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
  if(detailsOpen===Boolean(open)&&$('building-details').classList.contains('hidden')===!open)return;
  const wasOpen=detailsOpen;
  detailsOpen=Boolean(open);
  $('building-details').classList.toggle('hidden',!detailsOpen);
  setAttributeValue($('selection-info-toggle'),'aria-expanded',detailsOpen);
  setAttributeValue($('selection-info-toggle'),'aria-label',detailsOpen?'Masquer les informations':'Afficher les informations');
  if(wasOpen&&!detailsOpen&&$('building-details').contains(document.activeElement)&&!$('selection-panel').classList.contains('hidden'))$('selection-info-toggle').focus({preventScroll:true});
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
    setText(`${key}-value`,number(value));
    setText(`${key}-label`,RESOURCE_META[key].hud);
    const capacityLabel=$(`${key}-capacity`);
    setNodeText(capacityLabel,`/ ${number(storageCap)}`);
    const productionAction=$(`resource-plus-${key}`);
    if(productionAction)setDisabled(productionAction,!game.scene.isActive('VillageScene'));
    const card=$(`${key}-value`)?.closest('.resource');
    if(card){
      const ratio=Math.max(0, Math.min(1, value / storageCap));
      if(card.style.getPropertyValue('--fill')!==String(ratio))card.style.setProperty('--fill',String(ratio));
      setAttributeValue(card,'data-amount',value);
      setAttributeValue(card,'data-cap',storageCap);
      setAttributeValue(card,'title',`${number(value)} ${RESOURCE_META[key].label} sur ${number(storageCap)} de stockage`);
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
  else if($('construction-popout')?.contains(document.activeElement))toggle?.focus({preventScroll:true});
}
function toggleBuildMenu(force){
  setBuildMenu(typeof force==='boolean' ? force : !buildMenuOpen);
}
function makeBuildFilters(){
  const el=$('build-filters');
  if(!el)return;
  for(const category of BUILD_CATEGORIES){
    let btn=el.querySelector(`[data-category="${category.key}"]`);
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.id=`build-category-${category.key}`;
      btn.setAttribute('role','tab');
      btn.setAttribute('aria-controls','build-palette');
      btn.dataset.category=category.key;
      btn.innerHTML=`<span class="build-filter-icon ui-icon icon-${category.icon}" aria-hidden="true"></span><span class="build-filter-copy">${category.label}</span>`;
      btn.addEventListener('click',()=>selectBuildCategory(category.key));
      el.append(btn);
    }
    btn.className='build-filter'+(activeBuildCategory===category.key?' active':'');
    btn.setAttribute('aria-selected', String(activeBuildCategory===category.key));
    btn.tabIndex=activeBuildCategory===category.key?0:-1;
  }
  $('build-palette').setAttribute('role','tabpanel');
  $('build-palette').setAttribute('aria-labelledby',`build-category-${activeBuildCategory}`);
}
function selectBuildCategory(key){
  activeBuildCategory=key;makeBuildFilters();makePalette();
}
function openResourceProduction(resource){
  if(!game.scene.isActive('VillageScene'))return;
  game.events.emit('astrub:cancelPlacement');
  game.events.emit('astrub:closeSelection');
  selectBuildCategory('resources');
  setBuildMenu(true);
  const type={gold:'tower',wood:'sawmill',stone:'mine'}[resource];
  const card=$('build-palette').querySelector(`[data-building="${type}"]`);
  if(card.disabled){
    $('build-filters').querySelector('[data-category="resources"]').focus({preventScroll:true});
    toast(card.querySelector('.build-card-status').textContent);
  }else card.focus({preventScroll:true});
}
function makePalette(){
  const el=$('build-palette');
  if(el.dataset.category!==activeBuildCategory)el.dataset.category=activeBuildCategory;
  const allowed = BUILD_CATEGORIES.find(c=>c.key===activeBuildCategory)?.types ?? BUILD_CATEGORIES[0].types;
  setText('build-description',activeBuildCategory==='resources'?'Produisez vos ressources, puis récoltez les réserves.':activeBuildCategory==='economy'?'Augmentez la capacité de stockage de votre village.':'Formez les troupes qui partiront en expédition.');
  for(const [key,b] of Object.entries(BUILDINGS)){
    if(key==='townhall')continue;
    let btn=el.querySelector(`[data-building="${key}"]`);
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.dataset.building=key;
      btn.setAttribute('aria-describedby',`build-${key}-status`);
      btn.innerHTML=`<span class="build-card-art" aria-hidden="true"><img class="build-thumb" src="/assets/buildings/b-${key}.png" alt="" loading="eager"/></span><span class="build-name">${b.label}</span><span class="build-cost"></span><small class="build-card-status" id="build-${key}-status"></small><span class="build-card-cta"><span class="build-card-cta-label">Construire</span><span class="build-card-cta-arrow" aria-hidden="true">+</span></span>`;
      btn.addEventListener('click',()=>{
        if(!game.scene.isActive('VillageScene')||btn.disabled)return;
        setBuildMenu(true);
        game.events.emit('astrub:build',key);
      });
      el.append(btn);
    }
    btn.className='build-card'+(buildMode===key?' active':'')+(!allowed.includes(key)?' hidden':'');
    btn.setAttribute('aria-pressed', String(buildMode===key));
    renderCost(btn.querySelector('.build-cost'),b.cost);
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
    setDisabled(btn,reason);
    setAttributeValue(btn,'title',`${def.desc}\n${costSummary(def.cost)}${reason?'\n'+reason:''}`);
    setNodeText(btn.querySelector('.build-card-status'),reason||'Choisir un emplacement');
    setNodeText(btn.querySelector('.build-card-cta-label'),buildMode===btn.dataset.building?'Sélectionné':'Construire');
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
  const confirm=$('placement-confirm');
  if(confirm){
    setDisabled(confirm,valid!==true);
    setAttributeValue(confirm,'title',valid===true?'Confirmer cet emplacement':'Choisissez un emplacement libre sur la carte');
  }
  panel.classList.toggle('invalid',valid===false);
  panel.classList.toggle('valid',valid===true);
  const keyboard=window.matchMedia('(pointer:fine)').matches?' · Entrée pour confirmer':'';
  const instruction=valid===true?'Emplacement libre':valid===false?'Zone occupée ou hors de la carte':'Visez une case libre sur la carte';
  setText('placement-copy',`${building?'Déplacement gratuit':costSummary(def.cost)} · ${instruction}. ${confirm?'Validez ou cliquez sur la carte':'Cliquez pour placer'}${keyboard} · Échap pour annuler.`);
}
function refreshSelectionTimer(){
  const b=getState().buildings.find(b=>b.id===selectedId);
  if(!b||!game.scene.isActive('VillageScene'))return;
  if(b.type==='barracks'&&getState().queue.length){
    const next=Math.min(...getState().queue.map(q=>q.ends));
    setText('training-info',`Armée : ${getState().troops.iop} Iop(s), ${getState().troops.cra} Crâ(s). ${getState().queue.length} unité(s) en formation · prochaine dans ${formatCountdown(remainingMs(next))}.`);
  }
  if(!b.upgradingUntil)return;
  const timeLeft=remainingMs(b.upgradingUntil);
  const text=formatCountdown(timeLeft);
  const clock=$('selection-live-timer');
  if(clock.textContent!==text)clock.textContent=text;
  $('selection-progress').style.width=`${(upgradeProgress(b)*100).toFixed(2)}%`;
  if(timeLeft===0)setText('selection-state','Finalisation…');

}
function selectionHud(){
  const b=getState().buildings.find(b=>b.id===selectedId);
  const panel=$('selection-panel');
  const hasSelection=Boolean(b) && game.scene.isActive('VillageScene');
  document.body.classList.toggle('selection-open', hasSelection);
  if(!hasSelection){
    if(!panel.classList.contains('hidden'))panel.classList.add('hidden');
    lastSelectionId=null;
    setDetailsOpen(false);
    return;
  }
  if(lastSelectionId!==b.id){lastSelectionId=b.id;setDetailsOpen(b.type==='barracks');}
  panel.classList.toggle('hidden',false);
  const def=BUILDINGS[b.type];
  setText('selection-title',def.label);
  setText('selection-eyebrow',b.type==='townhall'?'BÂTIMENT PRINCIPAL':'BÂTIMENT DU VILLAGE');
  setText('selection-description',def.desc);
  setText('selection-level',b.level);
  setAttributeValue($('selection-level').parentElement,'title',`Niveau ${b.level} sur 5`);
  const upgrading=b.upgradingUntil>Date.now();
  setText('selection-state',upgrading?'Amélioration en cours':'Disponible');
  const producer=getProductionInfo(b), collecting=$('collect-panel');
  collecting.classList.toggle('hidden',!producer);
  $('collect-btn').classList.toggle('hidden',!producer);
  if(producer){
    const atCapacity=cap()-getState().resources[producer.resource]<1;
    setText('collect-resource-name',`RÉSERVE DE ${producer.label.toUpperCase()}`);
    setText('collect-amount',`${number(producer.ready)} / ${number(producer.capacity)}`);
    $('collect-fill').style.width=`${Math.min(100,(producer.stored/producer.capacity)*100).toFixed(1)}%`;
    $('collect-fill').classList.toggle('full',producer.full);
    setNodeText($('collect-btn').querySelector('.action-label'),'Récolter');
    setDisabled($('collect-btn'),producer.ready<1||atCapacity);
    setAttributeValue($('collect-btn'),'title',atCapacity?'Stockage plein : dépensez des ressources ou améliorez un entrepôt.':producer.ready<1?'La réserve est encore vide. La production continue.':`Récolter ${number(Math.min(producer.ready,Math.floor(cap()-getState().resources[producer.resource])))} ${producer.label}`);
    setAttributeValue($('collect-btn'),'aria-label',$('collect-btn').title);
    setText('collect-tip',atCapacity
      ? 'Stockage plein : dépensez des ressources ou améliorez un entrepôt.'
      : producer.full?'Réserve pleine ! Cliquez pour la vider et relancer la production.'
      : 'Cliquer sur ce bâtiment récolte aussi ses ressources.');
  }
  const moveLabel=movingId===b.id?'Annuler le déplacement':'Déplacer';
  setNodeText($('move-btn').querySelector('.action-label'),moveLabel);
  setAttributeValue($('move-btn'),'title',moveLabel);
  setAttributeValue($('move-btn'),'aria-label',moveLabel);
  $('move-btn').classList.toggle('moving',movingId===b.id);
  $('move-instruction').classList.toggle('hidden',movingId!==b.id);
  $('selection-timer').classList.toggle('hidden',!upgrading);
  const cost=upgradeCost(b),button=$('upgrade-btn');
  const upgradeMissing=shortage(cost);
  const upgradeReason=upgrading?'Amélioration en cours : attendez la fin du chantier.':b.level>=5?'Niveau maximum atteint (5).':upgradeMissing.length?`Il manque ${upgradeMissing.join(' · ')}.`:'';
  const upgradeCostElement=$('selection-upgrade-cost');
  if(!upgradeCostElement.querySelector('.upgrade-cost-heading')){
    for(const child of [...upgradeCostElement.childNodes])if(child.nodeType===Node.TEXT_NODE)child.remove();
    const template=document.createElement('template');
    template.innerHTML='<span class="upgrade-cost-heading"></span><span class="upgrade-cost-resources"></span>';
    upgradeCostElement.append(template.content);
  }
  setNodeText(upgradeCostElement.querySelector('.upgrade-cost-heading'),b.level>=5?'Niveau maximum':`Niveau ${b.level+1}`);
  const upgradeResources=upgradeCostElement.querySelector('.upgrade-cost-resources');
  upgradeResources.classList.toggle('hidden',b.level>=5);
  renderCost(upgradeResources,cost);
  const upgradeLabel=upgrading?'Amélioration en cours':(b.level>=5?'Niveau maximum':'Améliorer');
  setNodeText(button.querySelector('.action-label'),upgradeLabel);
  setAttributeValue(button,'title',upgradeReason||`Améliorer au niveau ${b.level+1} : ${costSummary(cost)}`);
  setAttributeValue(button,'aria-label',upgradeLabel);
  setDisabled(button,upgrading||b.level>=5||!canAfford(cost));
  if($('selection-feedback')){
    const collectReason=producer&&$('collect-btn').disabled?$('collect-btn').title:'';
    const feedback=upgradeReason||`Amélioration : ${costSummary(cost)}`;
    setText('selection-feedback',movingId===b.id?'Choisissez un emplacement libre · Échap pour annuler.':`${collectReason}${collectReason?' · ':''}${feedback}`);
  }
  const training=$('train-controls');
  training.classList.toggle('hidden',b.type!=='barracks');
  if(b.type==='barracks'){
    const pending=getState().queue;
    const next=pending.length?Math.min(...pending.map(q=>q.ends)):0;
    setText('training-info',`Armée : ${getState().troops.iop} Iop(s), ${getState().troops.cra} Crâ(s). ${pending.length?`${pending.length} unité(s) en formation · prochaine dans ${formatCountdown(remainingMs(next))}.`:'Aucune formation en cours.'}`);
    for(const trainButton of training.querySelectorAll('[data-unit]')){
      const troop=TROOPS[trainButton.dataset.unit];
      const trainingCost={gold:troop.gold,wood:troop.wood,stone:0};
      const missing=shortage(trainingCost);
      const reason=missing.length?`Manque ${missing.join(' · ')}`:'';
      setDisabled(trainButton,reason);
      setAttributeValue(trainButton,'title',reason||`Former un ${troop.label} · ${costSummary(trainingCost)} · ${troop.trainSeconds} s`);
      if(!trainButton.querySelector('.train-label')){
        // Keep any decorative layers from the HTML; only remove its fallback text.
        for(const child of [...trainButton.childNodes])if(child.nodeType===Node.TEXT_NODE)child.remove();
        const template=document.createElement('template');
        template.innerHTML=`<span class="train-art ui-icon icon-${trainButton.dataset.unit}" aria-hidden="true"></span><span class="train-label">Former un ${troop.label}</span><small class="train-cost"></small><small class="train-status" id="train-${trainButton.dataset.unit}-status"></small>`;
        trainButton.append(template.content);
        trainButton.setAttribute('aria-describedby',`train-${trainButton.dataset.unit}-status`);
      }
      renderCost(trainButton.querySelector('.train-cost'),trainingCost,troop.trainSeconds);
      const status=trainButton.querySelector('.train-status');
      setNodeText(status,reason);
      status.classList.toggle('hidden',!reason);
    }
  }
  if(upgrading)refreshSelectionTimer();
}
function troopHud(data){
  const palette=$('troop-palette');
  for(const [key,t] of Object.entries(TROOPS)){
    let btn=palette.querySelector(`[data-troop="${key}"]`);
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.dataset.troop=key;
      btn.setAttribute('aria-describedby',`troop-${key}-status`);
      btn.innerHTML=`<span class="troop-card-art" aria-hidden="true"><span class="build-glyph ui-icon icon-${key}"></span></span><span class="build-name">${t.label}</span><span class="build-cost"></span><small class="build-card-status" id="troop-${key}-status"></small>`;
      btn.addEventListener('click',()=>game.events.emit('astrub:chooseTroop',key));
      palette.append(btn);
    }
    btn.className='build-card troop-card'+(data.chosen===key?' active':'');
    setDisabled(btn,data[key]<=0);
    btn.setAttribute('aria-pressed',String(data.chosen===key));
    btn.title=btn.disabled?`Tous les ${t.label}s ont été déployés.`:`Sélectionner les ${t.label}s pour les déployer dans la zone claire.`;
    setNodeText(btn.querySelector('.build-cost'),`${data[key]} disponible(s)`);
    setNodeText(btn.querySelector('.build-card-status'),btn.disabled?'Tous déployés':data.chosen===key?'Prêt à déployer':'Choisir');
  }
}
function render(){
  resourceHud();selectionHud();refreshBuildAvailability();placementHud();
  if(game.scene.isActive('BattleScene')){
    const battle=game.scene.getScene('BattleScene');
    if(!battle.finalized)troopHud(battle.getAvailable());
  }
  const overlay=$('expedition-overlay');
  if(overlay&&!overlay.classList.contains('hidden'))expeditionHud();
}
function expeditionHud(){
  const state=getState();
  const requirement=expeditionRequirement(hasBarracks(),state.troops);
  const army=$('expedition-army');
  for(const [key,t] of Object.entries(TROOPS)){
    let unit=army.querySelector(`[data-expedition-unit="${key}"]`);
    if(!unit){
      unit=document.createElement('article');
      unit.className='expedition-unit';
      unit.dataset.expeditionUnit=key;
      unit.innerHTML=`<span class="expedition-unit-art" aria-hidden="true"><span class="expedition-unit-symbol ui-icon icon-${key}"></span></span><div><span class="panel-eyebrow">${key==='iop'?'CORPS À CORPS':'À DISTANCE'}</span><strong>${t.label}</strong><small>${t.hp} PV · ${t.damage} dégâts</small></div><b class="expedition-unit-count"><span class="expedition-unit-number"></span><small>prêts</small></b>`;
      army.append(unit);
    }
    setNodeText(unit.querySelector('.expedition-unit-number'),number(state.troops[key]));
  }
  const count=Object.values(state.troops).reduce((sum,n)=>sum+n,0);
  setText('expedition-summary',requirement||`${count} unité${count>1?'s':''} disponible${count>1?'s':''}`);
  $('expedition-summary').classList.toggle('unavailable',Boolean(requirement));
  const preview=rewardPreview(state.resources,cap());
  const rewards=$('expedition-rewards');
  for(const [key,reward] of Object.entries(preview)){
    let chip=rewards.querySelector(`[data-reward="${key}"]`);
    if(!chip){
      chip=document.createElement('div');
      chip.className='reward-chip';
      chip.dataset.reward=key;
      chip.innerHTML=`<span class="reward-label">${RESOURCE_META[key].label}</span><strong class="reward-amount cost-resource"><span class="cost-icon ui-icon icon-${resourceIcon[key]}" aria-hidden="true"></span><span class="cost-amount"></span></strong><small class="reward-capacity"></small>`;
      rewards.append(chip);
    }
    setNodeText(chip.querySelector('.cost-amount'),`+${number(reward.amount)}`);
    setAttributeValue(chip.querySelector('.reward-amount'),'aria-label',`+${number(reward.amount)} ${RESOURCE_META[key].label}`);
    const capacityText=chip.querySelector('.reward-capacity');
    setNodeText(capacityText,`${number(reward.receivable)} récupérables · stockage limité`);
    capacityText.classList.toggle('hidden',reward.receivable>=reward.amount);
  }
  const capped=Object.values(preview).some(reward=>reward.receivable<reward.amount);
  setText('expedition-note',`Les unités déployées quittent votre armée, même si vous rentrez avant la victoire. Les unités non déployées restent au village.${capped?' Dépensez vos ressources ou améliorez un entrepôt pour récupérer tout le butin.':''}`);
  setDisabled($('expedition-start'),requirement);
  setAttributeValue($('expedition-start'),'title',requirement||'Rejoindre le camp et choisir les unités à déployer');
  setAttributeValue($('expedition-start'),'aria-describedby','expedition-summary expedition-note');
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
for(const resource of ['gold','wood','stone'])$(`resource-plus-${resource}`)?.addEventListener('click',()=>openResourceProduction(resource));
$('build-close')?.addEventListener('click',()=>setBuildMenu(false));
$('placement-cancel')?.addEventListener('click',()=>game.events.emit('astrub:cancelPlacement'));
$('placement-confirm')?.addEventListener('click',()=>{
  if(placement?.valid)game.events.emit('astrub:confirmPlacement');
});
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
  setModalOpen('reset-overlay',true);
}
function resetConfirmed(){
  if($('reset-overlay').classList.contains('hidden'))return;
  setModalOpen('reset-overlay',false);
  closeHelp();
  closeExpedition();
  closeSettingsMenu();
  // Shut down the old raid and its delayed callbacks before replacing the save.
  // A later callback must never charge deployed units to the new village.
  game.scene.stop('BattleScene');
  game.scene.stop('VillageScene');
  selectedId=null;buildMode=null;movingId=null;
  resetGame();
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
$('reset-close')?.addEventListener('click',()=>setModalOpen('reset-overlay',false));
$('reset-cancel')?.addEventListener('click',()=>setModalOpen('reset-overlay',false));
$('reset-confirm')?.addEventListener('click',resetConfirmed);
$('build-filters')?.addEventListener('keydown',event=>{
  const current=event.target.closest('[role="tab"]');
  if(!current)return;
  const index=BUILD_CATEGORIES.findIndex(category=>category.key===current.dataset.category);
  let next=index;
  if(event.key==='ArrowRight')next=(index+1)%BUILD_CATEGORIES.length;
  else if(event.key==='ArrowLeft')next=(index+BUILD_CATEGORIES.length-1)%BUILD_CATEGORIES.length;
  else if(event.key==='Home')next=0;
  else if(event.key==='End')next=BUILD_CATEGORIES.length-1;
  else return;
  event.preventDefault();
  selectBuildCategory(BUILD_CATEGORIES[next].key);
  $(`build-category-${BUILD_CATEGORIES[next].key}`).focus({preventScroll:true});
});
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
game.events.on('astrub:selected',id=>{
  const restore=id===null&&$('selection-panel').contains(document.activeElement);
  selectedId=id;render();
  if(restore)game.canvas?.focus({preventScroll:true});
});
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
  // The scene announces villageStart during create(), before Phaser marks it
  // RUNNING. Enforce modal input again after its plugins finish starting.
  queueMicrotask(()=>{syncSceneInput();resourceHud();});
  setTimeout(()=>{syncSceneInput();window.__astrubGameReady?.();},180);
});
game.events.on('astrub:battleStart',()=>{
  $('village-controls').classList.add('hidden');$('battle-controls').classList.remove('hidden');$('raid-btn').classList.add('hidden');
  movingId=null;
  setBuildMenu(false);
  document.body.classList.remove('selection-open');
  $('selection-panel').classList.add('hidden');
  resourceHud();placementHud();syncSceneInput();
  queueMicrotask(()=>{syncSceneInput();resourceHud();});
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
