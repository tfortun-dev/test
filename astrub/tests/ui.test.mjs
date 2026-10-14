import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
const js = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const progress = readFileSync(new URL('../src/progress.js', import.meta.url), 'utf8');

function hasId(id) { return html.includes(`id="${id}"`); }

test('le grand bandeau du haut n’existe plus dans le HTML ni les styles', () => {
  assert.doesNotMatch(html, /<header\b|\btopbar\b|area-caption|player-panel|village-status/i);
  assert.doesNotMatch(css, /\.topbar\b|\.area-caption\b|\.player-panel\b/);
  assert.match(html, /<aside class="resource-stack"/);
});

test('la sélection est compacte et les détails sont masqués par défaut derrière i', () => {
  assert.match(html, /id="selection-panel" class="building-dock hidden"/);
  assert.match(html, /id="building-details" class="building-details hidden"/);
  assert.match(html, /id="selection-info-toggle"/);
  for (const id of ['selection-title', 'selection-level', 'collect-btn', 'move-btn', 'upgrade-btn', 'detail-close']) {
    assert.ok(hasId(id), `${id} doit exister`);
  }
  assert.match(css, /body\.selection-open #village-controls\s*\{\s*display:none !important/);
  assert.match(js, /setDetailsOpen\(!detailsOpen\)/);
});

test('aucune référence JavaScript ne vise un ID disparu', () => {
  const lookups = [...js.matchAll(/\$\('([^']+)'\)/g)].map(x => x[1]);
  lookups.push(...[...progress.matchAll(/getElementById\('([^']+)'\)/g)].map(x => x[1]));
  const declarations = [...html.matchAll(/id="([^"]+)"/g)].map(x => x[1]);
  const ids = new Set(declarations);
  assert.equal(ids.size, declarations.length, 'Chaque ID doit identifier un seul élément.');
  const absent = [...new Set(lookups)].filter(id => !ids.has(id));
  assert.deepEqual(absent, []);
});

test('les calques des actions restent décoratifs et les libellés sont conservés lors des mises à jour', () => {
  for (const id of ['collect-btn', 'move-btn', 'upgrade-btn']) {
    const markup = html.match(new RegExp(`<button\\b[^>]*\\bid="${id}"[^>]*>[\\s\\S]*?<\\/button>`))?.[0];
    assert.ok(markup, `${id}: bouton manquant`);
    assert.match(markup, /class="[^\"]*\baction-icon\b[^\"]*"[^>]*aria-hidden="true"/, `${id}: icône décorative manquante`);
    assert.match(markup, /class="[^\"]*\baction-label\b[^\"]*"/, `${id}: libellé séparé manquant`);
  }
  assert.doesNotMatch(js, /querySelector\('\.action-icon'\)\.(?:textContent|innerHTML)\s*=/);
  assert.doesNotMatch(js, /\$\('(?:collect-btn|move-btn|upgrade-btn)'\)\.(?:textContent|innerHTML)\s*=/);
});
