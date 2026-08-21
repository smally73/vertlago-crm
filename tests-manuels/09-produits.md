# Module Produits

## TC-57 — Accès au module

**Objectif** : vérifier que le nouvel item de menu "Produits" est présent
et fonctionnel.

**Étapes** :
1. Se connecter, repérer "Produits" dans le menu (entre Clients et
   Dépenses).
2. Cliquer dessus.

**Résultat attendu** : la page liste des produits s'affiche (`/products`),
avec un bouton "+ Nouveau produit" et les filtres (recherche, catégorie,
statut).

## TC-58 — Création d'un produit

**Objectif** : vérifier que la création fonctionne et que les champs sont
bien enregistrés/réaffichés.

**Étapes** :
1. Cliquer sur "+ Nouveau produit".
2. Remplir Nom, Référence, Catégorie, Prix unitaire, Devise.
3. Créer.

**Résultat attendu** : redirection vers la liste, le produit apparaît avec
toutes les valeurs saisies, statut "Actif" par défaut.

## TC-59 — Champs obligatoires

**Objectif** : vérifier que Nom et Catégorie sont requis (Référence, Prix,
Devise restent optionnels/avec valeur par défaut).

**Étapes** :
1. Laisser Nom vide, essayer de créer.
2. Laisser Catégorie sur "Choisir...", essayer de créer.

**Résultat attendu** : dans les 2 cas, la création est bloquée, aucun
produit créé.

## TC-60 — Unicité de la référence (SKU)

**Objectif** : vérifier qu'on ne peut pas avoir deux produits avec la même
référence, mais que plusieurs produits sans référence coexistent sans
problème.

**Pré-requis** : un produit existant avec une référence connue (ex :
"FOU-RIV-001").

**Étapes** :
1. Créer un nouveau produit avec cette même référence "FOU-RIV-001".
2. Créer deux produits différents en laissant tous les deux le champ
   Référence vide.

**Résultat attendu** : l'étape 1 est bloquée avec un message clair
("Cette référence (SKU) est déjà utilisée."). L'étape 2 réussit pour les
deux produits (une référence vide n'est jamais considérée en doublon).

## TC-61 — Recherche et filtres

**Objectif** : vérifier que la recherche (nom ou référence) et les
filtres catégorie/statut fonctionnent, y compris combinés.

**Pré-requis** : plusieurs produits de catégories et statuts différents.

**Étapes** :
1. Rechercher une partie du nom d'un produit.
2. Effacer, rechercher sa référence.
3. Filtrer par catégorie.
4. Filtrer par statut "Inactif".

**Résultat attendu** : à chaque étape, seuls les produits correspondants
s'affichent.

## TC-62 — Désactiver / réactiver un produit

**Objectif** : vérifier le cycle de vie du produit — pas de suppression,
seulement un changement de statut (voir aussi TC-63).

**Étapes** :
1. Ouvrir un produit actif, passer son statut à "Inactif", enregistrer.
2. Vérifier qu'il reste visible dans la liste (avec le filtre "Tous
   statuts" ou "Inactif").
3. Le repasser en "Actif".

**Résultat attendu** : le produit n'est jamais supprimé, seul son statut
change ; il reste consultable et modifiable dans les deux états.

## TC-63 — Aucune suppression possible (non-régression volontaire)

**Objectif** : confirmer qu'il n'existe **aucun** moyen de supprimer
définitivement un produit depuis l'interface — c'est une décision produit
délibérée (contrairement aux fiches Clients), pas un oubli. Si un bouton
Supprimer apparaissait un jour sur cette page, ce serait une régression à
signaler.

**Étapes** :
1. Ouvrir la fiche d'un produit (`/products/:id`).

**Résultat attendu** : aucun bouton "Supprimer" n'est présent sur la page,
seulement "Enregistrer les modifications".

## TC-64 — Accéder à un produit introuvable

**Objectif** : vérifier le comportement sur une URL de produit invalide.

**Étapes** :
1. Taper une URL du type `/products/xxxxx` avec un identifiant qui
   n'existe pas.

**Résultat attendu** : message clair "Ce produit est introuvable." avec un
lien de retour vers la liste — pas de blocage sur "Chargement...".
