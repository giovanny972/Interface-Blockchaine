# Dockerfile optimisé pour Capsule Network - Production Dokploy
# =================================================================
# Build ultra-performant avec cache npm et standalone Next.js

# Stage 1 - Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
# Cache npm pour accélérer les rebuilds
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts && \
    npm cache clean --force

# Stage 2 - Builder
FROM node:18-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Copier node_modules depuis deps (réutilisation)
COPY --from=deps /app/node_modules ./node_modules

# Copier tous les fichiers source
COPY . .

# Variables d'environnement pour le build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Build Next.js en mode standalone avec timeout
RUN timeout 600 npm run build || (echo "Build timeout or failed" && exit 1)

# Stage 3 - Runner (Production)
FROM node:18-alpine AS runner
WORKDIR /app

# Créer utilisateur non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copier UNIQUEMENT les fichiers nécessaires pour la production
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Variables d'environnement production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3003
ENV HOSTNAME="0.0.0.0"

EXPOSE 3003

USER nextjs

# Healthcheck pour vérifier que l'app répond
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Démarrage avec Node directement (plus léger que npm start)
CMD ["node", "server.js"]

# Metadata
LABEL maintainer="Capsule Network Team"
LABEL version="3.0.0"
LABEL description="Capsule Network - Production optimisée (Standalone + Cache npm)"
