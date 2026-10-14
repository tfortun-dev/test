# Crédits et provenance des visuels — Astrub v0.8.0

## Interface illustrée

- Référence : planche de boutons fournie par l'utilisateur pour la direction artistique.
- `public/assets/ui-layered/ui-atlas.png` : édition de cette référence avec l'outil de génération d'images, sur fond transparent, sans texte intégré.
- Les 24 PNG de ce dossier sont des découpes sans perte de l'atlas. `tools/export_ui_layers.sh` reproduit leur export.
- Les textes, chiffres, jauges animées et interactions sont séparés des images dans l'interface HTML/CSS. [UI_ARCHITECTURE.md](UI_ARCHITECTURE.md) décrit leurs calques et cadres extensibles.
- En v0.7.2, les jauges réutilisent `meter-track.png` pour leur cadre, sans dessiner son centre opaque. Le remplissage derrière ce rail est réalisé en CSS ; aucun nouvel asset de jauge n'est ajouté.

## Terrain

- Image fournie par l'utilisateur : `Prairie isométrique aux fleurs sauvages(1).png`.
- `public/assets/prairie-astrub.png` : copie de l'original.
- `public/assets/prairie-astrub-etendue.webp` : prolongement de la prairie pour couvrir la carte.

## Sprites peints du monde — v0.8.0

- Direction de référence : images et sprites des bâtiments fournis dans le prototype utilisateur, avec leurs volumes, toitures, matières et palette.
- Les nouvelles planches sont éditées avec `image_gen`, puis exportées en PNG transparents et atlas normalisés. Le jeu n'effectue aucun rendu 3D en temps réel.
- Sources éditées : `art/source/v0.8.0/`. Références archivées : `art/reference/v0.7.2/`. Recettes d'export : `art/recipes/v0.8.0/`.
- `public/assets/sprites/` : villageois, poule, lapin, Iop et Crâ ; `manifest.json` décrit leurs cellules, orientations et ancrages.
- `public/assets/buildings/animated/` : atlas des six bâtiments, quatre poses par type ; les PNG fixes `b-{type}.png` servent aux cartes et au placement.
- Les huit illustrations de décor sont exportées depuis les planches peintes de cette version, avec la recette `decor.json`.
- Sprites originaux produits pour ce prototype : aucune image de personnage ou d'animation officielle d'Ankama n'est utilisée pour ces exports.
- [ART_PIPELINE.md](ART_PIPELINE.md) décrit l'édition, la normalisation des poses, les manifestes et les limites des boucles courtes.

Le dépôt et le pack facultatif `Astrub-art-v0.8.0.zip` conservent les planches et références. Le ZIP du jeu inclut les atlas finaux et le code, sans `art/source/` ni `art/reference/` ; aucun réexport n'est nécessaire pour jouer.

## Références historiques des bâtiments

### Modèles fournis par l'utilisateur (Meshy / export `.glb`)

Les images de référence des versions précédentes avaient été pré-rendues hors du jeu depuis les fichiers `.glb` transmis par l'utilisateur. Elles servent de provenance et de références visuelles à la refonte peinte.

| Famille de référence | Fichier source utilisateur |
|---|---|
| `b-townhall.png` | `Meshy_AI_Golden_Crest_Hall_1013151916_texture.glb` |
| `b-sawmill.png` | `Meshy_AI_Whimsical_Village_Mar_1013150630_texture.glb` |
| `b-mine.png` | `Meshy_AI_The_Blooming_Alchemis_1013151931_texture.glb` |
| `b-barracks.png` | `Meshy_AI_Golden_Guardhouse_1013151957_texture.glb` |
| `b-tower.png` | `Meshy_AI_Golden_Vault_Cottage_1013151941_generate.glb` |

> Remarque : `b-tower.png`, issu du modèle **Golden Vault**, est utilisé en jeu comme banque. La clé technique historique reste `tower` pour compatibilité de sauvegarde.

### Assets conservés des versions précédentes

**KayKit Medieval Hexagon 1.0 Free**, Kay Lousberg — CC0 1.0.
- https://kaylousberg.itch.io/kaykit-medieval-hexagon
- Conservé pour certains éléments de secours et anciennes variantes, ainsi que dans l'ancien pipeline de conversion 3D.

**Kenney Fantasy Town Kit 2.0**, Kenney — CC0 1.0.
- https://kenney.nl/assets/fantasy-town-kit
- Décors secondaires issus des versions antérieures du prototype.

**Pack Quaternius**, Quaternius — CC0 1.0.
- Décors secondaires issus des versions antérieures du prototype.

## Visuels historiques conservés

- `art/reference/v0.7.2/units/iop-atlas.png` et `cra-atlas.png` : anciens placeholders procéduraux archivés comme références, associés à `tools/make_unit_sheets.py`. Ils sont retirés des assets du jeu ; les personnages peints de la v0.8.0 utilisent les atlas de `public/assets/sprites/`.
- Les passants de la v0.7.2 étaient dessinés en Canvas à l'exécution. La v0.8.0 charge leurs PNG peints ; `ambienceArt.js` ne crée plus que les alias de frames.

Les graphiques Dofus officiels ne font pas partie de cette archive. Le prototype de gameplay est local et n'exige aucune connexion à un compte.
