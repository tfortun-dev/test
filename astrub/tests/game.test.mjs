import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { formatCountdown, remainingMs, upgradeProgress } from '../src/game/time.js';

const memory = new Map();
globalThis.localStorage = {
  getItem: key => memory.has(key) ? memory.get(key) : null,
  setItem: (key, value) => memory.set(key, String(value)),
  removeItem: key => memory.delete(key)
};
globalThis.window = { dispatchEvent: () => true };

const originalDateNow = Date.now;
const clock = { time: 1_800_000_000_000 };
Date.now = () => clock.time;
after(() => { Date.now = originalDateNow; });

const oldSave = {
  version: 1, nextId: 5,
  resources: { gold: 1800, wood: 700, stone: 500 },
  buildings: [
    { id: 1, type: 'townhall', x: 9, y: 9, level: 2, upgradingUntil: 0 },
    { id: 2, type: 'sawmill', x: 6, y: 11, level: 1, upgradingUntil: 0 },
    { id: 3, type: 'mine', x: 12, y: 8, level: 3, upgradingUntil: clock.time + 20_000 },
    { id: 4, type: 'barracks', x: 5, y: 5, level: 1, upgradingUntil: 0 }
  ],
  troops: { iop: 5, cra: 2 }, queue: [], wins: 3, lastTick: clock.time
};
localStorage.setItem('astrub_village_local_v1', JSON.stringify(oldSave));
const state = await import('../src/game/state.js');

test('migration directe de v0.1 à v0.6 : emplacement et progression conservés, banque ajoutée', () => {
  const s = state.getState();
  assert.equal(state.MAP_SIZE, 42);
  assert.equal(s.version, 4);
  assert.deepEqual(s.buildings.slice(0, 4).map(b => [b.x, b.y]), [[19,19], [16,21], [22,18], [15,15]]);
  assert.equal(s.buildings[0].level, 2);
  assert.equal(s.buildings[2].upgradingUntil, clock.time + 20_000);
  assert.ok(s.buildings.every(b => b.stored === 0));
  assert.equal(s.resources.gold, 1800);
  assert.equal(s.troops.iop, 5);
  assert.equal(s.wins, 3);
  assert.ok(s.buildings.some(b => b.type === 'tower'), 'une Golden Vault doit être ajoutée');
  assert.equal(JSON.parse(localStorage.getItem(state.STORAGE_KEY)).version, 4);
});

test('le décompte des améliorations se met à jour au dixième de seconde', () => {
  assert.equal(formatCountdown(25_000), '00:25.0');
  assert.equal(formatCountdown(24_810), '00:24.9');
  assert.equal(formatCountdown(24_001), '00:24.1');
  assert.equal(formatCountdown(24_000), '00:24.0');
  assert.equal(formatCountdown(1_000), '00:01.0');
  assert.equal(formatCountdown(0), '00:00.0');
  assert.equal(formatCountdown(-1000), '00:00.0');
  assert.equal(formatCountdown(61_010), '01:01.1');
  assert.equal(remainingMs(clock.time + 9000, clock.time), 9000);
  assert.equal(remainingMs(clock.time - 9000, clock.time), 0);
  assert.ok(upgradeProgress(state.getState().buildings[2], clock.time) > 0);
});

test('construire loin du centre reste possible, sans chevauchement', () => {
  assert.equal(state.canBuild('sawmill', 36, 36), true);
  const result = state.place('sawmill', 36, 36);
  assert.equal(result.ok, true);
  assert.equal(state.buildingAt(36, 36).id, result.building.id);
  assert.equal(result.building.stored, 0);
  assert.equal(state.canBuild('sawmill', 36, 36), false);
  assert.equal(state.canBuild('sawmill', 41, 41), false);
});

test('améliorer et former des unités fonctionnent encore en arrière-plan', () => {
  const b = state.getState().buildings.find(b => b.id === 1);
  const oldLevel = b.level;
  const result = state.upgrade(1);
  assert.equal(result.ok, true);
  assert.equal(b.upgradingStartedAt, clock.time);
  assert.equal(b.upgradingDurationMs, 35_000);
  assert.equal(b.upgradingUntil, clock.time + 35_000);
  assert.equal(state.upgrade(1).ok, false);
  clock.time += 17_500;
  assert.equal(formatCountdown(remainingMs(b.upgradingUntil)), '00:17.5');
  assert.equal(upgradeProgress(b), .5);
  assert.equal(state.tick(), false);
  clock.time += 17_500;
  assert.equal(state.tick(), true);
  assert.equal(b.level, oldLevel + 1);
  assert.equal(b.upgradingUntil, 0);
  assert.equal(b.upgradingStartedAt, 0);
  assert.equal(b.upgradingDurationMs, 0);

  const beforeGold = state.getState().resources.gold;
  const queueBefore = state.getState().queue.length;
  assert.equal(state.train('iop').ok, true);
  assert.equal(state.getState().queue.length, queueBefore + 1);
  const oldIop = state.getState().troops.iop;
  clock.time += 9000;
  state.tick();
  assert.equal(state.getState().troops.iop, oldIop + 1);
  state.resolveBattle({ iop: 1, cra: 0 }, true);
  assert.equal(state.getState().wins, 4);
  assert.ok(state.getState().resources.gold > beforeGold - 75);
});

