# ============================================================
# PebissOa - Dockerfile AUTONOME
# ============================================================
# Ce Dockerfile récupère le code source TOUT SEUL :
#   1) Si le contexte de build contient le code (package.json présent)
#      → il l'utilise directement (build local, plus rapide)
#   2) Sinon → il clone automatiquement le repo GitHub
#      https://github.com/topmuch/pebissoa (branche main)
#
# Vous pouvez donc le déployer dans Coolify SANS aucune config
# particulière : il télécharge lui-même le repo, les 105 images
# de production et les données réelles.
# ============================================================
FROM node:20-alpine

# Install required packages
RUN apk add --no-cache git libc6-compat sqlite
RUN npm install -g bun

WORKDIR /app

# ------------------------------------------------------------
# RÉCUPÉRATION DU CODE SOURCE (automatique)
# ------------------------------------------------------------
# ⚠️ On détecte un contexte COMPLET (next.config.ts + src/), pas
# juste package.json : une copie Docker partielle (Dockerfile +
# compose seulement) doit déclencher le clonage automatique.
COPY . /tmp/build-context
RUN if [ -f /tmp/build-context/next.config.ts ] && [ -d /tmp/build-context/src ]; then \
      echo "📦 Source : contexte de build local complet détecté"; \
      cp -a /tmp/build-context/. /app/; \
    else \
      echo "📦 Contexte partiel/vide → clonage de https://github.com/topmuch/pebissoa.git"; \
      git clone --depth 1 https://github.com/topmuch/pebissoa.git /tmp/repo \
        && cp -a /tmp/repo/. /app/ \
        && rm -rf /tmp/repo; \
    fi \
    && rm -rf /tmp/build-context /app/.git \
    && if [ ! -f /app/package.json ] || [ ! -d /app/src ]; then \
      echo "❌ ERREUR : impossible d'obtenir le code source (contexte vide + clone GitHub échoué)"; \
      exit 1; \
    fi \
    && echo "✅ Code source prêt : $(ls /app | head -5 | tr '\n' ' ')..."

# ------------------------------------------------------------
# INSTALLATION & BUILD
# ------------------------------------------------------------
# Install dependencies
RUN bun install

# Generate Prisma Client
RUN npx prisma generate

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
# DB temporaire de build (la vraie est montée en volume au runtime)
ENV DATABASE_URL=file:/app/data/pebiss.db
RUN mkdir -p /app/data && npx prisma db push --skip-generate && bun run build

# Copy static assets for standalone mode
RUN cp -r public .next/standalone/public
RUN cp -r .next/static .next/standalone/.next/static

# ------------------------------------------------------------
# IMAGES DE PRODUCTION EMBARQUÉES (105 images du repo)
# Copiées vers /app/uploads au démarrage par copy-bundled-uploads.cjs
# ------------------------------------------------------------
RUN mkdir -p /app/.bundled-uploads /app/uploads \
    && { cp -r uploads/. /app/.bundled-uploads/ 2>/dev/null || echo "⚠️ Dossier uploads absent — pas d'images embarquées"; } \
    && echo "🖼️  Images embarquées : $(ls /app/.bundled-uploads | wc -l) fichiers"

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ============================================================
# ⚠️  VOLUMES PERSISTANTS (Coolify / docker compose)  ⚠️
#
#   /app/data     ← Base SQLite
#   /app/uploads  ← Images uploadées (+ images de production au 1er boot)
#
# Ces volumes garantissent la persistance après redéploiement.
# ============================================================

# Forme exec (JSON) : gestion correcte des signaux d'arrêt
CMD ["sh", "-c", "mkdir -p /app/data /app/uploads && export DATABASE_URL=\"${DATABASE_URL:-file:/app/data/pebiss.db}\" && export UPLOADS_DIR=\"${UPLOADS_DIR:-/app/uploads}\" && node scripts/copy-bundled-uploads.cjs && npx prisma db push --skip-generate && node scripts/init-production.cjs && exec node .next/standalone/server.js"]
