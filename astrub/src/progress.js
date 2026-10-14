import {getState} from './game/state.js';

// Discovery objectives are derived from the existing save, without a new reward
// or a separate progress flag that could become inconsistent after migration.
export function discoveryGoals(state) {
  return [
    {label:'Bâtir une caserne',action:'army',cta:'Construire ma caserne',done:state.buildings.some(b=>b.type==='barracks')},
    {label:'Améliorer un bâtiment',action:'upgrade',cta:'Améliorer mon village',done:state.buildings.some(b=>b.level>=2)},
    {label:'Réussir une expédition',action:'raid',cta:'Préparer mon expédition',done:state.wins>0}
  ];
}

const toggle=document.getElementById('goals-toggle');
const content=document.getElementById('goals-content');
let open=!window.matchMedia('(max-width:760px), (max-height:560px)').matches;
const setText=(element,text)=>{const value=String(text);if(element&&element.textContent!==value)element.textContent=value;};
function setOpen(value){
  open=value;
  toggle.setAttribute('aria-expanded',String(open));
  content.classList.toggle('hidden',!open);
}
function renderGoals(){
  const state=getState();
  const goals=discoveryGoals(state);
  const complete=goals.filter(goal=>goal.done).length;
  const next=goals.find(goal=>!goal.done);
  setText(document.getElementById('village-level'),state.buildings.find(b=>b.type==='townhall')?.level??1);
  setText(document.getElementById('goal-count'),`${complete}/${goals.length}`);
  setText(document.getElementById('goal-current'),next?.label??'Votre village prend vie !');
  const list=document.getElementById('goal-list');
  for(const [index,goal] of goals.entries()){
    let row=list.querySelector(`[data-goal="${goal.action}"]`);
    if(!row){
      row=document.createElement('li');
      row.dataset.goal=goal.action;
      row.innerHTML='<span class="goal-step" aria-hidden="true"></span><span class="goal-label"></span><span class="goal-state sr-only"></span>';
      list.append(row);
    }
    const className=goal.done?'complete':goal===next?'current':'';
    if(row.className!==className)row.className=className;
    setText(row.querySelector('.goal-step'),goal.done?'✓':index+1);
    setText(row.querySelector('.goal-label'),goal.label);
    setText(row.querySelector('.goal-state'),goal.done?' : accompli':'');
  }
  const action=document.getElementById('goal-action');
  if(action.disabled!==!next)action.disabled=!next;
  const disabled=String(!next);
  if(action.getAttribute('aria-disabled')!==disabled)action.setAttribute('aria-disabled',disabled);
  const actionName=next?.action??'';
  if(action.dataset.action!==actionName)action.dataset.action=actionName;
  let label=action.querySelector('.guide-action-label');
  let arrow=action.querySelector('.guide-action-arrow');
  if(!label){
    // A saved state update must preserve the button's decorative HTML layers.
    for(const child of [...action.childNodes])if(child.nodeType===Node.TEXT_NODE)child.remove();
    label=document.createElement('span');label.className='guide-action-label';action.prepend(label);
  }
  if(!arrow){
    arrow=action.querySelector('span[aria-hidden="true"]:not(.ui-icon):not([class])');
    if(arrow)arrow.className='guide-action-arrow';
    else{arrow=document.createElement('span');arrow.className='guide-action-arrow';arrow.setAttribute('aria-hidden','true');action.append(arrow);}
  }
  setText(label,next?.cta??'Premières pierres posées');
  setText(arrow,next?'→':'✓');
}
if(toggle&&content){
  toggle.addEventListener('click',()=>setOpen(!open));
  document.getElementById('goal-action').addEventListener('click',event=>{
    const action=event.currentTarget.dataset.action;
    if(action){
      setOpen(false);
      window.dispatchEvent(new CustomEvent('astrub:guide',{detail:{action}}));
    }
  });
  window.addEventListener('astrub:state',renderGoals);
  setOpen(open);
  renderGoals();
}
