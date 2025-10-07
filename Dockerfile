# Dockerfile optimisé pour Capsule Network - Production Dokploy
# =================================================================
# Build ultra-léger avec Next.js standalone pour économiser ressources serveur

# Stage 1: Dependencies (installation uniquement)
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force

# Stage 2: Builder (build de l'application)
FROM node:18-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Installer TOUTES les dépendances (dev inclus) pour le build
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copier les fichiers de configuration
COPY tsconfig.json next.config.js postcss.config.js tailwind.config.js ./

# Copier le code source
COPY app ./app
COPY components ./components
COPY lib ./lib
COPY services ./services
COPY stores ./stores
COPY hooks ./hooks
COPY types ./types
COPY public ./public

# Variables d'environnement pour le build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Limiter l'utilisation mémoire de Node pendant le build
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Build Next.js en mode standalone (génère un serveur ultra-léger)
# Timeout de 10 minutes max pour le build
RUN timeout 600 npm run build || (echo "Build timeout or failed" && exit 1)

# Stage 3: Runner (image finale de production - ULTRA LÉGÈRE)
FROM node:18-alpine AS runner
WORKDIR /app

# Créer utilisateur non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copier UNIQUEMENT les fichiers nécessaires pour la production
# Le mode standalone contient déjà tout ce qu'il faut
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
# Le fichier server.js est généré automatiquement par Next.js standalone
CMD ["node", "server.js"]

# Metadata
LABEL maintainer="Capsule Network Team"
LABEL version="2.0.0"
LABEL description="Capsule Network - Production optimisée (Standalone)"
