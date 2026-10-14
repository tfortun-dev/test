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

Le script vérifie le démarrage Phaser, les objectifs, les coûts et boutons indisponibles, la construction sur la carte, la formation, le déplacement gratuit, l’amélioration et son compteur, la confirmation avec Entrée, les modales et le focus clavier, le déploiement, le retour et la sauvegarde après rechargement. Il joue aussi un raid jusqu’à la victoire sur ordinateur et contrôle le butin, les troupes dépensées et les trois objectifs accomplis.

Trois formats sont contrôlés : **1440 × 960**, **390 × 844** et **844 × 390**. Chaque parcours utilise un profil navigateur temporaire. Pour vérifier les cas sans ressources et la fin d’une amélioration sans attendre 25 secondes, le script ajuste seulement l’état de sa partie de test.

Les captures et le rapport JSON sont écrits dans `ui-checks/`. Les variables suivantes permettent de personnaliser l’exécution :

| Variable | Usage |
| --- | --- |
| `ASTRUB_TEST_URL` | Adresse du serveur Vite, par défaut `http://127.0.0.1:5173/`. |
| `ASTRUB_SCREENSHOTS` | Dossier de sortie des captures et du rapport. |
| `ASTRUB_VIEWPORTS` | Formats séparés par des virgules : `desktop`, `mobile`, `landscape`. Par défaut, les trois. |
| `ASTRUB_CHROMIUM` | Chemin d’un exécutable Chromium particulier. Sinon, le script utilise Chromium système puis le navigateur Playwright. |

Ce script inspecte les modules du serveur Vite de développement. Pour ouvrir la version compilée, lancer `npm run preview` après le build et vérifier son chargement dans un navigateur.
