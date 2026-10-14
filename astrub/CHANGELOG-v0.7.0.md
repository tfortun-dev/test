# Astrub — v0.7.0

Cette version rend le village plus lisible et prépare mieux le départ en raid, en conservant la progression du prototype précédent.

## Interface

- Une même direction visuelle pour les jauges, boutons, cartes et fenêtres : parchemin, vert forêt et cuivre.
- Noms de bâtiments en français et construction regroupée en **Production**, **Stockage** et **Armée**.
- Ressources affichées avec leur capacité, réserves et compteurs d'amélioration plus faciles à lire.
- Cartes de construction avec coûts, état disponible ou indisponible et explication des ressources manquantes.
- Actions de bâtiment et entraînement avec raisons d'indisponibilité explicites ; la fiche de caserne s'ouvre directement pour accéder aux troupes.
- Guide de découverte : construire une caserne, améliorer un bâtiment, gagner une première expédition. Les étapes accomplies sont retrouvées à partir de la sauvegarde.

## Expéditions et interactions

- Fenêtre de préparation avant de rejoindre le camp : effectif des Iops et Crâs, caractéristiques, butin et part récupérable selon le stockage.
- Conditions de départ affichées et règle de consommation expliquée : seules les unités déployées sont retirées de l'armée, y compris en cas d'abandon.
- Sélection des troupes plus claire pendant le combat ; les unités indisponibles sont désactivées.
- État de construction et de déplacement visible, avec possibilité d'annuler au clavier.
- Fenêtres avec gestion du focus, retour au bouton d'origine et fermeture par Échap ; disposition adaptée aux petits écrans.

## Continuité et limites

- Règles économiques, coûts, durées, plafonds, placement, améliorations et résolution du raid conservés.
- Même clé et même format de sauvegarde locale : aucune remise à zéro imposée.
- Sprites du village, décors et unités conservés ; aucune nouvelle illustration nécessaire pour cette refonte.
- Le guide n'ajoute pas encore de récompenses ni de nouveaux déblocages.
- Le raid reste une démonstration PvE : le camp ne riposte pas, les troupes ne subissent pas de dégâts et il n'y a pas de limite de temps. La préparation affiche cette limite.
- La partie reste locale, sans compte ni multijoueur.

La suite proposée est détaillée dans [SUITE_DU_PROJET.md](SUITE_DU_PROJET.md) : parcours récompensé, vrais raids PvE, puis campagne et premier service de sauvegarde en ligne.
