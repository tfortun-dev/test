# Crédits et provenance des visuels — Astrub v0.5.6

## Terrain

- Image fournie par l'utilisateur : `Prairie isométrique aux fleurs sauvages(1).png`.
- `public/assets/prairie-astrub.png` : copie de l'original.
- `public/assets/prairie-astrub-etendue.webp` : prolongement de la prairie pour couvrir la carte.

## 3D convertie en images PNG transparentes

### Modèles fournis par l'utilisateur (Meshy / export `.glb`)

Les sprites principaux de cette version ont été **pré-rendus hors du jeu** depuis les fichiers `.glb` transmis par l'utilisateur.
Caméra orthographique, fond transparent, recadrage propre, conservation d'un point de contact au sol cohérent.

| Image du prototype | Fichier source utilisateur |
|---|---|
| `b-townhall.png` | `Meshy_AI_Golden_Crest_Hall_1013151916_texture.glb` |
| `b-sawmill.png` | `Meshy_AI_Whimsical_Village_Mar_1013150630_texture.glb` |
| `b-mine.png` | `Meshy_AI_The_Blooming_Alchemis_1013151931_texture.glb` |
| `b-barracks.png` | `Meshy_AI_Golden_Guardhouse_1013151957_texture.glb` |
| `b-tower.png` | `Meshy_AI_Golden_Vault_Cottage_1013151941_generate.glb` |

> Remarque : `b-tower.png` est utilisé en jeu comme **Golden Vault** (banque), même si la clé technique historique du prototype reste `tower` pour compatibilité de sauvegarde.

### Assets conservés des versions précédentes

**KayKit Medieval Hexagon 1.0 Free**, Kay Lousberg — CC0 1.0.
- https://kaylousberg.itch.io/kaykit-medieval-hexagon
- Toujours utilisé pour certains éléments de secours / anciennes variantes et comme base du pipeline de rendu.

**Kenney Fantasy Town Kit 2.0**, Kenney — CC0 1.0.
- https://kenney.nl/assets/fantasy-town-kit
- Décors secondaires issus des versions antérieures du prototype.

**Pack Quaternius**, Quaternius — CC0 1.0.
- Décors secondaires issus des versions antérieures du prototype.

## Unités

- `iop-atlas.png` / `cra-atlas.png` : placeholders 2D procéduraux produits pour ce prototype.
- Reproductibles depuis `tools/make_unit_sheets.py` (Pillow).
- 4 orientations (S, O, N, E) × (4 repos + 6 marche + 6 attaque) = 64 images par unité.

Les graphiques Dofus officiels ne font pas partie de cette archive. Le prototype de gameplay est local et n'exige aucune connexion à un compte.
