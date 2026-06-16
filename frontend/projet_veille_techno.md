# Projet de veille technologique — "Le Post-VMware : l'utilisation des alternatives de virtualisation"

## Contexte général
Projet scolaire de veille technologique réalisé en **équipe de trois**.
Le sujet : l'après-VMware (rachat par Broadcom, refonte du licensing, migrations en cours)
et le panorama des alternatives de virtualisation (Proxmox VE, Hyper-V, Nutanix,
XCP-ng/Citrix, KVM/OpenStack, etc.).

Le livrable est une petite application web 3 tiers qui collecte automatiquement des
articles sur le sujet, les analyse/score, les stocke, et les affiche.

## Mon rôle
Je suis **responsable de la partie FRONT-END uniquement**. Mes deux coéquipiers
s'occupent respectivement de l'ingester (collecte) et de la base de données + API.

## Architecture du projet (3 couches)
1. **Ingester / alimenteur** : script (Python ou Node) qui collecte des articles
   (flux RSS de blogs tech, etc.), les nettoie et les insère en base. Exécuté
   périodiquement via cron sur la VM. — *géré par un coéquipier.*
2. **Base de données** : stocke les articles (titre, source, date, lien, résumé,
   tags, score). SQLite ou PostgreSQL. — *géré par un coéquipier.*
3. **Front-end** : lit les données via une API et les affiche (liste, filtres,
   recherche, top articles). — **MA PARTIE.**

## Système d'analyse / scoring (SANS IA)
Le projet impose un système d'analyse des articles pour ne garder que les meilleurs,
**sans IA** (pas de LLM, pas de ML). Le scoring est **algorithmique et déterministe** :
- scoring par **mots-clés pondérés** (lexique du sujet : Broadcom, migration, VMware,
  Proxmox, licensing, hyperviseur…) ;
- **TF-IDF** (statistique classique non-IA) pour mesurer la pertinence réelle ;
- **fraîcheur** (article récent = meilleur score) ;
- **réputation de la source** (bonus pour sources officielles/réputées) ;
- filtres qualité : longueur minimale, déduplication, exclusion du contenu promotionnel.
- Score final = combinaison pondérée, ex : `0.5·pertinence + 0.3·fraîcheur + 0.2·source`.

Ce scoring vit **côté ingester/back-end**. Mon front se contente d'afficher,
trier et filtrer sur le champ `score`.

## Contrat API attendu (à confirmer avec l'équipe)
Pour chaque article, l'API doit exposer au minimum :
`id`, `titre`, `source`, `date`, `lien`, `resume`, `score` (et idéalement `is_top`
ou un rang, plus `tags`).

## Fonctionnalités front visées
- Vue "Top articles" (les mieux scorés)
- Tri par score / date / source
- Filtres par seuil de score ou par thème/tag
- Recherche
- Affichage visuel du score (badge, étoiles ou barre)

## Environnement de travail
- Tout le projet vit sur une **VM Linux distante hébergée sur un serveur Proxmox**.
- J'édite via **VS Code Remote-SSH** / Claude Code en SSH sur la VM.
- Le dev server front tourne sur la VM ; le port est forwardé vers le navigateur local.

## Stack front

## Conventions
- Travailler contre l'API (ou un mock JSON) pour ne pas être bloqué par l'équipe.
- Le "contrat" entre moi et le coéquipier base/API = le format JSON ci-dessus.
