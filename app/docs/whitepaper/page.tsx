'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Contenu du whitepaper directement intégré
const whitepaperContent = `# Livre Blanc - Capsule Network
## Révolutionner le Stockage de Données Temporelles avec la Blockchain

---

### Table des Matières

1. [Résumé Exécutif](#résumé-exécutif)
2. [Contexte et Problématique](#contexte-et-problématique)
3. [Vision et Mission](#vision-et-mission)
4. [Architecture Technique](#architecture-technique)
5. [Token TimeLoke (MTQ)](#token-timeloke-mtq)
6. [Sécurité et Cryptographie](#sécurité-et-cryptographie)
7. [Types de Capsules](#types-de-capsules)
8. [Écosystème et Cas d'Usage](#écosystème-et-cas-dusage)
9. [Gouvernance et Consensus](#gouvernance-et-consensus)
10. [Roadmap et Développement](#roadmap-et-développement)
11. [Économie du Token](#économie-du-token)
12. [Conclusion](#conclusion)

---

## Résumé Exécutif

**Capsule Network** est une blockchain révolutionnaire construite sur le framework Cosmos SDK qui introduit le concept de **capsules temporelles numériques**. Notre plateforme permet aux utilisateurs de stocker, chiffrer et programmer l'ouverture de données sensibles selon des conditions temporelles ou conditionnelles spécifiques.

### Points Clés :
- **Blockchain Cosmos** : Utilise Cosmos SDK et CometBFT pour une sécurité et performance optimales
- **Token natif MTQ** : TimeLoke (MTQ) propulse l'écosystème avec des mécanismes de staking et de gouvernance
- **Chiffrement militaire** : AES-256-GCM avec Shamir Secret Sharing pour une sécurité inégalée
- **Stockage hybride** : Blockchain pour les petits fichiers, IPFS pour les gros volumes
- **5 Types de capsules** : Solutions adaptées à tous les besoins de stockage temporel
- **Interface moderne** : Application web Next.js avec intégration wallet native

### Proposition de Valeur Unique :
Capsule Network résout le problème fondamental du stockage de données sensibles avec déclenchement temporel en combinant la sécurité de la blockchain, le chiffrement avancé et des mécanismes d'ouverture programmable.

---

## Contexte et Problématique

Dans l'ère numérique, nous faisons face à plusieurs défis critiques liés au stockage sécurisé de données temporelles. Cette section explore les besoins non satisfaits et les limitations des solutions existantes.

---

## Architecture Technique

Capsule Network s'appuie sur une architecture blockchain moderne utilisant Cosmos SDK, avec des composants spécialisés pour le chiffrement et le stockage temporel.

---

## Token TimeLoke MTQ

Le token MTQ est au cœur de l'écosystème Capsule Network, servant à la fois de moyen de paiement, de mécanisme de gouvernance et d'incitation économique.

---

## Sécurité et Cryptographie

Notre approche de sécurité combine des algorithmes de chiffrement de niveau militaire avec des mécanismes de distribution de clés innovants.

---

## Types de Capsules

Capsule Network propose 5 types de capsules pour répondre à tous les besoins :

1. **Coffre-Fort (SAFE)** 🔐 - Accès immédiat pour le propriétaire
2. **Verrouillage Temporel (TIME_LOCK)** ⏰ - Ouverture programmée dans le temps
3. **Conditionnel (CONDITIONAL)** 🎯 - Déclenchement basé sur des conditions externes
4. **Multi-Signatures (MULTI_SIG)** 👥 - Approbation de plusieurs parties requise
5. **Dead Man's Switch (DEAD_MANS_SWITCH)** 💀 - Ouverture automatique en cas d'inactivité

---

## Conclusion

Capsule Network représente l'avenir du stockage sécurisé décentralisé, combinant innovation technologique et besoins réels du marché pour créer une solution unique et transformatrice.

---

*© 2025 Capsule Network. Tous droits réservés.*`

