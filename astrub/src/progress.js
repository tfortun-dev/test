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
  document.getElementById('village-level').textContent=state.buildings.find(b=>b.type==='townhall')?.level??1;
  document.getElementById('goal-count').textContent=`${complete}/${goals.length}`;
  document.getElementById('goal-current').textContent=next?.label??'Votre village prend vie !';
  document.getElementById('goal-list').innerHTML=goals.map((goal,index)=>`<li class="${goal.done?'complete':goal===next?'current':''}"><span class="goal-step" aria-hidden="true">${goal.done?'✓':index+1}</span><span>${goal.label}${goal.done?'<span class="sr-only"> : accompli</span>':''}</span></li>`).join('');
  const action=document.getElementById('goal-action');
  action.disabled=!next;
  action.dataset.action=next?.action??'';
  action.innerHTML=`${next?.cta??'Premières pierres posées'} <span aria-hidden="true">${next?'→':'✓'}</span>`;
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
