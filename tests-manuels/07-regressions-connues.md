# Régressions connues à ne jamais laisser revenir

Ce fichier documente des bugs réels déjà rencontrés et corrigés pendant le
développement. Ce sont les cas de test les plus importants à revérifier à
chaque promotion : ce sont des erreurs qui sont *déjà* arrivées une fois,
donc les plus susceptibles de revenir avec un futur changement de code.

## TC-38 — Création d'un client avec des tags ne doit pas faire planter le serveur

**Contexte du bug** : la colonne `tags` en base est un tableau de texte.
Une requête d'insertion mal écrite (`COALESCE` sans indication de type)
faisait planter **tout le processus serveur** (pas juste retourner une
erreur au client) dès qu'un client était créé avec des tags — ce qui
coupait l'accès à l'application pour tout le monde jusqu'au redémarrage.
Corrigé dans `backend/src/routes/clients.js`.

**Étapes** :
1. Créer un client avec au moins un tag renseigné.
2. Immédiatement après, recharger la liste des clients ou se reconnecter.

**Résultat attendu** : la création réussit, et l'application répond
normalement juste après (preuve que le serveur n'a pas planté).

## TC-39 — "Rencontré via" laissé sur "Non renseigné" ne doit pas bloquer l'enregistrement

**Contexte du bug** : la colonne `source` en base n'accepte que 4 valeurs
précises (salon/instagram/mailing/autre) ou rien du tout (`NULL`). Le
formulaire envoie une chaîne vide quand "Non renseigné" est sélectionné, ce
qui aurait dû être rejeté par la base de données si le backend ne l'avait
pas explicitement converti en `NULL`. Corrigé dans
`backend/src/routes/clients.js` (création et modification).

**Étapes** :
1. Créer un client sans toucher au champ "Rencontré via" (reste sur "Non
   renseigné").
2. Modifier ensuite ce même client (n'importe quel autre champ), en
   laissant toujours "Non renseigné".

**Résultat attendu** : la création et la modification réussissent toutes
les deux sans erreur.

## Point de vigilance non couvert par un test automatisable

**Le serveur backend n'a pas de filet de sécurité générique contre les
erreurs inattendues.** À part le cas des tags (corrigé ci-dessus), toute
autre erreur de base de données imprévue dans une route (`auth.js`, ou les
routes `update`/`delete`/`interactions` de `clients.js`) fait encore
planter tout le processus, pas seulement la requête en cours — ce qui
coupe l'accès à tous les utilisateurs jusqu'au redémarrage automatique
(`pm2` redémarre en quelques secondes en préprod/prod, mais pas en dev).
Il n'y a pas de test manuel simple pour ça ; c'est un chantier à part
(ajouter une gestion d'erreur générale dans le backend) plutôt qu'un cas de
test de non-régression.
