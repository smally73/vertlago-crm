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

## TC-13 — Prénom et nom obligatoires

**Objectif** : vérifier que le prénom et le nom sont réellement requis.

**Étapes** :
1. Sur le formulaire de nouveau client, laisser Prénom ou Nom vide, remplir
   le reste.
2. Cliquer sur "Créer la fiche".

**Résultat attendu** : la création est bloquée, un message indique que le
prénom et le nom sont requis, aucune fiche n'est créée.

## TC-14 — Email obligatoire

**Objectif** : vérifier que l'email est obligatoire (règle métier ajoutée
spécifiquement).

**Étapes** :
1. Remplir Prénom et Nom, laisser Email vide.
2. Cliquer sur "Créer la fiche".

**Résultat attendu** : la création est bloquée (le navigateur ou le
formulaire signale que l'email est requis), aucune fiche n'est créée.

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

## TC-18 — Annulation de la création

**Objectif** : vérifier qu'on peut quitter le formulaire sans créer de
fiche.

**Étapes** :
1. Commencer à remplir le formulaire de nouveau client.
2. Cliquer sur "Clients" dans le menu (ou naviguer ailleurs) sans
   soumettre.

**Résultat attendu** : aucune fiche n'est créée, retour à la liste.
