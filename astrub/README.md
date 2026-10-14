# Astrub — Les premières pierres · v0.7.0

[**Télécharger Astrub v0.7.0 — ZIP complet (20 Mo)**](https://github.com/tfortun-dev/test/raw/refs/heads/main/astrub/downloads/Astrub-v0.7.0.zip)

Le ZIP contient les sources, la version compilée et les aperçus. Pour développer depuis ce dépôt : `cd astrub`, puis `npm ci` et `npm run dev`.


Prototype local de gestion de village isométrique : récolter, construire, améliorer, former des Iops et des Crâs, puis attaquer un camp de bandits. Cette version reprend les cartes, bâtiments, sprites et règles de la v0.6.7, et refond leurs interfaces.

## Jouer sous Windows

1. Extraire le ZIP et ouvrir `Astrub-v0.7.0`.
2. Installer **Node.js LTS** si nécessaire : https://nodejs.org/ (Node 20.19+ ou 22.12+ conseillé).
3. Double-cliquer sur `DEMARRER_WINDOWS.bat`. Le premier lancement télécharge les dépendances.
4. Garder le terminal ouvert. Le navigateur s'ouvre sur `http://127.0.0.1:5173/` quand le serveur est prêt.

Le lanceur Windows est fourni ; son exécution native n'a pas été testée sur cette machine Linux.

**Retrouver une ancienne partie :** utiliser le même navigateur, le même profil et exactement la même adresse `http://127.0.0.1:5173/`. La clé `astrub_village_local_v1` et le format de sauvegarde sont conservés. Extraire cette version dans un nouveau dossier évite d'écraser vos anciens fichiers. Une partie reste stockée dans le navigateur, pas dans le ZIP.

## Développer sous Linux, macOS ou Windows

```sh
npm ci
npm run dev
```

Le serveur utilise le port fixe 5173. Si une ancienne version occupe ce port, arrêter son terminal avant de lancer celle-ci.

```sh
npm test       # logique du village, migrations, rendu et préparation d'expédition
npm run build # compilation de production
npm run preview -- --port 5173 --strictPort
```

`dist/` est produit par le build. Ce ZIP contient aussi une version compilée dans `dist/`. Pour l'essayer sans installer les dépendances, si Python 3 est disponible : `python -m http.server 5173 --bind 127.0.0.1 --directory dist`, puis ouvrir la même adresse locale. `dist/index.html` doit être servi par HTTP ; un double-clic sur le fichier HTML ne lance pas le jeu.

## Ce qui change

- Un seul système visuel : parchemin, vert forêt, accent cuivre, bordures et icônes cohérentes. Les styles accumulés des anciennes versions ont été remplacés.
- Ressources avec capacité visible ; construction répartie en **Production / Stockage / Armée**, coûts et raisons d'indisponibilité.
- Actions de bâtiment regroupées, coût de l'amélioration visible, entraînement directement accessible dans la fiche de caserne.
- Objectifs de découverte : bâtir une caserne, améliorer un bâtiment, remporter une expédition. Ce guide lit la sauvegarde existante ; il n'ajoute pas de récompense.
- Écran de préparation d'expédition : armée, butin, limite de stockage, confirmation du départ et explication de la dépense des unités déployées.
- Indication de placement, annulation, navigation clavier, focus des fenêtres et adaptation aux petits écrans.

## Commandes

- Cliquer sur un producteur récolte sa réserve et ouvre ses actions.
- **Construire** : choisir un bâtiment puis une case libre. Le menu se replie pendant le placement.
- **Déplacer** : déplacement gratuit, sans perdre niveau ni réserves. Vert = libre ; rouge = occupé ou hors carte.
- **Entrée** : confirmer l'emplacement visé ; **Échap** : fermer une fenêtre ou annuler une action.
- Glisser la carte / **ZQSD ou WASD** : déplacer la caméra. **Molette** : zoomer. **H** ou le bouton maison : recentrer.
- **i** : fiche détaillée. Pour une caserne, la fiche s'ouvre directement.
- **Expédition** : préparer le départ ; en combat, choisir une classe puis cliquer dans la zone claire.

## Vérification et limites

Les tests automatisés, la compilation et les parcours fonctionnels Chromium ont été exécutés dans l'environnement de préparation. Les parcours navigateur couvrent village, construction, déplacement, entraînement, préparation d'expédition, déploiement, retour et persistance, aux formats ordinateur, mobile et paysage.

Le combat reste une **démonstration locale** : aucune riposte ennemie, aucune perte de PV et aucune défaite naturelle. Les unités déployées sont dépensées à la fin, y compris en cas d'abandon ; les unités non déployées sont conservées. Pas de compte, de serveur de jeu ou de multijoueur dans cette version.

Lire **[SUITE_DU_PROJET.md](SUITE_DU_PROJET.md)** pour la prochaine étape : progression réelle, camps capables de riposter, campagne puis sauvegarde en ligne.
