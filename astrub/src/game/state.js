export const STORAGE_KEY = 'astrub_village_local_v1';
export const MAP_SIZE = 42;
const LEGACY_MAP_SIZE = 22;
const SAVE_VERSION = 4;

export const BUILDINGS = {
  townhall: { label: 'Maison de guilde', icon: '🏛', desc: 'Le cœur de votre village. Améliorez ses bâtiments pour préparer les prochaines expéditions.', size: [3, 3], cost: { gold: 0, wood: 0, stone: 0 } },
  sawmill:  { label: 'Ferme d’Astrub', icon: '🥖', desc: 'Produit des vivres à récolter dans sa réserve. Plusieurs fermes peuvent nourrir votre village.', size: [2, 2], cost: { gold: 120, wood: 80, stone: 0 } },
  mine:     { label: 'Atelier d’alchimie', icon: '🧪', desc: 'Prépare des élixirs à récolter. Améliorez l’atelier pour augmenter sa production et sa réserve.', size: [2, 2], cost: { gold: 180, wood: 120, stone: 0 } },
  warehouse:{ label: 'Entrepôt', icon: '📦', desc: 'Augmente la quantité de ressources que vous pouvez conserver après récolte.', size: [2, 2], cost: { gold: 240, wood: 170, stone: 80 } },
  barracks: { label: 'Caserne', icon: '⚔', desc: 'Forme des Iops au corps à corps et des Crâs à distance pour vos expéditions.', size: [2, 2], cost: { gold: 360, wood: 210, stone: 140 } },
  tower:    { label: 'Banque des kamas', icon: '🪙', desc: 'Produit des kamas à récolter. Videz sa réserve régulièrement pour poursuivre la production.', size: [2, 2], cost: { gold: 260, wood: 140, stone: 120 } }
};

export const RESOURCE_META = Object.freeze({
  gold: { hud: 'KAMAS', icon: '🟡', costIcon: '🟡', label: 'kamas', victory: 'kamas' },
  wood: { hud: 'VIVRES', icon: '🥖', costIcon: '🥖', label: 'vivres', victory: 'vivres' },
  stone: { hud: 'ÉLIXIRS', icon: '🧪', costIcon: '🧪', label: 'élixirs', victory: 'élixirs' }
});

// La production s'accumule dans chaque bâtiment, jamais directement dans le portefeuille.
// Les réserves et leur plafond progressent avec le niveau du bâtiment.
export const PRODUCTION = {
  sawmill:  { resource: 'wood', perSecond: 1.4, capacity: 400, icon: RESOURCE_META.wood.icon, label: RESOURCE_META.wood.label },
  mine:     { resource: 'stone', perSecond: 0.85, capacity: 300, icon: RESOURCE_META.stone.icon, label: RESOURCE_META.stone.label },
  tower:    { resource: 'gold', perSecond: 0.8, capacity: 250, icon: RESOURCE_META.gold.icon, label: RESOURCE_META.gold.label }
};

export const TROOPS = {
  iop: { label: 'Iop', icon: '⚔', gold: 75, wood: 12, damage: 12, hp: 100, speed: 79, trainSeconds: 8 },
  cra: { label: 'Crâ', icon: '🏹', gold: 90, wood: 15, damage: 8, hp: 65, speed: 90, trainSeconds: 10 }
};

function initial() {
  return {
    version: SAVE_VERSION,
    nextId: 5,
    resources: { gold: 2050, wood: 830, stone: 500 },
    buildings: [
      { id: 1, type: 'townhall', x: 19, y: 19, level: 1, upgradingUntil: 0, stored: 0 },
      { id: 2, type: 'sawmill', x: 16, y: 21, level: 1, upgradingUntil: 0, stored: 0 },
      { id: 3, type: 'mine', x: 22, y: 18, level: 1, upgradingUntil: 0, stored: 0 },
      { id: 4, type: 'tower', x: 24, y: 21, level: 1, upgradingUntil: 0, stored: 0 }
    ],
    troops: { iop: 3, cra: 3 }, queue: [], wins: 0,
    lastTick: Date.now()
  };
}

