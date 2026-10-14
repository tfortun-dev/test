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
