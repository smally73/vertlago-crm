# Liste des clients

## TC-06 — Affichage de la liste

**Objectif** : vérifier que la liste des clients s'affiche correctement.

**Pré-requis** : être connecté, au moins un client existe en base.

**Étapes** :
1. Aller sur `/clients`.

**Résultat attendu** : un tableau s'affiche avec les colonnes Nom,
Entreprise, Contact, Statut, Tags. Le nombre de fiches est indiqué en haut
("X fiche(s)"). Cliquer sur une ligne (ou sur le nom) ouvre la fiche du
client correspondant.

## TC-07 — Liste vide

**Objectif** : vérifier le message affiché quand aucun client n'existe (ou
qu'aucun ne correspond à la recherche).

**Étapes** :
1. Filtrer/rechercher quelque chose qui ne correspond à aucun client (ex :
   "zzzzzz" dans la recherche).

**Résultat attendu** : le message "Aucun client pour l'instant." (ou
équivalent) s'affiche à la place du tableau, pas d'erreur ni de tableau
vide cassé.

## TC-08 — Recherche par nom, entreprise ou email

**Objectif** : vérifier que la recherche filtre correctement.

**Pré-requis** : au moins deux clients avec des noms/entreprises/emails
différents.

**Étapes** :
1. Taper une partie du nom d'un client dans le champ de recherche.
2. Effacer, puis taper une partie de son entreprise.
3. Effacer, puis taper une partie de son email.

**Résultat attendu** : à chaque étape, seuls les clients correspondants
restent affichés. La recherche n'est pas sensible à la casse (majuscules /
minuscules).

## TC-09 — Filtre par statut

**Objectif** : vérifier que le filtre de statut (Prospect / Actif /
Inactif) fonctionne.

**Pré-requis** : au moins un client dans deux statuts différents.

**Étapes** :
1. Sélectionner "Actif" dans le menu déroulant de statut.
2. Sélectionner "Prospect".
3. Revenir à "Tous statuts".

**Résultat attendu** : seuls les clients du statut sélectionné s'affichent
à chaque fois ; "Tous statuts" réaffiche l'ensemble.

## TC-10 — Combinaison recherche + filtre statut

**Objectif** : vérifier que recherche et filtre se combinent (et non l'un
n'écrase pas l'autre).

**Étapes** :
1. Choisir un statut dans le filtre.
2. Taper une recherche qui ne correspond à aucun client de ce statut.

**Résultat attendu** : liste vide (aucun résultat), preuve que les deux
critères s'appliquent ensemble (ET logique, pas OU).

## TC-11 — Affichage des tags dans la liste

**Objectif** : vérifier que les tags d'un client s'affichent bien dans la
colonne Tags.

**Pré-requis** : un client avec au moins un tag.

**Étapes** :
1. Repérer ce client dans la liste.

**Résultat attendu** : ses tags s'affichent sous forme de petites
étiquettes dans la colonne Tags ; un client sans tag affiche une colonne
vide sans erreur.
