# Astrub — v0.7.1

L'interface reprend la direction de la planche illustrée du projet : davantage de relief, des couleurs franches et des cadres cohérents avec le village.

## Présentation

- Boutons à biseaux épais, reflets et ombres de contact ; variantes vertes, orange, bleues, dorées, rouges et taupe.
- Cadres bruns, panneaux sombres et cartes de parchemin harmonisés sur les objectifs, la construction, les fiches de bâtiment, la préparation d'expédition, l'aide et les réglages.
- Jauges de ressources sur fond sombre, avec montants et capacités toujours visibles.
- Icônes, libellés et décoration traités séparément : les coûts, compteurs et textes restent en HTML.
- Nouvel atlas transparent dérivé de la référence illustrée, exporté en 24 PNG séparés. Les cadres utilisent une découpe CSS en neuf tranches pour préserver les coins pendant le redimensionnement.
- Séparation du CSS de disposition (`style.css`) et de l'habillage illustré (`ui-skin.css`). Les anciens visuels restent dans le projet ; les nouveaux composants emploient l'habillage séparé.
- États actif, appuyé, focus clavier et indisponible intégrés à la même famille de composants.
- Documentation de l'organisation des composants dans [UI_ARCHITECTURE.md](UI_ARCHITECTURE.md).

## Placement

Un bouton **Valider** permet de confirmer l'emplacement mémorisé sur la carte pendant une construction ou un déplacement. La confirmation revérifie la place et les ressources avant d'appliquer l'action ; elle emploie les mêmes coûts et règles que le placement existant. Entrée reste disponible.

## Interactions et correctifs

- Les **+** verts des ressources ouvrent Production et mettent le focus sur le producteur correspondant, ou expliquent son indisponibilité. Ce sont des raccourcis de construction ; ils n'ajoutent pas de ressources et restent indisponibles en combat.
- La nouvelle partie passe par une confirmation illustrée. Échap, la fermeture et un clic hors de la fenêtre annulent ; seul **Recommencer** réinitialise la sauvegarde.
- Les anciennes scènes sont arrêtées avant la réinitialisation, pour que les callbacks d'un raid ne puissent pas consommer les troupes du nouveau village.
- Une formation achevée pendant un combat actualise l'effectif disponible, en conservant les cartes HTML au lieu de les reconstruire.

## Continuité

La v0.7.1 conserve les fonctions de la v0.7.0 : collecte, placement et déplacement, amélioration, formation, objectifs de découverte et préparation d'expédition. Les règles économiques, les durées, les sprites du monde et le format de sauvegarde locale restent identiques.

Le combat reste une démonstration locale sans riposte ennemie, perte de PV ni défaite naturelle. Les unités déployées sont dépensées au retour. Les prochaines étapes de gameplay figurent dans [SUITE_DU_PROJET.md](SUITE_DU_PROJET.md).
