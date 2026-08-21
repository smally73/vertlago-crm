# Module Dépenses

## TC-46 — Accès au module

**Objectif** : vérifier que le nouvel item de menu "Dépenses" est présent
et fonctionnel.

**Étapes** :
1. Se connecter, repérer "Dépenses" dans le menu (sous "Clients").
2. Cliquer dessus.

**Résultat attendu** : la page liste des dépenses s'affiche (`/expenses`),
avec un bouton "+ Nouvelle dépense", les boutons de période "30 derniers
jours"/"90 derniers jours" et les filtres.

## TC-47 — Création d'une dépense avec tous les champs

**Objectif** : vérifier que la création fonctionne et que les champs sont
bien enregistrés/réaffichés.

**Étapes** :
1. Cliquer sur "+ Nouvelle dépense".
2. Remplir Montant, Devise, Date, Bénéficiaire, Motif, Typologie.
3. Cliquer sur "Créer la dépense".

**Résultat attendu** : redirection vers la liste, la nouvelle dépense
apparaît avec toutes les valeurs saisies correctement affichées (date au
format JJ/MM/AAAA, typologie sous forme d'étiquette, montant + devise).

## TC-48 — Champs obligatoires

**Objectif** : vérifier que Montant, Bénéficiaire et Typologie sont
réellement requis (Motif et Date restent optionnels — la Date a une valeur
par défaut).

**Étapes** :
1. Sur le formulaire, laisser Montant vide, remplir le reste, essayer de
   créer.
2. Laisser Bénéficiaire vide, essayer de créer.
3. Laisser Typologie sur "Choisir...", essayer de créer.

**Résultat attendu** : dans les 3 cas, la création est bloquée avec un
message clair, aucune dépense n'est créée.

## TC-49 — Devise par défaut et choix

**Objectif** : vérifier la liste des devises et la valeur par défaut.

**Étapes** :
1. Ouvrir le formulaire de nouvelle dépense sans toucher au champ Devise.
2. Ouvrir le menu déroulant Devise.

**Résultat attendu** : "EUR" est sélectionné par défaut ; le menu propose
EUR, USD, GBP, CHF, JPY.

## TC-50 — Autocomplétion du bénéficiaire

**Objectif** : vérifier que les bénéficiaires déjà saisis sont suggérés à
la saisie (pas besoin de les retaper à l'identique).

**Pré-requis** : au moins une dépense déjà créée pour un bénéficiaire
donné (ex : "Imprimerie Dupont").

**Étapes** :
1. Créer une nouvelle dépense, commencer à taper "Impri" dans le champ
   Bénéficiaire.

**Résultat attendu** : "Imprimerie Dupont" apparaît en suggestion dans la
liste déroulante native du champ.

## TC-51 — Bascule 30 jours / 90 jours

**Objectif** : vérifier que les deux raccourcis de période fonctionnent et
ajustent bien les dates du filtre.

**Pré-requis** : des dépenses à des dates différentes (certaines dans les
30 derniers jours, une entre 30 et 90 jours).

**Étapes** :
1. Ouvrir la liste (par défaut : "30 derniers jours" actif).
2. Cliquer sur "90 derniers jours".

**Résultat attendu** : par défaut, seules les dépenses des 30 derniers
jours s'affichent, avec le bouton "30 derniers jours" mis en évidence
(couleur pleine). Après clic sur "90 derniers jours", les champs de date
du filtre s'ajustent automatiquement et les dépenses plus anciennes (mais
dans les 90 jours) apparaissent aussi.

## TC-52 — Filtres (dates, bénéficiaire, montant, typologie)

**Objectif** : vérifier que chaque filtre fonctionne, et qu'ils se
combinent.

**Pré-requis** : plusieurs dépenses avec des bénéficiaires, montants et
typologies différents.

**Étapes** :
1. Modifier manuellement les champs de date (ce qui doit désélectionner
   les boutons 30/90 jours).
2. Filtrer par une partie du nom d'un bénéficiaire.
3. Filtrer par montant min/max.
4. Filtrer par typologie.

**Résultat attendu** : à chaque étape, seules les dépenses correspondantes
restent affichées ; les filtres se combinent (ET logique).

## TC-53 — Total affiché par devise

**Objectif** : vérifier que le total ne mélange pas des devises
différentes.

**Pré-requis** : au moins deux dépenses visibles dans la période filtrée,
dans deux devises différentes (ex : une en EUR, une en USD).

**Étapes** :
1. Regarder la ligne sous le titre "Dépenses" (à côté du nombre de
   dépenses).

**Résultat attendu** : un total est affiché **par devise** séparément (ex :
"Total : 45,90 EUR + 300,00 USD"), jamais une somme unique qui mélangerait
des devises.

## TC-54 — Modifier une dépense

**Objectif** : vérifier que la modification fonctionne et pré-remplit
correctement le formulaire.

**Étapes** :
1. Cliquer sur une dépense dans la liste.
2. Vérifier que tous les champs sont pré-remplis avec les valeurs actuelles.
3. Changer le montant, enregistrer.

**Résultat attendu** : retour à la liste, le nouveau montant est affiché.

## TC-55 — Supprimer une dépense

**Objectif** : vérifier que la suppression fonctionne (contrairement aux
fiches clients, la suppression d'une dépense est directe et définitive,
ouverte à tout employé — pas de mécanisme d'archivage pour ce module).

**Pré-requis** : une dépense de test.

**Étapes** :
1. Ouvrir la dépense, cliquer sur "Supprimer", confirmer.

**Résultat attendu** : retour à la liste, la dépense n'apparaît plus.

## TC-56 — Accéder à une dépense introuvable

**Objectif** : vérifier le comportement sur une URL de dépense invalide ou
déjà supprimée.

**Étapes** :
1. Taper une URL du type `/expenses/xxxxx` avec un identifiant qui
   n'existe pas.

**Résultat attendu** : message clair "Cette dépense est introuvable." avec
un lien de retour vers la liste — pas de blocage infini sur "Chargement..."
(même correctif que TC-24 pour les fiches clients).
