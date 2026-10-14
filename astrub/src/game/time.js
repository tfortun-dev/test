/** Affichage des comptes a rebours independant des cycles de sauvegarde. */
export function remainingMs(endsAt, now=Date.now()) {
  return Math.max(0, (endsAt || 0) - now);
}

/** 25 secondes -> 00:25.0 ; rafraichissement conseille : 100 ms. */
export function formatCountdown(ms) {
  const tenths = Math.ceil(Math.max(0, ms) / 100);
  const minutes = Math.floor(tenths / 600);
  const seconds = Math.floor(tenths / 10) % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths % 10}`;
}

/** Accepte aussi les sauvegardes 0.1 sans date de debut de chantier. */
export function upgradeProgress(building, now=Date.now()) {
  if (!building?.upgradingUntil) return 1;
  const duration = Math.max(1, building.upgradingDurationMs || (15 + building.level * 10) * 1000);
  return Math.max(0, Math.min(1, 1 - remainingMs(building.upgradingUntil, now) / duration));
}
