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

## TC-22 — Suppression d'une fiche

**Objectif** : vérifier que la suppression fonctionne et redirige
correctement.

**Pré-requis** : une fiche de test (pas une vraie fiche client).

**Étapes** :
1. Ouvrir la fiche, cliquer sur "Supprimer".
2. Confirmer la boîte de dialogue de confirmation.

**Résultat attendu** : redirection vers la liste des clients, la fiche
supprimée n'apparaît plus, et le compteur "X fiche(s)" est à jour.

## TC-23 — Annuler la suppression

**Objectif** : vérifier que la boîte de confirmation empêche bien une
suppression accidentelle.

**Étapes** :
1. Ouvrir une fiche, cliquer sur "Supprimer".
2. Annuler la boîte de dialogue de confirmation (au lieu de valider).

**Résultat attendu** : la fiche existe toujours, aucune suppression n'a eu
lieu.

## TC-24 — Accéder à une fiche qui n'existe plus/pas

**Objectif** : vérifier le comportement quand on tape une URL de fiche
invalide ou déjà supprimée.

**Étapes** :
1. Taper dans le navigateur une URL du type `/clients/xxxxx` avec un
   identifiant qui n'existe pas.

**Résultat attendu** : pas de page blanche ni de plantage — un message ou
un comportement clair indique que la fiche est introuvable.
