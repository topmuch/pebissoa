# 🚀 Guide de déploiement — PebissOa (Coolify / Docker)

Deux façons de déployer. **La méthode A est recommandée.**

---

## Méthode A — Déployer depuis GitHub (recommandé ✅)

1. Dans Coolify : **+ New Resource → Docker Compose (ou Application)** → onglet **GitHub** → choisir le repo **`topmuch/pebissoa`** (branche `main`).
2. Coolify clone le repo complet (code + 105 images) et build le Dockerfile automatiquement.
3. Ajouter les **2 volumes persistants** (sinon les données/images seront perdues au redéploiement) :
   - `/app/data` → base SQLite
   - `/app/uploads` → images
4. Ajouter les **variables d'environnement** :

   | Variable | Valeur |
   |---|---|
   | `NEXTAUTH_SECRET` | un secret aléatoire (`openssl rand -base64 32`) |
   | `NEXTAUTH_URL` | `https://votre-domaine.com` |
   | `ADMIN_EMAIL` | votre email admin |
   | `ADMIN_PASSWORD` | votre mot de passe admin |

   (`DATABASE_URL` et `UPLOADS_DIR` ont déjà des valeurs par défaut correctes.)
5. Déployer. Au premier démarrage, le conteneur installe les images, la base (43 entreprises, 31 catégories, 6 pubs) et l'admin, puis démarre Next.js.

---

## Méthode B — Déployer depuis un zip (sans GitHub)

Utiliser **`pebissoa-complete.zip`** (projet complet, ~36 Mo — PAS le zip « docker seul »).

1. Dans Coolify : **+ New Resource → Docker Compose Empty** → onglet **Upload** → charger `pebissoa-complete.zip`.
2. Le contexte contient le code source : le Dockerfile l'utilise directement (aucun accès GitHub requis pendant le build).
3. Même config que la méthode A (volumes + variables d'environnement).

> ⚠️ **Ne pas déployer avec le zip « docker seul »** (`pebissoa-docker.zip`, ~50 Ko) : il ne contient pas le code source.
> Ce zip sert uniquement à faire un `docker compose up -d --build` sur un serveur qui a accès à GitHub —
> le Dockerfile clonera alors lui-même `https://github.com/topmuch/pebissoa`.

---

## 🐳 Docker en ligne de commande

```bash
# Avec le projet complet
unzip pebissoa-complete.zip -d pebissoa && cd pebissoa
docker compose up -d --build

# Ou avec le kit docker seul (clone GitHub automatiquement)
unzip pebissoa-docker.zip -d pebissoa && cd pebissoa
docker compose up -d --build
```

Application disponible sur http://localhost:3000

---

## 🔐 Après le déploiement

- Se connecter sur `/admin` avec `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- **Changer le mot de passe admin** et `NEXTAUTH_SECRET` en production
- Vérifier : accueil, annuaire (43 entreprises), détail entreprise, annonces, images

## ❓ Dépannage

| Problème | Cause / solution |
|---|---|
| `Bun could not find a package.json file to install from` | Contexte de build vide → déployer le **repo GitHub** ou **`pebissoa-complete.zip`**, pas un zip de config seule |
| Images manquantes | Vérifier le volume `/app/uploads` et les logs `copy-bundled-uploads` au 1er boot |
| Base vide | Le seed ne s'exécute que si `business.count() === 0` — supprimer le volume `/app/data` pour réinitialiser |
| Erreur 500 NextAuth | `NEXTAUTH_SECRET` absent ou `NEXTAUTH_URL` incorrect |
