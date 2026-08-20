# Journal d'interactions

## TC-25 — Ajouter une interaction

**Objectif** : vérifier qu'on peut ajouter une note/appel/email/réunion au
journal d'un client.

**Pré-requis** : une fiche client existante.

**Étapes** :
1. Ouvrir la fiche, dans "Journal d'interactions" choisir un type (ex :
   "Appel") et écrire un contenu.
2. Cliquer sur "Ajouter".

**Résultat attendu** : l'interaction apparaît en haut du journal avec son
type, la date/heure du jour, et le contenu saisi. Le formulaire d'ajout se
vide après l'ajout.

## TC-26 — Interaction vide refusée

**Objectif** : vérifier qu'on ne peut pas ajouter une interaction sans
contenu.

**Étapes** :
1. Laisser le champ de texte vide (ou avec juste des espaces).
2. Cliquer sur "Ajouter".

**Résultat attendu** : rien ne se passe, aucune interaction vide n'est
créée.

## TC-27 — Les 4 types d'interaction

**Objectif** : vérifier que chaque type (Note, Appel, Email, Réunion) est
bien enregistré et affiché correctement.

**Étapes** :
1. Ajouter une interaction de chaque type sur la même fiche.

**Résultat attendu** : les 4 entrées apparaissent avec leur type respectif
affiché correctement, triées de la plus récente à la plus ancienne.

## TC-28 — Modifier une interaction existante

**Objectif** : vérifier qu'on peut corriger une interaction déjà
enregistrée (ex : faute de frappe).

**Pré-requis** : au moins une interaction existante.

**Étapes** :
1. Cliquer sur "Modifier" à côté d'une interaction.
2. Vérifier que le type et le contenu actuels sont pré-remplis.
3. Changer le contenu et/ou le type.
4. Cliquer sur "Enregistrer".

**Résultat attendu** : l'interaction affiche le nouveau contenu et le
nouveau type ; la date de création n'est pas modifiée.

## TC-29 — Annuler la modification d'une interaction

**Étapes** :
1. Cliquer sur "Modifier" sur une interaction.
2. Changer le texte.
3. Cliquer sur "Annuler".

**Résultat attendu** : l'interaction garde son contenu d'origine, rien
n'est enregistré.

## TC-30 — Supprimer une interaction

**Objectif** : vérifier qu'on peut supprimer une entrée du journal.

**Étapes** :
1. Cliquer sur "Supprimer" à côté d'une interaction.
2. Confirmer la boîte de dialogue.

**Résultat attendu** : l'interaction disparaît du journal ; si c'était la
seule, le message "Aucune interaction enregistrée." réapparaît.

## TC-31 — Annuler la suppression d'une interaction

**Étapes** :
1. Cliquer sur "Supprimer" sur une interaction.
2. Annuler la boîte de dialogue de confirmation.

**Résultat attendu** : l'interaction est toujours présente dans le journal.

## TC-32 — Le journal d'un client n'affecte pas celui d'un autre

**Objectif** : vérifier l'isolation entre fiches clients.

**Pré-requis** : deux clients différents, chacun avec au moins une
interaction.

**Étapes** :
1. Ajouter/modifier/supprimer une interaction sur le client A.
2. Ouvrir la fiche du client B.

**Résultat attendu** : le journal du client B est inchangé, aucune
interaction du client A n'apparaît chez B.
