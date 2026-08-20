# Authentification

## TC-01 — Connexion avec des identifiants valides

**Objectif** : vérifier qu'un employé peut se connecter avec son email et
son mot de passe.

**Pré-requis** : un compte existe en base (email + mot de passe connus).

**Étapes** :
1. Ouvrir la page d'accueil (`/`) — elle doit rediriger vers `/login` si on
   n'est pas connecté.
2. Saisir un email et un mot de passe valides.
3. Cliquer sur "Se connecter".

**Résultat attendu** : redirection automatique vers la liste des clients
(`/clients`), le nom et le rôle de l'utilisateur s'affichent en bas de la
barre latérale (ou en haut, sur mobile).

## TC-02 — Connexion refusée avec un mauvais mot de passe

**Objectif** : vérifier qu'un mauvais mot de passe ne permet pas de se
connecter, et qu'un message d'erreur clair s'affiche.

**Étapes** :
1. Sur la page de connexion, saisir un email valide et un mot de passe
   incorrect.
2. Cliquer sur "Se connecter".

**Résultat attendu** : un message d'erreur s'affiche sous le formulaire, on
reste sur la page de connexion, aucune information sur le compte n'est
révélée (le message ne doit pas dire si c'est l'email ou le mot de passe
qui est faux).

## TC-03 — Champs obligatoires du formulaire de connexion

**Objectif** : vérifier qu'on ne peut pas soumettre le formulaire de
connexion avec un champ vide.

**Étapes** :
1. Sur la page de connexion, laisser le champ email ou mot de passe vide.
2. Cliquer sur "Se connecter".

**Résultat attendu** : le navigateur bloque la soumission et signale le
champ manquant (pas d'appel réseau, pas de redirection).

## TC-04 — Déconnexion

**Objectif** : vérifier que le bouton de déconnexion fonctionne et protège
bien l'accès ensuite.

**Pré-requis** : être connecté.

**Étapes** :
1. Cliquer sur "Se déconnecter".
2. Essayer de revenir en arrière avec le bouton "précédent" du navigateur,
   ou de recharger une page comme `/clients`.

**Résultat attendu** : retour à la page de connexion ; impossible d'accéder
à nouveau à la liste des clients ou à une fiche sans se reconnecter.

## TC-05 — Accès direct à une page protégée sans être connecté

**Objectif** : vérifier qu'on ne peut pas contourner la connexion en tapant
une URL directement.

**Étapes** :
1. Sans être connecté (ou après déconnexion), taper directement dans le
   navigateur une URL comme `/clients` ou `/clients/new`.

**Résultat attendu** : redirection vers `/login`, aucune donnée client ne
doit s'afficher même brièvement.
