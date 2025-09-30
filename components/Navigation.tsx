'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CubeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/stores/authStore';

export default function Navigation() {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/20 backdrop-blur-md border-b border-dark-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <CubeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gradient">Capsule Network</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="btn-primary whitespace-nowrap opacity-50">
                Chargement...
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/20 backdrop-blur-md border-b border-dark-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <CubeIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gradient">Capsule Network</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="#features" className="hidden md:block text-dark-300 hover:text-white transition-colors">
              Fonctionnalités
            </Link>
            <Link href="#capsule-types" className="hidden md:block text-dark-300 hover:text-white transition-colors">
              Types
            </Link>
            <Link href="#technology" className="hidden lg:block text-dark-300 hover:text-white transition-colors">
              Technologie
            </Link>
            <Link href="#tokenomics" className="hidden lg:block text-dark-300 hover:text-white transition-colors">
              Tokenomics
            </Link>
            <Link href="#roadmap" className="hidden md:block text-dark-300 hover:text-white transition-colors">
              Roadmap
            </Link>
            <Link href="/playground" className="hidden lg:block text-dark-300 hover:text-white transition-colors">
              Playground
            </Link>
            <Link href="/marketplace" className="hidden lg:block text-dark-300 hover:text-white transition-colors">
              Marketplace
            </Link>
            <Link href="#cyberlab" className="hidden xl:block text-dark-300 hover:text-white transition-colors">
              Cyberlab's
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn-primary whitespace-nowrap">
                Dashboard
              </Link>
            ) : (
              <Link href="/auth/connect" className="btn-primary whitespace-nowrap">
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}