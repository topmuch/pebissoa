# PebissOa - Dockerfile for Coolify
FROM node:20-alpine

# Install required packages
# openssl : requis par les query engines Prisma sur alpine (musl)
RUN apk add --no-cache git libc6-compat sqlite openssl
RUN npm install -g bun

WORKDIR /app

# CACHE-BUST : re-télécharge ce feed à chaque build (son contenu change à chaque
# nouveau commit) → invalide le cache Docker de la couche git clone ci-dessous.
# SANS CELA, Docker réutilisait le clone du build précédent et l'application
# tournait sur du CODE OBSOLÈTE (bug du 17/09 : Redeploy avec bundled=null →
# 110 images manquantes).
# NB : on utilise le feed Atom github.com et PAS l'API api.github.com — celle-ci
# est rate-limitée (60 req/h/IP) et renvoyait "API rate limit exceeded" sur le VPS.
ADD https://github.com/topmuch/pebissoa/commits/main.atom /tmp/upstream-commit.atom

# Clone the repository into /tmp then move to /app (`git clone <repo> .` exige
# un dossier vide, or l'ADD du cache-bust a déjà déposé un fichier dans /tmp)
# Le log du commit permet de détecter un build obsolète dans les logs Coolify.
RUN git clone https://github.com/topmuch/pebissoa.git /tmp/repo && cp -a /tmp/repo/. /app/ && rm -rf /tmp/repo && echo "🔨 Build commit: $(git log -1 --format='%h %s')"

# Keep a pristine copy of the bundled production images OUTSIDE /app/uploads.
# When a persistent volume is mounted on /app/uploads (empty at first boot),
# scripts/copy-bundled-uploads.cjs fills the volume from this folder at startup
# (it never overwrites user uploads — only missing files are copied).
RUN mkdir -p /app/.bundled-uploads && cp -r uploads/. /app/.bundled-uploads/

# Install dependencies
RUN bun install

# Generate Prisma Client
RUN npx prisma generate

# Build the application
# - NODE_OPTIONS : plafonne le heap V8 pour éviter le "heap out of memory"
#   et forcer un GC plus agressif sur les petits serveurs
# - next build --webpack : le build Turbopack (défaut Next 16) a un pic mémoire
#   très élevé (~2 Go) qui tue le conteneur de build (OOM) sur les VPS limités.
#   Webpack consomme ~500 Mo de moins au pic (build ~20 s plus lent mais fiable).
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV DATABASE_URL=file:/app/data/pebiss.db
RUN mkdir -p /app/data && npx prisma db push --skip-generate && bun x next build --webpack && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/

# Copy static assets for standalone mode
RUN cp -r public .next/standalone/public && cp -r .next/static .next/standalone/.next/static

# Create data directory
RUN mkdir -p /app/data /app/uploads

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL=file:/app/data/pebiss.db
ENV UPLOADS_DIR=/app/uploads

# Start command - init db, images and start server
CMD sh -c "mkdir -p /app/data /app/uploads && export DATABASE_URL=file:/app/data/pebiss.db && export UPLOADS_DIR=/app/uploads && npx prisma db push --skip-generate 2>/dev/null || true && node scripts/copy-bundled-uploads.cjs || true && node scripts/init-production.cjs 2>/dev/null || true && exec node .next/standalone/server.js"
