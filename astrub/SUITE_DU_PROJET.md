# Astrub — la suite du prototype

## Le cap

Faire vivre une boucle courte : **récolter → développer le village → préparer une escouade → choisir un raid → revenir avec des ressources et un nouvel objectif**. L'identité peut venir des classes complémentaires, de l'alchimie et des petites expéditions, plutôt que d'ajouter immédiatement beaucoup de bâtiments.

## Ce que la v0.7.0 apporte déjà

- Village isométrique : placement, déplacement gratuit, collecte et améliorations jusqu'au niveau 5.
- Trois ressources, réserves propres aux producteurs et stockage augmenté par les entrepôts.
- Formation de Iops et de Crâs ; raid contre un camp prédéfini.
- Sauvegarde locale dans le navigateur et progression des compteurs à la reprise.
- Interface unifiée autour du parchemin, du vert forêt et du cuivre : catégories Production, Stockage et Armée, capacités visibles et raisons des actions indisponibles.
- Guide de trois premiers objectifs — construire une caserne, améliorer un bâtiment, gagner un raid — calculé à partir de la sauvegarde existante.
- Préparation d'expédition avec effectifs, butin annoncé, limite de stockage et règle de consommation des unités déployées.
- Fiche de caserne ouverte directement, états de placement lisibles et navigation clavier des fenêtres d'aide et d'expédition.

Le combat reste une démonstration : les bâtiments ennemis ne ripostent pas, les troupes ne subissent pas de dégâts et il n'y a pas de limite de temps. Une unité peut donc finir seule le camp. Le niveau du bâtiment principal ne débloque pas encore de contenu. Ces deux points doivent devenir les prochaines priorités de gameplay.

## Phase 1 — Une première session avec un objectif

**Prochaine étape conseillée : une version locale jouable pendant 15 à 20 minutes.**

1. Transformer le guide actuel en parcours récompensé : ajouter les objectifs de récolte et de formation, puis relier caserne, premier raid et amélioration du bâtiment principal. Enregistrer les récompenses déjà réclamées pour qu'elles restent uniques après rechargement.
2. Faire du bâtiment principal un vrai palier : niveaux 1 à 3, limites de bâtiments et déblocages lisibles avant de payer. Afficher ce que chaque amélioration change réellement.
3. Ajouter une vraie limite de capacité d'escouade à l'effectif déjà affiché, et détailler la file de formation : places, unités en attente et effet du niveau de caserne. Choisir explicitement une file commune ou des files par classe.
4. Ajuster les coûts et le butin pour que récolte et raids soient tous deux utiles. Préserver les durées courtes du prototype pendant les essais.

**Critère pour passer à la suite :** un nouveau joueur accomplit cette boucle sans explication orale, sait pourquoi améliorer son village et retrouve sa progression après avoir fermé puis rouvert le jeu. Aucun objectif ne se récompense deux fois ; aucune amélioration ne retire de ressources sans effet annoncé.

## Phase 2 — Trois vrais raids PvE

1. Créer trois camps avec difficulté, récompenses et composition visibles avant le départ : un tutoriel, un camp à distance, puis un camp qui demande une escouade mixte.
2. Ajouter des défenses ennemies qui ciblent et blessent les troupes, une limite de temps, une défaite et une fin de combat propre. Le bâtiment qui produit les kamas doit garder son rôle de banque ; une défense doit avoir sa propre définition.
3. Donner une fonction distincte aux classes : Iop au contact, robuste ; Crâ à distance, plus fragile. Définir des priorités de cible, la portée et les collisions avec les bâtiments avant d'ajouter de nouvelles classes.
4. Compléter la préparation d'expédition par un bilan au retour : destruction, troupes engagées, pertes, butin gagné et part bloquée par le stockage. Décider si les survivants doivent revenir ; dans le prototype actuel, toutes les unités déployées sont dépensées.

**Critère pour passer à la suite :** le camp d'introduction reste accessible, le camp difficile peut se perdre, et changer la composition ou le déploiement change le résultat. Abandonner ou terminer un raid applique une seule fois les pertes et les récompenses.

## Phase 3 — Une petite campagne, puis un premier service en ligne

1. Relier les camps par une carte d'expéditions avec 6 à 8 étapes, des récompenses uniques et un adversaire final. Tester les temps d'attente, le rythme de progression et les plafonds avec quelques joueurs avant d'étendre le contenu.
2. Introduire une seule nouvelle classe quand les deux premières sont équilibrées. Privilégier un rôle utile, par exemple le soin, avec un camp qui explique son intérêt.
3. Ajouter l'export/import d'une sauvegarde validée et des migrations testées avant de changer son format.
4. Pour le premier jalon en ligne : compte, sauvegarde distante et restauration sur un second appareil. Faire ensuite calculer ressources, temps, coûts et résultats de combat par le serveur. Le client envoie des actions ; il ne décide pas seul du butin.

**Critère pour le jalon en ligne :** une partie se retrouve sur deux appareils, une requête répétée ne duplique pas une récompense, et une horloge locale modifiée ne crée pas de ressources. Les données invalides sont refusées sans perdre la sauvegarde valide.

Les clans, dons, classements et raids contre les villages d'autres joueurs viendront après ce jalon. Le PvP asynchrone nécessitera des instantanés de villages, des règles de protection et une résolution de combat vérifiable.

## Données locales et données en ligne

| Sujet | Prototype actuel | Cible avant le multijoueur |
|---|---|---|
| Sauvegarde | `localStorage` du navigateur, clé conservée | Données versionnées sur un serveur, liées à un compte |
| Temps et production | Horloge de l'appareil, réserves plafonnées | Horloge serveur et opérations validées |
| Combat | Scène locale, camp fixe | Règles reproductibles, résultat vérifié |
| Progression | Ressources, bâtiments, troupes, victoires et guide dérivé de ces données | Objectifs récompensés, campagne, déblocages et migrations |

## Priorité immédiate

Commencer par **le parcours récompensé et les déblocages de la phase 1**, puis réaliser **un seul camp capable de riposter**. Ce petit périmètre permettra de tester le plaisir de la boucle avant de produire une grande carte ou une longue liste de classes.
