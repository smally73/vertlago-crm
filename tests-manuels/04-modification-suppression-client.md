# Modification et suppression d'une fiche client

## TC-19 — Modifier une fiche existante

**Objectif** : vérifier qu'on peut modifier les informations d'un client
et que les changements sont bien enregistrés.

**Pré-requis** : une fiche client existante.

**Étapes** :
1. Ouvrir la fiche, cliquer sur "Modifier".
2. Vérifier que le formulaire est pré-rempli avec les valeurs actuelles.
3. Changer plusieurs champs (ex : téléphone, statut, tags).
4. Cliquer sur "Enregistrer les modifications".

**Résultat attendu** : retour à la fiche de détail avec les nouvelles
valeurs affichées correctement.

## TC-20 — La règle "au moins un identifiant" s'applique aussi en modification

**Objectif** : vérifier que la règle "au moins un identifiant" (voir
[03-creation-fiche-client.md](03-creation-fiche-client.md), TC-13)
s'applique aussi en modification, pas seulement à la création — on ne doit
pas pouvoir vider une fiche jusqu'à ce qu'elle n'ait plus aucun moyen
d'identifier le contact.

**Étapes** :
1. Ouvrir "Modifier" sur une fiche qui n'a qu'un seul identifiant rempli
   (ex : seulement un email, pas de nom ni d'Instagram).
2. Vider ce champ Email sans en remplir d'autre.
3. Cliquer sur "Enregistrer les modifications".

**Résultat attendu** : la modification est bloquée, message d'erreur clair,
l'email d'origine reste inchangé en base. (Vider l'email d'une fiche qui a
*par ailleurs* un prénom/nom ou un Instagram doit, lui, réussir sans
problème.)

## TC-21 — Annuler une modification en cours

**Objectif** : vérifier que le bouton "Annuler" ne sauvegarde rien.

**Étapes** :
1. Ouvrir "Modifier", changer un champ.
2. Cliquer sur "Annuler".

**Résultat attendu** : retour à la fiche de détail, aucune des
modifications faites n'est enregistrée.

## TC-22 — Archiver une fiche

**Objectif** : vérifier que "Archiver" (qui a remplacé la suppression
directe) fonctionne et redirige correctement. Un employé (pas seulement un
admin) doit pouvoir le faire.

**Pré-requis** : une fiche de test (pas une vraie fiche client), statut
autre qu'"Archivé".

**Étapes** :
1. Ouvrir la fiche : le bouton doit s'appeler "Archiver" (pas
   "Supprimer").
2. Cliquer dessus, confirmer la boîte de dialogue de confirmation.

**Résultat attendu** : la fiche n'est **pas** supprimée (elle existe
toujours en base, avec le statut "Archivé") ; elle disparaît juste de la
liste par défaut (voir TC-09). Si redirigé vers la liste, le compteur "X
fiche(s)" ne compte plus cette fiche.

## TC-23 — Annuler l'archivage

**Objectif** : vérifier que la boîte de confirmation empêche bien un
archivage accidentel.

**Étapes** :
1. Ouvrir une fiche non archivée, cliquer sur "Archiver".
2. Annuler la boîte de dialogue de confirmation (au lieu de valider).

**Résultat attendu** : la fiche garde son statut d'origine, aucun
archivage n'a eu lieu.

## TC-43 — Désarchiver une fiche

**Objectif** : vérifier qu'une fiche archivée par erreur (ou dont le
contact redevient actif) peut être restaurée par n'importe quel employé.

**Pré-requis** : une fiche déjà archivée (voir TC-22).

**Étapes** :
1. Ouvrir la fiche archivée (via le filtre "Archivé" de la liste, TC-09).
2. Le bouton doit maintenant s'appeler "Désarchiver" (plus "Archiver").
3. Cliquer dessus.

**Résultat attendu** : la fiche repasse en statut "Prospect" (pas besoin de
confirmation pour cette action, contrairement à l'archivage) et réapparaît
dans la liste par défaut.

## TC-44 — Suppression définitive réservée aux admins

**Objectif** : vérifier le point 7 de l'audit sécurité — seul un admin peut
purger définitivement une fiche, et uniquement si elle est déjà archivée.

**Pré-requis** : un compte admin, un compte employé (non-admin), une fiche
de test déjà archivée.

**Étapes** :
1. Se connecter avec le compte **employé** (non-admin), ouvrir la fiche
   archivée.
2. Se connecter avec le compte **admin**, ouvrir la même fiche archivée.
3. Cliquer sur "Supprimer définitivement", confirmer.

**Résultat attendu** : à l'étape 1, aucun bouton de suppression définitive
n'est visible pour l'employé (seul "Désarchiver" apparaît). À l'étape 3, la
fiche est réellement supprimée de la base (plus retrouvable même avec le
filtre "Archivé").

## TC-45 — Impossible de purger une fiche non archivée

**Objectif** : vérifier le filet de sécurité en profondeur — même un admin
ne doit pas pouvoir supprimer définitivement une fiche sans d'abord
l'archiver.

**Pré-requis** : compte admin, une fiche **non** archivée.

**Étapes** :
1. En tant qu'admin, ouvrir une fiche dont le statut n'est pas "Archivé".

**Résultat attendu** : aucun bouton "Supprimer définitivement" n'est
visible, seulement "Archiver" — il faut archiver d'abord (TC-22) avant que
l'option de suppression définitive n'apparaisse (TC-44).

## TC-24 — Accéder à une fiche qui n'existe plus/pas

**Objectif** : vérifier le comportement quand on tape une URL de fiche
invalide ou déjà supprimée.

**Étapes** :
1. Taper dans le navigateur une URL du type `/clients/xxxxx` avec un
   identifiant qui n'existe pas.

**Résultat attendu** : pas de page blanche ni de plantage — un message ou
un comportement clair indique que la fiche est introuvable.
