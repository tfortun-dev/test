# Astrub — v0.8.0

## Sprites peints et personnages

- Villageois, poules, lapins, Iops et Crâs utilisent des atlas PNG peints à partir de la direction artistique des bâtiments fournis.
- Les passants ont quatre poses de marche dans quatre orientations. Les troupes ont quatre poses de marche et quatre d'attaque par orientation ; le repos peut réutiliser une pose fixe.
- Les personnages partagent un format de cellule et un ancrage aux pieds normalisés. Le tri en profondeur suit leur position au sol.
- Les portraits de l'interface utilisent la première pose de leurs exports. Les personnages ne sont plus dessinés par Canvas pendant le jeu.
- Huit illustrations de décor peintes complètent les cinq personnages et les six types de bâtiments.

## Animation des bâtiments

- Six bâtiments utilisent des atlas de quatre poses, avec une boucle lente à environ 3 images par seconde.
- La façade, l'échelle, l'ancrage au sol, le tri visuel et la zone de sélection restent stables ; l'animation change la frame affichée.
- La pose fixe est conservée pour les cartes de construction et les aperçus de placement. La boucle ne repart pas de zéro à chaque sélection.
- Les animations décoratives se mettent en pause pendant les fenêtres, le placement et quand l'onglet est masqué. La préférence de réduction des animations affiche une pose fixe pour les bâtiments.

## Continuité et portée

La refonte utilise des sprites 2D et des atlas ; elle n'ajoute pas de moteur 3D en temps réel. Les poses proviennent d'images éditées avec `image_gen`, puis découpées et normalisées à l'export. La chaîne et ses contrôles sont décrits dans [ART_PIPELINE.md](ART_PIPELINE.md).

Le ZIP du jeu contient les images prêtes à l'emploi. Un pack ART séparé regroupe les planches, références, recettes et exporteurs pour la réédition ; cette étape est facultative.

Les niveaux, coûts, productions, entraînements, raids et sauvegardes gardent leurs règles. Les façades ne changent pas selon le niveau : les améliorations restent celles du prototype existant. Le combat reste une démonstration sans riposte ennemie ni défaite naturelle.

La suite du gameplay reste décrite dans [SUITE_DU_PROJET.md](SUITE_DU_PROJET.md). Les vérifications de cette version sont consignées séparément dans [RESULTATS_VERIFICATION.json](RESULTATS_VERIFICATION.json).
