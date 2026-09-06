# ============================================================
# PebissOa - Dockerfile adapté
# ============================================================
# Changements vs version originale (topmuch/pebiss) :
#   - Plus de `git clone` au build : utilise le contexte local (COPY . .)
#   - Les 105 images de production sont embarquées (/app/.bundled-uploads)
#     et copiées vers le volume /app/uploads au premier démarrage
#   - Seed des données de production via scripts/init-production.cjs
#     (43 entreprises, 31 catégories, 6 publicités, photos, produits...)
# ============================================================
FROM node:20-alpine

# Install required packages
RUN apk add --no-cache git libc6-compat sqlite
RUN npm install -g bun

WORKDIR /app

# Copie du code local (au lieu de cloner l'ancien repo)
COPY . .

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

# Images de production embarquées dans l'image
# (copiées vers /app/uploads au démarrage par copy-bundled-uploads.cjs)
RUN mkdir -p /app/.bundled-uploads && cp -r uploads/. /app/.bundled-uploads/

# Create persistent directories
RUN mkdir -p /app/data /app/uploads

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

CMD sh -c "mkdir -p /app/data /app/uploads \
  && export DATABASE_URL=\"${DATABASE_URL:-file:/app/data/pebiss.db}\" \
  && export UPLOADS_DIR=\"${UPLOADS_DIR:-/app/uploads}\" \
  && node scripts/copy-bundled-uploads.cjs \
  && npx prisma db push --skip-generate \
  && node scripts/init-production.cjs \
  && exec node .next/standalone/server.js"