function ensureDefaults(building) {
  return {
    upgradingStartedAt: Number.isFinite(building.upgradingStartedAt) ? building.upgradingStartedAt : 0,
    upgradingDurationMs: Number.isFinite(building.upgradingDurationMs) ? building.upgradingDurationMs : 0,
    stored: Number.isFinite(building.stored) ? Math.max(0, building.stored) : 0
  };
}

function validFootprintIn(buildings, type, x, y, ignoreId = null) {
  if (!BUILDINGS[type] || !Number.isInteger(x) || !Number.isInteger(y)) return false;
  const [w, h] = BUILDINGS[type].size;
  if (x < 1 || y < 1 || x + w >= MAP_SIZE - 1 || y + h >= MAP_SIZE - 1) return false;
  for (const other of buildings) {
    if (other.id === ignoreId) continue;
    const [otherW, otherH] = BUILDINGS[other.type].size;
    if (x < other.x + otherW && x + w > other.x && y < other.y + otherH && y + h > other.y) return false;
  }
  return true;
}

function findFirstOpenSlot(buildings, type) {
  for (let y = 1; y < MAP_SIZE - 2; y++) {
    for (let x = 1; x < MAP_SIZE - 2; x++) {
      if (validFootprintIn(buildings, type, x, y)) return { x, y };
    }
  }
  return null;
}

function migrateToV4(val) {
  const migratedBuildings = val.buildings.filter(b => b.type !== 'tower').map(b => ({ ...b, ...ensureDefaults(b) }));
  const spot = findFirstOpenSlot(migratedBuildings, 'tower') ?? { x: 24, y: 21 };
  migratedBuildings.push({
    id: val.nextId++, type: 'tower', x: spot.x, y: spot.y,
    level: 1, upgradingUntil: 0, upgradingStartedAt: 0, upgradingDurationMs: 0, stored: 0
  });
  val.buildings = migratedBuildings;
  val.version = 4;
}

function read() {
  try {
    const val = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(val?.buildings) || !val.resources || !val.troops) return initial();
    if (![1, 2, 3, 4].includes(val.version)) return initial();

    if (val.version === 1) {
      // Sauvegardes v0.1 (22x22) : recentrage sans toucher aux ressources / constructions.
      const offset = (MAP_SIZE - LEGACY_MAP_SIZE) / 2;
      val.buildings = val.buildings.map(b => ({ ...b, x: b.x + offset, y: b.y + offset }));
      val.version = 2;
    }
    if (val.version === 2) {
      // La v0.2 créditait le portefeuille directement : on le conserve tel quel.
      // Seules les futures productions seront stockées dans chaque bâtiment.
      val.buildings = val.buildings.map(b => ({ ...b, ...ensureDefaults(b), stored: 0 }));
      val.version = 3;
    }
    if (val.version === 3) migrateToV4(val);
    if (val.version === 4) {
      val.buildings = val.buildings.map(b => ({ ...b, ...ensureDefaults(b) }));
      if (!val.buildings.some(b => b.type === 'tower')) {
        const spot = findFirstOpenSlot(val.buildings, 'tower') ?? { x: 24, y: 21 };
        val.buildings.push({ id: val.nextId++, type: 'tower', x: spot.x, y: spot.y, level: 1, upgradingUntil: 0, upgradingStartedAt: 0, upgradingDurationMs: 0, stored: 0 });
      }
    }
    if (!Number.isFinite(val.lastTick)) val.lastTick = Date.now();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(val)); } catch (_) {}
    return val;
  } catch (_) { return initial(); }
}

let state = read();
export function getState() { return state; }
export function emit() { window.dispatchEvent(new CustomEvent('astrub:state')); }
export function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  emit();
}
export function resetGame() { state = initial(); save(); }

