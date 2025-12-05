/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // output: 'standalone',
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  productionBrowserSourceMaps: false,
  optimizeFonts: true,

  // Optimisations des images pour performance
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Optimisations du compilateur
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production' ? { properties: ['^data-test'] } : false,
  },

  // Optimisations expérimentales
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['lucide-react', '@heroicons/react', 'framer-motion'],
  },
  webpack: (config, { isServer }) => {
    // Limiter l'utilisation mémoire
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        maxSize: 244000,
      },
    }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        path: require.resolve('path-browserify'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
        util: require.resolve('util'),
      }
    }
    return config
  },
}

module.exports = nextConfig