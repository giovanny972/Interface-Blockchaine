# Dockerfile multi-stage pour Capsule Network - Dokploy optimisé
# =======================================================

# Stage 1: Base avec Node.js
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Stage 3: Builder
FROM base AS builder
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copier les fichiers de configuration nécessaires pour le build
COPY tsconfig.json ./
COPY next.config.js ./
COPY postcss.config.js ./
COPY tailwind.config.js ./

# Copier tout le code source
COPY app ./app
COPY components ./components
COPY lib ./lib
COPY services ./services
COPY stores ./stores
COPY hooks ./hooks
COPY types ./types
COPY public ./public

# Copier le fichier .env.production s'il existe, sinon ignorer
COPY .env.production* ./ 2>/dev/null || true

# Désactiver la telemetry Next.js en production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build optimisé pour production
RUN npm run build

# Stage 4: Runner (Production)
FROM base AS runner
WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires depuis builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Copier les assets buildés avec les bonnes permissions
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# Variables d'environnement production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3003
ENV HOSTNAME="0.0.0.0"

# Exposer le port 3003 pour Dokploy
EXPOSE 3003

# Donner les permissions appropriées
RUN chown -R nextjs:nodejs /app && \
    chmod -R 755 /app

# Utiliser l'utilisateur non-root
USER nextjs

# Commande de démarrage
CMD ["npm", "start"]

# Metadata
LABEL maintainer="Capsule Network Team"
LABEL version="1.0.0"
LABEL description="Capsule Network - Interface Blockchain Production (Dokploy)"
