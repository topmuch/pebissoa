# PebissOa

Annuaire professionnel de Guinée-Bissau — clone de production de [pebiss.com](https://pebiss.com), basé sur [topmuch/pebiss](https://github.com/topmuch/pebiss), **avec les données et les images réelles de la production intégrées**.

## 🚀 Démarrage rapide (Docker)

```bash
docker compose up -d --build
```

L'application est disponible sur <http://localhost:3000>.

### Ce que fait le conteneur au premier démarrage

1. Copie les **105 images de production** embarquées dans l'image vers le volume `/app/uploads`
2. Applique le schéma Prisma (`prisma db push`)
3. Injecte les **données de production** : 43 entreprises, 31 catégories, 6 publicités, photos, produits, services, horaires et avis
4. Crée l'administrateur (voir variables d'environnement)
5. Démarre le serveur Next.js (mode standalone)

## 🐳 Déploiement Coolify

1. Créer un service depuis ce repo GitHub
2. Ajouter deux **volumes persistants** :
   - `/app/data` → base SQLite
   - `/app/uploads` → images
3. Renseigner les variables d'environnement (voir ci-dessous)

## ⚙️ Variables d'environnement

| Variable | Défaut | Description |
|---|---|---|
| `DATABASE_URL` | `file:/app/data/pebiss.db` | Base SQLite (volume) |
| `UPLOADS_DIR` | `/app/uploads` | Images (volume) |
| `NEXTAUTH_SECRET` | ⚠️ à changer | Secret NextAuth |
| `NEXTAUTH_URL` | `http://localhost:3000` | URL publique du site |
| `ADMIN_EMAIL` | `admin@pebiss.com` | Compte admin |
| `ADMIN_PASSWORD` | `Admin@123456` | Mot de passe admin |

## 🔑 Comptes par défaut

- **Admin** : `admin@pebiss.com` / `Admin@123456`
- **Comptes entreprise** (démo) : mot de passe `Pebiss@2024`

## 💻 Développement local (sans Docker)

```bash
bun install
cp .env.example .env          # puis ajuster DATABASE_URL / UPLOADS_DIR
bun run db:push
bun prisma/seed-production.ts # ou PEBISS_DATA_FILE=<chemin> bun prisma/seed-production.ts
bun run dev
```

## 📁 Structure

- `uploads/` — images de production (servies via `/api/uploads/*`)
- `prisma/production-data.json` — données de production (source du seed)
- `scripts/init-production.cjs` — initialisation au démarrage du conteneur
- `scripts/copy-bundled-uploads.cjs` — copie des images embarquées vers le volume

> ⚠️ Pensez à changer `NEXTAUTH_SECRET` et le mot de passe admin en production.