export default function WhitepaperPage() {
  const content = whitepaperContent

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/docs"
            className="inline-flex items-center text-primary-400 hover:text-primary-300 transition-colors duration-200 mb-6"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Retour à la documentation
          </Link>
          
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mr-4">
              <DocumentTextIcon className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                Livre Blanc
                <span className="text-primary-400 ml-3">Capsule Network</span>
              </h1>
              <p className="text-dark-300 mt-2">
                Révolutionner le Stockage de Données Temporelles avec la Blockchain
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm border border-dark-600 rounded-3xl p-8 md:p-12"
        >
          <div className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => {
                  const id = String(children).toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/^-+|-+$/g, '')
                  return (
                    <h1 id={id} className="text-4xl font-bold text-white mb-6 border-b border-dark-600 pb-4">
                      {children}
                    </h1>
                  )
                },
                h2: ({ children }) => {
                  const id = String(children).toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/^-+|-+$/g, '')
                  return (
                    <h2 id={id} className="text-3xl font-bold text-white mt-12 mb-6">
                      {children}
                    </h2>
                  )
                },
                h3: ({ children }) => {
                  const id = String(children).toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/^-+|-+$/g, '')
                  return (
                    <h3 id={id} className="text-2xl font-semibold text-primary-300 mt-8 mb-4">
                      {children}
                    </h3>
                  )
                },
                h4: ({ children }) => {
                  const id = String(children).toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/^-+|-+$/g, '')
                  return (
                    <h4 id={id} className="text-xl font-semibold text-white mt-6 mb-3">
                      {children}
                    </h4>
                  )
                },
                p: ({ children }) => (
                  <p className="text-dark-200 leading-relaxed mb-4">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="text-dark-200 space-y-2 mb-6">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="text-dark-200 space-y-2 mb-6 list-decimal list-inside">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">•</span>
                    <span>{children}</span>
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary-500 bg-dark-800/30 p-4 rounded-r-lg mb-6">
                    {children}
                  </blockquote>
                ),
                code: ({ inline, children }) => {
                  if (inline) {
                    return (
                      <code className="bg-dark-700 text-primary-300 px-2 py-1 rounded text-sm">
                        {children}
                      </code>
                    )
                  }
                  return (
                    <pre className="bg-dark-800 border border-dark-600 rounded-lg p-4 overflow-x-auto mb-6">
                      <code className="text-green-400 text-sm">
                        {children}
                      </code>
                    </pre>
                  )
                },
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full border-collapse border border-dark-600">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-dark-600 bg-dark-800 px-4 py-2 text-left text-white font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-dark-600 px-4 py-2 text-dark-200">
                    {children}
                  </td>
                ),
                a: ({ href, children }) => {
                  // Si c'est un lien vers une ancre dans la page
                  if (href?.startsWith('#')) {
                    return (
                      <a
                        href={href}
                        className="text-primary-400 hover:text-primary-300 underline transition-colors duration-200"
                        onClick={(e) => {
                          e.preventDefault()
                          const id = href.slice(1)
                          const element = document.getElementById(id)
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }
                        }}
                      >
                        {children}
                      </a>
                    )
                  }
                  return (
                    <a
                      href={href}
                      className="text-primary-400 hover:text-primary-300 underline transition-colors duration-200"
                      target={href?.startsWith('http') ? '_blank' : undefined}
                      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {children}
                    </a>
                  )
                },
                strong: ({ children }) => (
                  <strong className="text-white font-semibold">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="text-primary-300 italic">
                    {children}
                  </em>
                ),
                hr: () => (
                  <hr className="border-dark-600 my-8" />
                )
              }}
            >
              {content || 'Erreur lors du chargement du contenu'}
            </ReactMarkdown>
          </div>
        </motion.div>

        {/* Navigation Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            href="/docs"
            className="inline-flex items-center px-6 py-3 bg-dark-800/50 border border-dark-600 text-white rounded-xl hover:border-primary-500/50 hover:bg-dark-700/50 transition-all duration-300"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Retour à la documentation
          </Link>
        </motion.div>
      </div>
    </div>
  )
}