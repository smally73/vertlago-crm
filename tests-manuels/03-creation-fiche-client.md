# Création d'une fiche client

## TC-12 — Création avec les champs minimum requis

**Objectif** : vérifier qu'on peut créer une fiche avec seulement les
champs obligatoires.

**Étapes** :
1. Aller sur `/clients`, cliquer sur "+ Nouveau client".
2. Remplir uniquement Prénom, Nom et Email.
3. Cliquer sur "Créer la fiche".

**Résultat attendu** : la fiche est créée, on est redirigé vers sa page de
détail, le statut par défaut est "Prospect", le pays par défaut est
"Italie".

## TC-13 — Au moins un identifiant est requis

**Objectif** : vérifier qu'on ne peut pas créer une fiche totalement vide
(sans aucun moyen d'identifier le contact). Prénom, nom et email sont
chacun individuellement optionnels — c'est la combinaison des trois (plus
Instagram) qui doit fournir au moins un identifiant.

**Étapes** :
1. Sur le formulaire de nouveau client, laisser Prénom, Nom, Email **et**
   Instagram tous vides.
2. Cliquer sur "Créer la fiche".

**Résultat attendu** : la création est bloquée, message "Au moins un
identifiant est requis : prénom/nom, email ou Instagram.", aucune fiche
n'est créée.

## TC-14 — Client connu uniquement par son email

**Objectif** : vérifier qu'on peut créer une fiche pour un contact dont on
ne connaît que l'email (ex : quelqu'un qui écrit sans se présenter).

**Étapes** :
1. Remplir uniquement le champ Email, laisser Prénom/Nom/Instagram vides.
2. Cliquer sur "Créer la fiche".

**Résultat attendu** : la fiche est créée. Dans la liste et sur la fiche,
l'email s'affiche à la place du nom (puisqu'il n'y en a pas).

## TC-15 — Création avec tous les champs remplis

**Objectif** : vérifier que tous les champs sont bien enregistrés et
réaffichés correctement.

**Étapes** :
1. Remplir tous les champs : Prénom, Nom, Entreprise, Statut, Email,
   Téléphone, Instagram, "Rencontré via", Adresse, Complément, Code postal,
   Ville, Pays, Tags (plusieurs séparés par des virgules), Notes.
2. Cliquer sur "Créer la fiche".

**Résultat attendu** : la fiche de détail affiche exactement les valeurs
saisies pour chaque champ, y compris tous les tags et le libellé "Rencontré
via" (Salon / Instagram / Mailing / Autre) correctement traduit.

## TC-16 — Création avec plusieurs tags (non-régression)

**Objectif** : un bug déjà corrigé faisait planter le serveur entier à la
création d'un client avec des tags. À revérifier systématiquement.

**Étapes** :
1. Créer un client en indiquant plusieurs tags séparés par des virgules
   (ex : "grossiste, VIP, boutique").
2. Vérifier que le serveur répond normalement ensuite (recharger la liste
   des clients, elle doit s'afficher sans erreur).

**Résultat attendu** : la fiche est créée avec les 3 tags corrects, et
l'application continue de fonctionner normalement juste après (le serveur
ne doit pas avoir planté). Voir aussi
[07-regressions-connues.md](07-regressions-connues.md).

## TC-17 — Rencontré via : les 4 options + non renseigné

**Objectif** : vérifier que le champ "Rencontré via" fonctionne pour
chacune de ses valeurs.

**Étapes** :
1. Créer 4 clients de test, un par valeur : Salon, Instagram, Mailing,
   Autre.
2. Créer un 5e client en laissant "Non renseigné".

**Résultat attendu** : chaque fiche affiche le bon libellé français ; le
5e client n'affiche rien à côté de "Rencontré via" (pas d'erreur, pas de
valeur vide affichée bizarrement).

## TC-40 — Client connu uniquement par son Instagram

**Objectif** : même scénario que TC-14, mais avec Instagram comme seul
identifiant (cas d'usage à l'origine de cette règle : un contact qui écrit
en DM sans se présenter).

**Étapes** :
1. Remplir uniquement le champ Instagram, laisser Prénom/Nom/Email vides.
2. Cliquer sur "Créer la fiche".

**Résultat attendu** : la fiche est créée. Le compte Instagram s'affiche à
la place du nom dans la liste et sur la fiche. La recherche par ce compte
Instagram (même partiel) doit aussi retrouver la fiche.

## TC-41 — Prénom seul, sans nom de famille

**Objectif** : vérifier qu'on n'est pas obligé de connaître le nom de
famille pour que le prénom compte comme identifiant.

**Étapes** :
1. Remplir uniquement le champ Prénom, laisser Nom/Email/Instagram vides.
2. Cliquer sur "Créer la fiche".

**Résultat attendu** : la création réussit (pas besoin du nom de famille en
plus).

## TC-42 — Le champ Pays est une liste déroulante

**Objectif** : vérifier que le pays se choisit dans une liste plutôt que de
se taper au clavier (évite les fautes de frappe/incohérences).

**Étapes** :
1. Sur le formulaire de nouveau client, cliquer sur le champ Pays.

**Résultat attendu** : une liste déroulante s'ouvre avec une liste de pays
(pas un champ texte libre), "Italie" est présélectionné par défaut. Choisir
un autre pays (ex : "France") et créer la fiche : le pays choisi est bien
enregistré et réaffiché sur la fiche.

## TC-18 — Annulation de la création

**Objectif** : vérifier qu'on peut quitter le formulaire sans créer de
fiche.

**Étapes** :
1. Commencer à remplir le formulaire de nouveau client.
2. Cliquer sur "Clients" dans le menu (ou naviguer ailleurs) sans
   soumettre.

**Résultat attendu** : aucune fiche n'est créée, retour à la liste.
