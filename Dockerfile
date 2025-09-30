# Dockerfile multi-stage pour Capsule Network - Production optimisé
# =======================================================

# Stage 1: Base avec Node.js
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --only=production --ignore-scripts

# Stage 3: Builder
FROM base AS builder
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
COPY .env.production .env.local

# Désactiver la telemetry Next.js en production
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build optimisé pour production
RUN npm run build

# Stage 4: Runner (Production)
FROM base AS runner
WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires depuis builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copier les assets buildés
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Variables d'environnement production
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Exposer le port
EXPOSE 3000

# Utiliser l'utilisateur non-root
USER nextjs

# Commande de démarrage optimisée
CMD ["node", "server.js"]

# Metadata
LABEL maintainer="Capsule Network Team"
LABEL version="1.0.0"
LABEL description="Capsule Network - Interface Blockchain Production"