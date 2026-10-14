// Presentation helpers: they describe the current rules without changing the save.
export const EXPEDITION_REWARDS = Object.freeze({gold:650,wood:250,stone:140});

export function missingResources(cost, resources, labels) {
  return Object.entries(cost)
    .filter(([key,value])=>value>(resources[key]??0))
    .map(([key,value])=>`${Math.ceil(value-(resources[key]??0)).toLocaleString('fr-FR')} ${labels[key].label}`);
}

export function expeditionRequirement(hasCaserne, troops) {
  if(!hasCaserne)return 'Construisez une caserne pour débloquer les expéditions.';
  if(Object.values(troops).reduce((sum,value)=>sum+value,0)<=0)return 'Formez au moins une unité dans la caserne avant de partir.';
  return '';
}

export function rewardPreview(resources, capacity, rewards=EXPEDITION_REWARDS) {
  return Object.fromEntries(Object.entries(rewards).map(([key,amount])=>[
    key, {amount,receivable:Math.max(0,Math.min(amount,Math.floor(capacity-(resources[key]??0))))}
  ]));
}
