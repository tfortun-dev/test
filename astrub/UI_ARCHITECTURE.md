# Architecture de l'interface — Astrub v0.7.2

## Où se trouve chaque responsabilité

| Fichier | Responsabilité |
|---|---|
| `index.html` | Structure des panneaux, boutons, jauges et fenêtres ; noms accessibles et libellés fixes |
| `src/style.css` | Dimensions, espacements, disposition des calques et adaptation responsive |
| `src/ui-skin.css` | Images, couleurs, cadres, relief, icônes et états visuels de la direction illustrée |
| `src/main.js` | Sélection, menus, textes et compteurs dynamiques, disponibilité des actions et focus des fenêtres |
| `src/progress.js` | Guide de découverte dérivé de la progression du village |
| `src/ui.js` | Raisons d'indisponibilité, conditions de départ et aperçu du butin |
| `src/game/` | Village et combat Phaser, état de la partie, économie et sauvegarde |
| `src/game/ambience.js` | Passages décoratifs : apparition, marche, pause et destruction des acteurs |
| `src/game/ambienceArt.js` | Petits sprites originaux dessinés en Canvas à l'exécution |
| `src/game/ambiencePaths.js` | Trajets courts qui évitent les emprises des bâtiments |
| `public/assets/ui-layered/` | Atlas transparent, 24 sprites PNG et paramètres de neuf tranches dans `sprites.json` |
| `public/assets/` | Images du monde, sprites des unités et visuels historiques conservés |
| `tools/export_ui_layers.sh` | Rectangles de découpe et réexport facultatif des 24 sprites à partir de l'atlas, avec ImageMagick |

L'interface HTML se superpose au canvas Phaser. `main.js` importe `style.css`, puis `ui-skin.css` : la disposition commune est chargée avant l'habillage illustré, qui ajuste aussi certaines dimensions. Les fenêtres d'aide, d'expédition et de confirmation de nouvelle partie suspendent les entrées de la scène pendant leur ouverture. Une action de menu déclenche la même logique de jeu quelle que soit sa variante visuelle.

## Les quatre calques d'un composant

| Calque | Contenu | Règle |
|---|---|---|
| Fond | Surface sombre, parchemin ou face colorée | Suit la taille du composant et laisse assez de contraste pour le texte |
| Cadre | Contour brun, biseau, lumière supérieure et ombre inférieure | Sprite étiré en neuf tranches ; aucun texte intégré dans l'image |
| Icône | `span.ui-icon` avec une image en fond | Taille maîtrisée ; `aria-hidden="true"` si le libellé nomme déjà l'action |
| Texte | Nom, prix, quantité, durée et raison d'indisponibilité | Vrai texte HTML mis à jour depuis l'état du jeu |

Le bouton HTML porte l'interaction et sa zone cliquable. Les boutons statiques contiennent un `span.ui-art` décoratif ; les contrôles créés dynamiquement emploient `::before` pour la même face. Les deux utilisent les mêmes textures et états. Les calques décoratifs ont `pointer-events:none` : les zones transparentes de l'image ne changent pas la zone cliquable du bouton. Les icônes et les chiffres restent au-dessus du fond ; le texte accessible reste présent même si un visuel ne se charge pas.

## Cadres extensibles en neuf tranches

`border-image` découpe chaque texture en quatre coins, quatre bords et un centre. Les coins conservent leur forme, les bords suivent la dimension du contrôle et `fill` dessine le centre des boutons et panneaux. Les rails de jauge omettent `fill` pour laisser voir le remplissage derrière leur cadre. La taille du texte vient du HTML, pas de l'image.

| Famille | Texture | `border-image-slice` | `border-image-width` |
|---|---|---|---|
| Face de bouton | `button-green/orange/blue/red/gold/taupe.png` | `28 fill` | `14px` par défaut |
| Cadre de panneau | `panel-dark.png` | `36 fill` | `18px` par défaut |
| Carte de parchemin | `panel-paper.png` | `36 fill` | `15px` |
| Rail de ressource | `meter-track.png` | `20 32`, sans `fill` | `17px 23px` par défaut |
| Rail de réserve / amélioration | `meter-track.png` | `20 32`, sans `fill` | `4px 9px` |

Les petits contrôles ajustent la largeur du cadre sans changer sa texture. Les panneaux et boutons utilisent `stretch` pour les bords. Les trois textures de remplissage exportées restent disponibles dans l'atlas ; le remplissage animé courant est dessiné en CSS.

Les jauges empilent leur fond sombre, le remplissage dans une zone découpée, puis le rail illustré. Les icônes, montants, capacités et boutons **+** restent au-dessus. Dans le HUD, `.resource-meter` est un frère du texte, et non un enfant de son calque. Les variables `--rail-*` alignent la zone de remplissage sur l'ouverture du cadre ; la réserve et l'amélioration reprennent le même ordre de calques. Un masque CSS (`mask-composite:exclude`) retire aussi les pixels sombres des bandes latérales à l'intérieur de l'ouverture, pour qu'une petite quantité reste visible derrière le cadre. Le PNG du rail reste intact. Ces décorations n'interceptent aucun clic.

Pour modifier une dimension, commencer dans `style.css`. Pour modifier la matière, la variante ou le relief, travailler dans `ui-skin.css`. Éviter d'étirer un bouton complet comme une simple image de fond : cette méthode déforme aussi ses coins et son biseau.

## Une famille sur tous les menus

