import test from 'node:test';
import assert from 'node:assert/strict';
import {missingResources,expeditionRequirement,rewardPreview} from '../src/ui.js';

const labels={gold:{label:'kamas'},wood:{label:'vivres'},stone:{label:'élixirs'}};

test('la construction indique seulement les ressources réellement manquantes',()=>{
  assert.deepEqual(missingResources({gold:360,wood:210,stone:140},{gold:400,wood:180.5,stone:0},labels),['30 vivres','140 élixirs']);
  assert.deepEqual(missingResources({gold:75,wood:12,stone:0},{gold:75,wood:12,stone:0},labels),[]);
});

test('la préparation exige une caserne et au moins une unité avant le lancement',()=>{
  assert.match(expeditionRequirement(false,{iop:3,cra:3}),/caserne/);
  assert.match(expeditionRequirement(true,{iop:0,cra:0}),/au moins une unité/);
  assert.equal(expeditionRequirement(true,{iop:0,cra:1}),'');
});

test('le butin annoncé respecte la capacité et prévient une perte de récompenses',()=>{
  const resources={gold:2900,wood:1500,stone:3000};
  assert.deepEqual(rewardPreview(resources,3000),{
    gold:{amount:650,receivable:100},wood:{amount:250,receivable:250},stone:{amount:140,receivable:0}
  });
  assert.deepEqual(resources,{gold:2900,wood:1500,stone:3000});
});