// Le plafond de l'entrepôt s'applique uniquement aux ressources déjà ramassées.
export function cap() {
  return 5000 + state.buildings.filter(b => b.type === 'warehouse').reduce((a, b) => a + 3000 * b.level, 0);
}
export function canAfford(cost) {
  return Object.entries(cost).every(([key, amount]) => (state.resources[key] ?? 0) >= amount);
}
function pay(cost) {
  for (const key of ['gold', 'wood', 'stone']) state.resources[key] -= cost[key] || 0;
}

export function buildingAt(x, y) {
  return state.buildings.find(b => {
    const [w, h] = BUILDINGS[b.type].size;
    return x >= b.x && x < b.x + w && y >= b.y && y < b.y + h;
  });
}

function validFootprint(type, x, y, ignoreId = null) {
  return validFootprintIn(state.buildings, type, x, y, ignoreId);
}
export function canBuild(type, x, y) {
  return type !== 'townhall' && validFootprint(type, x, y) && canAfford(BUILDINGS[type].cost);
}
export function place(type, x, y) {
  if (!BUILDINGS[type] || type === 'townhall') return { ok: false, msg: 'Bâtiment inconnu.' };
  tick(); // Une nouvelle construction ne doit pas produire rétroactivement.
  if (!canBuild(type, x, y)) return { ok: false, msg: 'Emplacement occupé, hors carte ou ressources insuffisantes.' };
  pay(BUILDINGS[type].cost);
  const building = { id: state.nextId++, type, x, y, level: 1, upgradingUntil: 0, upgradingStartedAt: 0, upgradingDurationMs: 0, stored: 0 };
  state.buildings.push(building);
  save();
  return { ok: true, building };
}

export function canMove(id, x, y) {
  const building = state.buildings.find(b => b.id === id);
  return !!building && validFootprint(building.type, x, y, id);
}
export function moveBuilding(id, x, y) {
  const building = state.buildings.find(b => b.id === id);
  if (!building) return { ok: false, msg: 'Bâtiment introuvable.' };
  if (!canMove(id, x, y)) return { ok: false, msg: 'Cette zone est occupée ou hors de la carte.' };
  // Déplacement gratuit : conserve niveau, chantier et réserves non récoltées.
  building.x = x;
  building.y = y;
  save();
  return { ok: true, building };
}

export function getProductionInfo(building) {
  if (!building) return null;
  const def = PRODUCTION[building.type];
  if (!def) return null;
  const capacity = Math.round(def.capacity * Math.pow(building.level, 1.5));
  const stored = Math.max(0, Math.min(capacity, Number(building.stored) || 0));
  return {
    ...def,
    rate: def.perSecond * building.level,
    capacity,
    stored,
    ready: Math.floor(stored),
    full: stored >= capacity - 0.0001
  };
}

export function collect(id) {
  const building = state.buildings.find(b => b.id === id);
  if (!building || !PRODUCTION[building.type]) return { ok: false, msg: 'Ce bâtiment ne produit pas de ressources.' };
  tick(); // récupère aussi la production depuis le dernier passage du compteur.
  const info = getProductionInfo(building);
  if (info.ready <= 0) return { ok: false, msg: 'Pas encore de ressources à récolter.' };
  const room = Math.max(0, Math.floor(cap() - state.resources[info.resource]));
  if (room <= 0) return { ok: false, msg: 'Stockage plein ! Dépensez des ressources ou améliorez un entrepôt.' };
  const amount = Math.min(info.ready, room);
  state.resources[info.resource] += amount;
  building.stored = Math.max(0, info.stored - amount);
  save();
  return { ok: true, amount, resource: info.resource, icon: info.icon, label: info.label, remaining: Math.floor(building.stored) };
}