- **Boutons principaux :** relief épais, libellé clair et contraste fort. Vert pour construire, récolter et former ; orange pour attaquer ; bleu pour déplacer, ouvrir les infos ou confirmer un placement ; or pour améliorer ; rouge pour fermer, annuler un placement ou confirmer une réinitialisation ; taupe pour la navigation secondaire et garder son village.
- **Panneaux :** cadre brun, fond sombre, titre, contenu puis actions. Les cartes internes emploient le parchemin. Le contenu décide de la hauteur ; les fenêtres longues défilent à l'intérieur de leur cadre.
- **Cartes de construction et de troupes :** visuel, nom, coût ou quantité, puis état. Le cadre de sélection s'ajoute sans déplacer le contenu.
- **Jauges :** piste sombre, remplissage coloré et valeurs HTML indépendantes. Le montant et la capacité restent visibles même quand la jauge est vide.
- **Petits contrôles :** fermeture, recentrage, infos, aide et réglages reprennent les mêmes biseaux, contours et états que les grands boutons.

Ces règles s'appliquent aux objectifs, à la palette de construction, aux actions et fiches de bâtiment, au déploiement, aux expéditions, à l'aide, aux réglages et aux états de placement. Éviter une nouvelle palette ou un nouveau type de cadre pour un seul menu.

## Interactions et états

| État | Présentation et comportement |
|---|---|
| Repos | Cadre, relief et libellé lisibles |
| Survol | Mise en lumière sans modifier la taille ni déplacer les autres éléments |
| Appuyé | Relief abaissé ; aucune modification des règles de l'action |
| Actif / sélectionné | Cadre ou teinte renforcés, complétés par `aria-pressed` ou `aria-selected` selon le contrôle |
| Focus clavier | Contour visible avec `:focus-visible`, distinct du survol |
| Indisponible | Attribut HTML `disabled`, saturation et relief atténués, raison affichée près de l'action |

Une couleur seule ne suffit pas à expliquer une action bloquée : le coût, le manque de ressources ou le niveau maximum doivent rester explicites. L'apparence ne décide pas de la disponibilité ; celle-ci vient des règles existantes.

Les fenêtres déplacent le focus à l'ouverture, maintiennent la navigation Tab dans leurs commandes et ferment avec Échap. Le focus revient au déclencheur s'il reste visible et utilisable, sinon au bouton d'expédition ou au canvas. Sur petits écrans, conserver l'espace du texte et faire défiler le contenu plutôt que d'étirer un décor contenant un libellé.

Les raccourcis **+** ouvrent Production et ciblent la carte banque, ferme ou atelier ; ils ne modifient pas les ressources. `#reset-overlay` reprend le focus et les règles de fermeture des autres fenêtres. Seule sa confirmation arrête les anciennes scènes, puis réinitialise l'état. Les cartes de troupes restent présentes dans le DOM quand leurs effectifs se mettent à jour, y compris si une formation finit durant le raid.

Le bouton **Valider** et Entrée confirment le point de placement mémorisé par la scène. La scène revérifie les règles `canBuild` ou `canMove` avant de construire ou déplacer. Le bouton ne crée pas un paiement parallèle et ne transforme pas le déplacement gratuit en dépense.

## Ambiance décorative du village

`VillageScene` crée `VillageAmbience`, puis la met à jour dans sa boucle d'affichage. Poules, lapins et villageois sont dans le calque Phaser `world`, avec une profondeur calculée au niveau des pieds. Leurs sprites ne sont pas interactifs et ne modifient ni l'économie ni la sauvegarde.

L'ambiance limite le nombre de passants à quatre et espace les apparitions d'environ 6 à 9,5 secondes de temps actif. Les trajets locaux contournent les bâtiments et sont recalculés quand leurs emprises changent. L'ouverture d'une fenêtre, le placement ou un onglet masqué suspendent les déplacements ; `prefers-reduced-motion` retire les passants. La fermeture de la scène détruit les acteurs et le suivi de cette préférence.

L'ambiance utilise `game.loop.rawDelta`, avec un maximum de 250 ms par image. Cela évite que le delta lissé de Phaser ralentisse les passants quand le nombre d'images par seconde baisse, tout en limitant les grands déplacements à la reprise. Les horloges de production, de formation et de combat restent celles du jeu existant.

## Réexporter les images

Les 24 sprites proviennent d'un atlas transparent édité à partir de la référence illustrée fournie, sans mots intégrés. L'export découpe les rectangles sans recoloration ni suppression de fond. Les anciens PNG du projet restent conservés.

Pour le développement graphique uniquement, Bash et ImageMagick 7 permettent de reproduire les découpes :

```sh
bash tools/export_ui_layers.sh
```

Le script lit par défaut `public/assets/ui-layered/ui-atlas.png` et écrit les sprites dans le même dossier. Il accepte aussi un chemin d'atlas et un dossier de sortie en arguments. Jouer, installer et compiler le jeu n'exigent pas ImageMagick.

## Faire évoluer un composant

1. Réutiliser le fond, le cadre et les états de la famille existante.
2. Garder titre, coût, quantité et compteur dans le DOM ; les décorations restent remplaçables.
3. Vérifier les textes longs et l'état indisponible aux formats ordinateur, mobile et paysage.
4. Contrôler le focus, Échap, les commandes clavier et l'absence d'entrée involontaire dans le canvas sous une fenêtre.
5. Garder les modifications visuelles hors de l'économie et du format de sauvegarde.

La procédure de contrôle est décrite dans [VERIFICATION.md](VERIFICATION.md). Cette documentation décrit les composants ; les résultats d'une version sont consignés séparément dans le rapport de vérification.
