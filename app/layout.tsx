import '../lib/globals.js'
import './globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import StarryBackground from '@/components/StarryBackground'
import dynamic from 'next/dynamic'

// Dynamic import for Keplr script to avoid SSR issues
const KeplrScript = dynamic(() => import('@/components/KeplrScript'), {
  ssr: false
})

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono',
  display: 'swap',
})

export const metadata = {
  title: 'Capsule Network - Votre Coffre-Fort Temporel sur Blockchain',
  description: 'Stockez, chiffrez et programmez la libération de vos données les plus précieuses avec Capsule Network. La première blockchain dédiée aux capsules temporelles sécurisées.',
  keywords: 'blockchain, capsule temporelle, cryptographie, stockage sécurisé, Cosmos SDK, IPFS, Web3',
  authors: [{ name: 'Capsule Network Team' }],
  openGraph: {
    title: 'Capsule Network - Blockchain de Capsules Temporelles',
    description: 'Révolutionnez la façon dont vous stockez et partagez vos données importantes avec la technologie blockchain.',
    url: 'https://capsule.network',
    siteName: 'Capsule Network',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Capsule Network - Blockchain Capsules Temporelles',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Capsule Network - Blockchain de Capsules Temporelles',
    description: 'Stockez et programmez vos données de manière sécurisée avec la technologie blockchain.',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0ea5e9" />

        {/* Preconnect pour optimiser les performances */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* Métadonnées pour PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="Capsule Network" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Capsule Network" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <QueryProvider>
            <AuthProvider>
              {/* Load Keplr wallet script */}
              <KeplrScript />
              <div className="min-h-screen relative">
                {/* Fond étoilé animé */}
                <StarryBackground starCount={400} enableShootingStars={true} />
                
                {/* Background animations supplémentaires */}
                <div className="fixed inset-0 z-10 pointer-events-none">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.02),transparent)] animate-pulse-slow" />
                  <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent,rgba(14,165,233,0.01),transparent)] opacity-30" />
                </div>
                
                {/* Contenu principal */}
                <div className="relative z-20">
                  {children}
                </div>
                
                {/* Toast notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    className: '',
                    style: {
                      background: '#1e293b',
                      color: '#f1f5f9',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      fontSize: '14px',
                      maxWidth: '400px',
                    },
                    success: {
                      iconTheme: {
                        primary: '#22c55e',
                        secondary: '#f1f5f9',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#f1f5f9',
                      },
                    },
                  }}
                />
              </div>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}