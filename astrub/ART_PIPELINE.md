# Export des sprites peints — Astrub v0.8.0

## De la référence au jeu

1. Partir des bâtiments et images de référence fournis pour le projet : silhouette, matières, toitures et palette.
2. Éditer des planches de poses avec `image_gen`, sur un fond réellement transparent, avec des marges entre les cellules.
3. Décrire leur grille et l'ordre des poses dans une recette JSON. Normaliser les images avec `tools/pack_generated_sprites.py`.
4. Charger les atlas PNG et leurs manifestes dans Phaser ; afficher une frame différente pour animer le sprite.

L'édition d'images produit les poses, l'exporteur les organise. Le jeu n'appelle pas l'outil de génération et n'effectue aucun rendu 3D en temps réel. Les sprites sont créés pour ce prototype ; ils ne proviennent pas des animations officielles d'Ankama.

## Formats utilisés

| Famille | Cellule finale | Poses et grille | Chargement |
|---|---|---|---|
| Villageois, poule, lapin | `192 × 256` | Quatre poses de marche × quatre orientations | `/assets/sprites/manifest.json`, racine `characters` |
| Iop, Crâ | `192 × 256` | Douze colonnes × quatre orientations : repos `0–3`, marche `4–7`, attaque `8–11` | Même manifeste |
| Six bâtiments | `512 × 512` | Quatre poses en grille `2 × 2`, cadence autour de 3 FPS | `/assets/buildings/animated/manifest.json`, racine `buildings` |

Les lignes des personnages suivent `s / w / n / e`, les quatre angles isométriques. Leur pivot de contact est `[96, 236]`. Le portrait reprend la première frame. Les PNG fixes des bâtiments correspondent à une pose utilisée dans l'interface et au placement ; le pivot et le corps du bâtiment sont décrits dans son manifeste.

Les bâtiments livrés utilisent le pivot `[256, 470]`, qui laisse de la place aux traces d'ombre sous le contact au sol. Les manifestes livrés font autorité pour les pivots et dimensions. La largeur affichée se base sur la silhouette `bodyBounds`, pour que les marges transparentes ne réduisent pas les personnages à l'écran.

## Sources et archives

| Dossier | Contenu |
|---|---|
| `art/source/v0.8.0/` | Dix-sept PNG sources : planches initiales, séquences séparées `iop-walk`, `iop-attack`, `cra-walk`, `cra-attack` et décor isolé |
| `art/reference/v0.7.2/` | Références précédentes, réparties entre bâtiments, décors et unités |
| `art/recipes/v0.8.0/` | Recettes réelles `characters.json`, `buildings.json` et `decor.json` |
| `public/assets/` | PNG et atlas finaux chargés par le jeu |

Le dépôt conserve les sources et références. Le ZIP du jeu les exclut pour limiter son poids : les images déjà exportées suffisent pour jouer et compiler. Le pack facultatif [Astrub-art-v0.8.0.zip](https://github.com/tfortun-dev/test/raw/refs/heads/main/astrub/downloads/Astrub-art-v0.8.0.zip) réunit le dossier `art/`, les exporteurs et cette documentation pour la réédition graphique.

Les premières planches Iop et Crâ sont conservées comme essais. Les séquences de marche et d'attaque rééditées séparément servent à leurs exports finaux. Les huit décors sont des illustrations fixes ; les boucles de poses concernent les personnages et bâtiments.

Les deux archives partagent le dossier `Astrub-v0.8.0`, afin de conserver les chemins relatifs des recettes. Après les vérifications du jeu, `python3 tools/package_release.py` les génère et contrôle leur intégrité. Le script exige un rapport de même version avec tests, compilation, contrôle de production et trois parcours navigateur réussis ; ces résultats restent consignés séparément.

## Réexport facultatif

Python 3 et Pillow sont nécessaires pour travailler sur les images. Ils ne sont pas nécessaires pour jouer ou compiler le prototype.

```sh
python3 -m pip install Pillow
python3 tools/pack_generated_sprites.py art/recipes/v0.8.0/characters.json --check-only
python3 tools/pack_generated_sprites.py art/recipes/v0.8.0/characters.json
```

Remplacer `characters.json` par `buildings.json` ou `decor.json` pour les autres familles. Pour préparer de nouvelles recettes, [sprite-recipe.example.json](tools/sprite-recipe.example.json) et [sprite-recipe.building.example.json](tools/sprite-recipe.building.example.json) donnent la structure ; leurs chemins et destinations sont à adapter. Les chemins d'entrée et de sortie sont relatifs à la recette.

La recette précise les sources PNG, le rectangle de grille si nécessaire, les cellules et leur ordre, la taille finale, le pivot et les métadonnées. Des rectangles explicites permettent de suivre les vraies gouttières de la planche. `flipX` peut ranger une vue en miroir horizontal ; cette opération est tracée dans le manifeste. Une région `bodyRect` permet de dimensionner un bâtiment sur sa façade plutôt que sur une fumée qui varie entre les poses.

L'exporteur applique une échelle commune à toutes les poses d'un même sprite, les aligne au sol et les range dans les cellules finales. Il ne dessine pas de nouvelle pose, ne détoure pas un fond opaque et ne recolore pas les images. `--check-only` valide les entrées et leur normalisation sans écrire de PNG.

`sourceScale` compense une densité de pixels différente entre deux planches avant cette échelle commune, sans déformer la silhouette. Deux poses de marche du Crâ provenant de la première planche utilisent cette correction ; leur hauteur est alignée sur les autres pas et leur provenance reste dans le manifeste.

## Contrôles et métadonnées

L'export refuse les sources sans transparence et les cellules vides ; il contrôle les marges, les pivots et le découpage. Le manifeste conserve dimensions, silhouettes, pivots et hashes des frames, ainsi que les sources et leurs SHA-256. Le nombre de frames distinctes est mesuré : les quatre emplacements de repos peuvent contenir des copies, tandis que marche et attaque doivent présenter plusieurs poses.

Le contrôle de l'exporteur peut être relancé indépendamment :

```sh
python3 tools/test_pack_generated_sprites.py
```

La validation des images ne remplace pas leur lecture dans le jeu : vérifier aussi le contact au sol, le contour des personnages, la lisibilité à l'échelle du village et le passage d'une pose à l'autre. Les résultats de validation de la version livrée figurent dans [RESULTATS_VERIFICATION.json](RESULTATS_VERIFICATION.json).

## Portée des animations

Les séquences restent courtes : quatre poses pour la marche, l'attaque et les bâtiments. Le repos peut être fixe. La façade d'un type de bâtiment reste la même à tous les niveaux ; aucune construction par palier n'est ajoutée à l'économie existante.

L'animation modifie la frame affichée, tout en conservant l'ancrage et la taille définis pour le sprite. Les besoins, emplois, effets économiques ou défenses des passants ne font pas partie de cette refonte : ils restent décoratifs.
