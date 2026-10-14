# Astrub — v0.7.2

## Jauges

- Le remplissage des ressources reste dans l'ouverture de la jauge, derrière le rail illustré ; il ne recouvre plus son cadre.
- Les valeurs, capacités, icônes et raccourcis **+** sont séparés du fond et restent au premier plan.
- Les jauges de réserve et d'amélioration reprennent le même ordre : fond, remplissage, cadre.
- Le rail réutilise `meter-track.png` sans son centre opaque. Les remplissages restent animés en CSS, sans nouveau visuel ni changement des quantités.

## Première ambiance du village

- Des poules, lapins et villageois font de courts passages autour de la maison de guilde, avec entrée et sortie en fondu. Quatre passants au maximum peuvent être visibles.
- Les trajets contournent les emprises des bâtiments et sont recalculés après une construction ou un déplacement.
- Les petits sprites sont dessinés par le code à l'exécution : aucun nouveau PNG ni téléchargement d'asset n'est nécessaire.
- Les passants de l'ancienne scène sont retirés au départ en combat ou à la réinitialisation. L'ambiance se met en pause pendant les fenêtres, le placement et quand l'onglet est masqué ; la préférence de réduction des animations la désactive.

Cette ambiance est décorative : aucun clic, besoin, emploi, ressource ou effet sur le raid n'est associé aux passants. Elle n'est pas enregistrée dans la sauvegarde.

## Continuité

Les coûts, la production, les améliorations, la formation, les raids et la sauvegarde locale conservent leurs règles. Le combat reste une démonstration sans riposte ennemie ni défaite naturelle. Les prochaines étapes de gameplay sont décrites dans [SUITE_DU_PROJET.md](SUITE_DU_PROJET.md).
