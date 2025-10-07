# Configuration Dokploy - Capsule Network Interface

## Variables d'environnement requises

Configurez ces variables dans l'interface Dokploy (section **Environment Variables**) :

### Configuration Blockchain (REQUIS)
```env
NEXT_PUBLIC_CHAIN_ID=capsule-testnet-1
NEXT_PUBLIC_RPC_ENDPOINT=https://votre-rpc-endpoint.com
NEXT_PUBLIC_REST_ENDPOINT=https://votre-rest-endpoint.com
NEXT_PUBLIC_ADDRESS_PREFIX=cosmos
NEXT_PUBLIC_DENOM=ucaps
NEXT_PUBLIC_GAS_PRICE=0.025ucaps
```

### Configuration Production
```env
NEXT_PUBLIC_DEVELOPMENT_MODE=false
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Configuration IPFS (optionnel)
```env
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.ipfs.io
NEXT_PUBLIC_IPFS_API=https://votre-ipfs-api.com
```

### Configuration Analytics (optionnel)
```env
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
```

## Configuration Dokploy

### Port Mapping
- **Container Port**: 3003
- **External Port**: Votre choix (ex: 80, 443, 3003)

### Ressources recommandées
- **Memory Limit**: 2GB minimum (4GB recommandé)
- **CPU Limit**: 1-2 cores
- **Build Memory**: 2GB minimum

### Health Check
Le healthcheck est configuré automatiquement dans le Dockerfile :
- Interval: 30s
- Timeout: 10s
- Start Period: 40s
- Retries: 3

### Volumes (optionnel)
Si vous souhaitez persister des données :
```
/app/.next/cache -> pour cache Next.js
```

## Déploiement

1. **Clonez le repo** : `github.com/giovanny972/Interface-Blockchaine.git`
2. **Branch** : `main`
3. **Build Type** : Dockerfile
4. **Dockerfile Path** : `./Dockerfile`
5. **Port** : 3003
6. **Variables d'environnement** : Ajoutez celles ci-dessus

## Troubleshooting

### Build timeout
Si le build prend plus de 10 minutes :
- Vérifiez les ressources allouées au builder
- Augmentez la mémoire disponible dans Dokploy
- Vérifiez les logs Docker

### Application ne démarre pas
- Vérifiez que le port 3003 n'est pas déjà utilisé
- Vérifiez les variables d'environnement blockchain (RPC, REST)
- Consultez les logs du container

### Container en erreur
- Le healthcheck échoue si l'app ne répond pas sur le port 3003
- Vérifiez que `HOSTNAME="0.0.0.0"` est bien configuré
- Vérifiez que Next.js s'est bien compilé en mode standalone

## Optimisations appliquées

✅ Mode standalone Next.js (image ultra-légère ~150MB)
✅ Build limité à 2GB de RAM
✅ Timeout de 10 minutes pour éviter les builds infinis
✅ SWC Minifier pour compilation ultra-rapide
✅ Split chunks optimisé
✅ Healthcheck automatique
✅ Utilisateur non-root (nextjs:nodejs)
✅ Production only (pas de mode dev)

## Support

Pour toute question ou problème :
- GitHub Issues: https://github.com/giovanny972/Interface-Blockchaine/issues
- Documentation Next.js: https://nextjs.org/docs
- Documentation Dokploy: https://docs.dokploy.com
