# PebissOa - Dockerfile for Coolify
FROM node:20-alpine

# Install required packages
RUN apk add --no-cache git libc6-compat sqlite
RUN npm install -g bun

WORKDIR /app

# Clone the repository
RUN git clone https://github.com/topmuch/pebissoa.git .

# Install dependencies
RUN bun install

# Generate Prisma Client
RUN npx prisma generate

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=file:/app/data/pebiss.db
RUN mkdir -p /app/data && npx prisma db push --skip-generate && bun run build

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
CMD sh -c "mkdir -p /app/data /app/uploads && export DATABASE_URL=file:/app/data/pebiss.db && export UPLOADS_DIR=/app/uploads && npx prisma db push --skip-generate 2>/dev/null || true && node scripts/init-production.cjs 2>/dev/null || true && exec node .next/standalone/server.js"
