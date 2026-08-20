# Tests manuels de non-régression — Vertlago Back-office

Ce dossier liste tous les scénarios à vérifier manuellement avant de
considérer une version prête à être promue (dev → préprod → prod). Chaque
fichier couvre une zone fonctionnelle et regroupe plusieurs cas de test
numérotés (TC-01, TC-02, ...), décrits en langage courant — pas besoin de
connaissances techniques pour les exécuter.

## Sommaire

| Fichier | Zone couverte |
|---|---|
| [01-authentification.md](01-authentification.md) | Connexion, déconnexion, accès protégé |
| [02-liste-clients.md](02-liste-clients.md) | Recherche, filtre, affichage de la liste |
| [03-creation-fiche-client.md](03-creation-fiche-client.md) | Création d'une fiche client et validations |
| [04-modification-suppression-client.md](04-modification-suppression-client.md) | Modification et suppression d'une fiche |
| [05-journal-interactions.md](05-journal-interactions.md) | Ajout, modification, suppression d'interactions |
| [06-affichage-mobile.md](06-affichage-mobile.md) | Utilisation sur iPhone / petit écran |
| [07-regressions-connues.md](07-regressions-connues.md) | Bugs déjà rencontrés et corrigés — à ne jamais laisser revenir |

## Comment utiliser ce dossier

- **Avant chaque promotion** (`./scripts/promote-to-preprod.sh`, puis plus
  tard vers la production), reparcourir l'ensemble des cas de test sur
  l'environnement source.
- Chaque cas de test suit le même format :
  - **Objectif** : ce qu'on vérifie et pourquoi.
  - **Pré-requis** : état de départ nécessaire.
  - **Étapes** : actions à effectuer, dans l'ordre.
  - **Résultat attendu** : ce qui doit se passer si tout va bien.
- Un cas de test qui échoue = ne pas promouvoir tant que ce n'est pas
  corrigé et revérifié.
- Ce ne sont pas des tests automatisés (pas de script à lancer) — ce sont
  des scénarios à dérouler soi-même dans le navigateur, ou à faire dérouler
  par Claude.