test('la production reste dans les bâtiments tant que le joueur ne récolte pas', () => {
  state.resetGame();
  const before = structuredClone(state.getState().resources);
  clock.time += 10_000;
  state.tick();
  assert.deepEqual(state.getState().resources, before);
  assert.equal(Math.floor(state.getProductionInfo(state.getState().buildings[0])?.stored ?? 0), 0);
  assert.equal(Math.floor(state.getProductionInfo(state.getState().buildings[1]).stored), 14);
  assert.equal(Math.floor(state.getProductionInfo(state.getState().buildings[2]).stored), 8);
  assert.equal(Math.floor(state.getProductionInfo(state.getState().buildings[3]).stored), 8);
  const saved = JSON.parse(localStorage.getItem(state.STORAGE_KEY));
  assert.ok(saved.buildings[1].stored >= 14);
  assert.equal(saved.resources.wood, before.wood);

  const collected = state.collect(2);
  assert.equal(collected.ok, true);
  assert.equal(collected.resource, 'wood');
  assert.equal(collected.amount, 14);
  assert.equal(state.getState().resources.wood, before.wood + 14);
  assert.equal(state.collect(2).ok, false, 'Double clic ne doit pas dupliquer les ressources');
  assert.equal(state.getState().resources.gold, before.gold, 'Kamas non récoltés');
});

test('une réserve plafonnée reste disponible après plusieurs heures hors ligne', () => {
  const before = structuredClone(state.getState().resources);
  clock.time += 12 * 60 * 60 * 1000;
  state.tick();
  assert.deepEqual(state.getState().resources, before);
  for (const b of state.getState().buildings.filter(b => state.getProductionInfo(b))) {
    const info = state.getProductionInfo(b);
    assert.equal(info.ready, info.capacity);
    assert.equal(info.full, true);
  }
  const collected = state.collect(3);
  assert.equal(collected.ok, true);
  assert.equal(collected.amount, state.PRODUCTION.mine.capacity);
  assert.equal(state.getState().resources.stone, before.stone + state.PRODUCTION.mine.capacity);
});

test('si le stockage général est plein, seul le montant disponible est transféré', () => {
  state.resetGame();
  clock.time += 60_000;
  state.tick();
  const sawmill = state.getState().buildings.find(b => b.id === 2);
  const storedBefore = state.getProductionInfo(sawmill).stored;
  state.getState().resources.wood = state.cap() - 4;
  const res = state.collect(sawmill.id);
  assert.equal(res.ok, true);
  assert.equal(res.amount, 4);
  assert.equal(state.getState().resources.wood, state.cap());
  assert.ok(Math.abs(sawmill.stored - (storedBefore - 4)) < 0.01);
  assert.equal(state.collect(sawmill.id).ok, false);
  assert.ok(sawmill.stored > 0, 'La réserve non récoltée doit rester intacte');
});

test('les bâtiments se déplacent gratuitement, sans collision ni perte de progression', () => {
  state.resetGame();
  clock.time += 17_000;
  state.tick();
  const s = state.getState();
  const sawmill = s.buildings.find(b => b.id === 2);
  const previousStored = sawmill.stored;
  const previousResources = structuredClone(s.resources);
  const previousLevel = sawmill.level;
  assert.equal(state.canMove(2, sawmill.x, sawmill.y), true, 'Sa propre empreinte ne doit pas bloquer');
  assert.equal(state.canMove(2, 19, 19), false, 'Case du bâtiment principal déjà occupée');
  assert.equal(state.canMove(2, 22, 18), false, 'Case de l’alchimiste déjà occupée');
  assert.equal(state.moveBuilding(2, 22, 18).ok, false);
  assert.deepEqual([sawmill.x, sawmill.y], [16, 21]);
  assert.equal(state.canMove(2, -1, 9), false);
  assert.equal(state.canMove(2, 41, 41), false);
  assert.equal(state.canMove(2, 30, 30), true);
  assert.equal(state.moveBuilding(2, 30, 30).ok, true);
  assert.deepEqual([sawmill.x, sawmill.y], [30, 30]);
  assert.equal(sawmill.stored, previousStored);
  assert.equal(sawmill.level, previousLevel);
  assert.deepEqual(s.resources, previousResources);
  assert.equal(state.buildingAt(30, 30).id, 2);
  assert.equal(state.buildingAt(16, 21), undefined);
  assert.deepEqual(JSON.parse(localStorage.getItem(state.STORAGE_KEY)).buildings.find(b => b.id === 2).x, 30);
  const r = state.collect(2);
  assert.equal(r.ok, true, 'Les réserves se récoltent après déplacement');
});

test('migration depuis v0.2/v0.3 : les ressources et bâtiments restent inchangés, banque ajoutée si besoin', async () => {
  const v3 = {
    version: 3, nextId: 4,
    resources: { gold: 2300, wood: 900, stone: 750 },
    buildings: [
      { id: 1, type: 'townhall', x: 19, y: 19, level: 3, upgradingUntil: 0 },
      { id: 2, type: 'sawmill', x: 16, y: 21, level: 2, upgradingUntil: clock.time + 8_000 },
      { id: 3, type: 'mine', x: 22, y: 18, level: 1, upgradingUntil: 0 }
    ], troops: { iop: 6, cra: 2 }, queue: [], wins: 7, lastTick: clock.time
  };
  localStorage.setItem(state.STORAGE_KEY, JSON.stringify(v3));
  const reloaded = await import('../src/game/state.js?migrationV3');
  assert.equal(reloaded.getState().version, 4);
  assert.deepEqual(reloaded.getState().resources, v3.resources);
  assert.deepEqual(reloaded.getState().buildings.filter(b => b.type !== 'tower').map(b => [b.x, b.y, b.level]), [[19,19,3],[16,21,2],[22,18,1]]);
  assert.ok(reloaded.getState().buildings.some(b => b.type === 'tower'));
  assert.ok(reloaded.getState().buildings.every(b => b.stored === 0));
  assert.equal(reloaded.getState().buildings.find(b => b.id === 2).upgradingUntil, v3.buildings[1].upgradingUntil);
});
