# CRM — Prospection Sites Web

Application de gestion de la prospection pour la création et vente de sites
web à des petites entreprises en Suisse. Notion reste la base de données ;
cette application sert d'interface (bureau et mobile) pour y travailler sans
ouvrir Notion directement.

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS**
- **Netlify** (hébergement + fonctions serveur via `@netlify/plugin-nextjs`)
- **API Notion** (fetch direct, version `2025-09-03`, API des « data sources »)
- **Netlify Identity** pour l'authentification (accès sur invitation uniquement)

Le jeton Notion (`NOTION_TOKEN`) n'est utilisé que côté serveur (fichiers
protégés par `import "server-only"`) et n'apparaît jamais dans le code envoyé
au navigateur.

## Mise en route (développement local)

```bash
npm install
cp .env.example .env   # puis remplir NOTION_TOKEN et NOTION_PARENT_PAGE_ID
npm run dev
```

## Déploiement sur Netlify — étapes complètes

1. **Connecter le dépôt** : Netlify → *Add new project* → *Import an existing
   project* → GitHub → sélectionner ce dépôt.
2. **Build settings** : détectés automatiquement grâce à `netlify.toml`
   (rien à changer).
3. **Variables d'environnement** (Project configuration → Environment
   variables) :
   - `NOTION_TOKEN` — le jeton secret de ton intégration interne Notion
   - `NOTION_PARENT_PAGE_ID` — l'ID de la page Notion vide sous laquelle la
     base sera créée (uniquement nécessaire pour l'étape 5 ci-dessous)
4. **Déployer** le site une première fois.
5. **Créer la base Notion** (une seule fois) :
   - Activer Netlify Identity (voir ci-dessous), t'inviter, te connecter
   - Aller dans **Paramètres** de l'app → bouton **« Créer la base Notion »**
   - Copier les deux valeurs affichées (`NOTION_DATABASE_ID` et
     `NOTION_DATA_SOURCE_ID`) dans les variables d'environnement Netlify
   - Redéployer

## Authentification (Netlify Identity)

L'app est protégée par une vraie authentification serveur : chaque appel API
vérifie le jeton auprès de Netlify (`/.netlify/identity/user`), jamais une
simple vérification côté navigateur.

Configuration (une seule fois, dans le tableau de bord Netlify) :

1. **Project configuration → Identity → Enable Identity**
2. **Registration preferences → Invite only** (important : empêche toute
   inscription publique)
3. **Identity → Services → Git Gateway → Enable Git Gateway**
4. **Identity → Invite users** → ton adresse e-mail
5. Ouvrir l'e-mail d'invitation reçu, définir un mot de passe

## Structure du projet

```
app/
  (app)/            pages protégées (dashboard, prospects, pipeline, …)
  api/               routes serveur (jamais exposées sans jeton valide)
  login/             page de connexion
components/          composants d'interface réutilisables
hooks/useProspects   chargement + création + mise à jour des prospects
lib/notionClient     appels bruts à l'API Notion (serveur uniquement)
lib/notionMapping    conversion Notion <-> types de l'app
lib/auth-server      vérification du jeton Netlify Identity côté serveur
lib/identity         contexte client (connexion, jeton, authFetch)
```

## Sécurité

- `NOTION_TOKEN` n'existe que côté serveur (jamais dans le bundle navigateur,
  jamais commité — voir `.gitignore` et `.env.example`).
- Chaque route API vérifie l'authentification avant tout accès à Notion.
- Aucune synchronisation n'est jamais affichée comme réussie si Notion a
  renvoyé une erreur ; en cas d'échec d'une mise à jour, l'état affiché est
  restauré à sa valeur précédente.