export function upgradeDurationMs(level) { return (15 + level * 10) * 1000; }
export function upgradeCost(b) {
  const base = BUILDINGS[b.type].cost;
  return {
    gold: Math.round((100 + base.gold * .8) * (b.level ** 1.65)),
    wood: Math.round((50 + base.wood * .78) * (b.level ** 1.6)),
    stone: Math.round((30 + base.stone * .68) * (b.level ** 1.55))
  };
}
export function upgrade(bId) {
  const b = state.buildings.find(b => b.id === bId);
  if (!b) return { ok: false, msg: 'Bâtiment introuvable.' };
  tick();
  if (b.upgradingUntil > Date.now()) return { ok: false, msg: 'Amélioration déjà en cours.' };
  if (b.level >= 5) return { ok: false, msg: 'Niveau maximum atteint pour ce prototype.' };
  const cost = upgradeCost(b);
  if (!canAfford(cost)) return { ok: false, msg: 'Vous manquez de ressources.' };
  pay(cost);
  b.upgradingStartedAt = Date.now();
  b.upgradingDurationMs = upgradeDurationMs(b.level);
  b.upgradingUntil = b.upgradingStartedAt + b.upgradingDurationMs;
  save();
  return { ok: true, building: b };
}

export function hasBarracks() { return state.buildings.some(b => b.type === 'barracks'); }
export function train(type) {
  const t = TROOPS[type];
  if (!t) return { ok: false, msg: 'Unité inconnue.' };
  if (!hasBarracks()) return { ok: false, msg: 'Construisez une caserne pour entraîner des troupes.' };
  const cost = { gold: t.gold, wood: t.wood, stone: 0 };
  if (!canAfford(cost)) return { ok: false, msg: 'Ressources insuffisantes pour l’entraînement.' };
  pay(cost);
  const last = state.queue.filter(q => q.type === type).reduce((v, q) => Math.max(v, q.ends), Date.now());
  state.queue.push({ type, ends: last + t.trainSeconds * 1000 });
  save();
  return { ok: true };
}

export function resolveBattle(deployed, victory) {
  for (const k of Object.keys(TROOPS)) state.troops[k] = Math.max(0, state.troops[k] - (deployed[k] || 0));
  if (victory) {
    const limit = cap();
    state.resources.gold = Math.min(limit, state.resources.gold + 650);
    state.resources.wood = Math.min(limit, state.resources.wood + 250);
    state.resources.stone = Math.min(limit, state.resources.stone + 140);
    state.wins++;
  }
  save();
}

export function tick() {
  const now = Date.now();
  const elapsed = Math.max(0, Math.min((now - state.lastTick) / 1000, 60 * 60 * 12));
  if (elapsed < .5) return false;
  for (const b of state.buildings) {
    const info = getProductionInfo(b);
    if (!info) continue;
    b.stored = Math.min(info.capacity, info.stored + info.rate * elapsed);
  }
  state.lastTick = now;
  let finished = false;
  for (const b of state.buildings) {
    if (b.upgradingUntil && now >= b.upgradingUntil) {
      b.level++;
      b.upgradingUntil = 0;
      b.upgradingStartedAt = 0;
      b.upgradingDurationMs = 0;
      finished = true;
    }
  }
  const completed = state.queue.filter(q => now >= q.ends);
  for (const q of completed) { state.troops[q.type]++; finished = true; }
  state.queue = state.queue.filter(q => now < q.ends);
  save();
  return finished;
}

export function number(n) { return Math.floor(n).toLocaleString('fr-FR'); }
export function costText(cost) {
  return [
    cost.gold ? `${RESOURCE_META.gold.costIcon} ${number(cost.gold)}` : '',
    cost.wood ? `${RESOURCE_META.wood.costIcon} ${number(cost.wood)}` : '',
    cost.stone ? `${RESOURCE_META.stone.costIcon} ${number(cost.stone)}` : ''
  ].filter(Boolean).join(' · ');
}
