# Vérifier le prototype

Depuis le dossier du projet :

```sh
npm ci
npm test
npm run build
```

## Parcours navigateur optionnel

Le script `tools/check_ui.py` utilise Python et Playwright. Il fonctionne avec Chromium installé sur la machine, ou avec le navigateur fourni par Playwright :

```sh
python -m pip install playwright
python -m playwright install chromium
```

Laisser le serveur de développement ouvert dans un premier terminal :

```sh
npm run dev
```

Puis lancer le contrôle dans un second terminal, depuis le dossier du projet :

```sh
python tools/check_ui.py
```

Le script vérifie les zones de clic des boutons illustrés et la conservation de leurs calques, libellés et focus pendant les mises à jour de la sauvegarde. Il contrôle les jauges du HUD, les trois raccourcis de production sans dépense, les réglages, l’aide et le zoom, l’annulation d’une réinitialisation, la réserve d’un producteur et la récolte quand le stockage est plein.

Les jauges sont contrôlées à 0 %, 1 %, 50 % et 100 % : largeur exacte, remplissage limité à la fenêtre intérieure, cadre dessiné devant sans fond opaque, texte et boutons accessibles. Les captures `meters-*` présentent les quatre états dans chaque format. Les petites jauges de réserve et de chantier utilisent aussi une fenêtre de remplissage indépendante.

L’ambiance est vérifiée en temps réel : marche et poses, profondeur partagée avec les bâtiments, objets sans interaction, chemins hors des empreintes, recalcul après construction ou déplacement. Les passants se figent derrière une modale et pendant le placement. Un événement de visibilité simulé vérifie aussi leur pause lorsque le document devient caché. Ils disparaissent avec la préférence de mouvement réduit. Les changements de scène détruisent les anciens sprites ; le script contrôle le retrait des écouteurs de visibilité, mouvement réduit et destruction de scène. Les comparaisons de gameplay excluent les réserves de production et `lastTick`, qui évoluent déjà avec le temps.

Le contrôle des sprites peints vérifie les onze atlas chargés depuis de vrais PNG : cellules, images prêtes, pivots au sol et transparence. Les sept décors utilisés sont aussi contrôlés dans le cache PNG. Sur le premier format, il recalcule les empreintes des pixels utiles (alpha ≥ 32) pour vérifier les quatre poses distinctes de marche et d’attaque des personnages et les quatre images de chaque bâtiment. Les copies de la pose de repos sont autorisées. Il échantillonne les bâtiments en animation pour vérifier que leurs images, taille, origine, profondeur et nombre d’objets restent stables, puis contrôle leurs pauses et un clic dans une marge transparente hors empreinte.

Un combat isolé joue les animations réelles des Iop et Crâ : marche, attaque et repos, pieds attachés à leur position de jeu, profondeur et échelle constantes. L’échelle respecte le corps visible et l’éventuelle hauteur maximale. Les séquences enregistrées contiennent les quatre poses ; le probe exige un changement réel de frame, en tenant compte des poses que le rendu peut sauter à bas FPS. Une réserve de points de vie augmentée seulement dans cette partie de test laisse le temps d’observer les poses. Le mouvement réduit fixe leur pose tout en conservant déplacements et dégâts. L’aide et la visibilité cachée simulée arrêtent mouvement, dégâts et animation. Le retour puis la réinitialisation retirent les sprites et les écouteurs. Les détails sont écrits dans `painted-atlases-*`, `building-animation-*` et `battle-probe-*`.

Le parcours couvre aussi le démarrage Phaser, les objectifs, les coûts et boutons indisponibles, la construction sur la carte, la formation, le déplacement gratuit, l’amélioration et son compteur, les emplacements valides et occupés, la confirmation avec le bouton ou Entrée, les modales et le focus clavier, la sélection des troupes, le déploiement, le retour et la sauvegarde après rechargement. Il joue un raid jusqu’à la victoire sur ordinateur et contrôle le butin, les troupes dépensées et les trois objectifs accomplis. Il vérifie aussi qu’une formation terminée en combat réactive sa carte et qu’une réinitialisation confirmée depuis le raid arrête l’ancien combat.

Trois formats sont contrôlés : **1440 × 960**, **390 × 844** et **844 × 390**. Chaque parcours utilise un profil navigateur temporaire. Le premier chargement d’un asset est ralenti sur ordinateur pour vérifier que l’aide bloque encore la carte après son démarrage. Pour vérifier les cas sans ressources et la fin d’une amélioration ou d’une formation, le script ajuste seulement l’état de sa partie de test.

Les captures et le rapport JSON sont écrits dans `ui-checks/`. Les variables suivantes permettent de personnaliser l’exécution :

| Variable | Usage |
| --- | --- |
| `ASTRUB_TEST_URL` | Adresse du serveur Vite, par défaut `http://127.0.0.1:5173/`. |
| `ASTRUB_SCREENSHOTS` | Dossier de sortie des captures et du rapport. |
| `ASTRUB_VIEWPORTS` | Formats séparés par des virgules : `desktop`, `mobile`, `landscape`. Par défaut, les trois. |
| `ASTRUB_CHROMIUM` | Chemin d’un exécutable Chromium particulier. Sinon, le script utilise Chromium système puis le navigateur Playwright. |

Ce script inspecte les modules du serveur Vite de développement. Pour ouvrir la version compilée, lancer `npm run preview` après le build et vérifier son chargement dans un navigateur.
