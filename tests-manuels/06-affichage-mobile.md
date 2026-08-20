# Affichage sur mobile (iPhone / petit écran)

À tester soit sur un vrai iPhone (si l'environnement est accessible depuis
le téléphone), soit en émulant un écran étroit dans le navigateur (mode
"appareil mobile" des outils de développement, largeur ~375-390px).

## TC-33 — Barre de navigation en haut sur mobile

**Objectif** : vérifier que la barre latérale desktop devient une barre
horizontale en haut de l'écran sur mobile, plutôt que d'écraser le contenu.

**Étapes** :
1. Réduire la largeur de la fenêtre (ou ouvrir sur iPhone) en dessous
   d'environ 680px de large.
2. Observer l'en-tête "VERTLAGO / Back-office", le lien "Clients", et le
   bloc utilisateur/déconnexion.

**Résultat attendu** : ces éléments s'affichent en haut, en ligne
horizontale (pas sur le côté), le contenu principal prend toute la
largeur restante en dessous.

## TC-34 — Aucun défilement horizontal parasite

**Objectif** : vérifier qu'aucune page ne déborde horizontalement sur
petit écran (ce qui obligerait à scroller latéralement, signe d'un bug de
mise en page).

**Étapes** :
1. Sur mobile/écran étroit, ouvrir successivement : page de connexion,
   liste des clients, formulaire nouveau client, fiche détail d'un client.
2. Essayer de faire défiler la page horizontalement.

**Résultat attendu** : aucune des pages ne permet de scroller
horizontalement (à l'exception éventuelle du tableau clients lui-même, qui
peut avoir son propre défilement horizontal interne si beaucoup de
colonnes — mais pas la page entière).

## TC-35 — Formulaire client en une seule colonne sur mobile

**Objectif** : vérifier que les champs du formulaire (habituellement deux
par ligne sur desktop) s'empilent proprement sur mobile.

**Étapes** :
1. Sur mobile, ouvrir "+ Nouveau client".
2. Observer l'agencement des champs (Prénom/Nom, Email/Téléphone, etc.).

**Résultat attendu** : chaque champ occupe toute la largeur disponible,
les champs sont empilés verticalement et restent tous lisibles et
utilisables (pas de texte coupé, pas de champ minuscule).

## TC-36 — Fiche client : sections empilées sur mobile

**Objectif** : vérifier que "Coordonnées" et "Journal d'interactions"
(côte à côte sur desktop) s'empilent verticalement sur mobile.

**Étapes** :
1. Sur mobile, ouvrir une fiche client.

**Résultat attendu** : la carte "Coordonnées" apparaît au-dessus de la
carte "Journal d'interactions", chacune sur toute la largeur de l'écran.

## TC-37 — Connexion et formulaires utilisables au clavier tactile

**Objectif** : vérifier que saisir du texte au clavier de l'iPhone ne
casse pas l'affichage (zoom automatique intempestif, champ caché par le
clavier, etc.).

**Étapes** :
1. Sur un vrai iPhone, ouvrir la page de connexion, toucher le champ email.
2. Taper du texte, passer au champ mot de passe.
3. Faire de même sur le formulaire de nouveau client (plusieurs champs).

**Résultat attendu** : pas de zoom automatique gênant à la sélection d'un
champ, le champ actif reste visible au-dessus du clavier, la saisie est
fluide.
