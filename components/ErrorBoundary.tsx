'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-h-[200px] flex items-center justify-center p-6"
        >
          <div className="text-center max-w-md">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
            </motion.div>
            
            <h3 className="text-lg font-semibold text-white mb-2">
              Oops ! Une erreur s'est produite
            </h3>
            
            <p className="text-dark-400 text-sm mb-6">
              Ne vous inquiétez pas, cela arrive parfois. Essayez de recharger cette section.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-4 p-3 bg-dark-800 rounded-lg">
                <summary className="text-red-400 cursor-pointer mb-2">
                  Détails de l'erreur (dev)
                </summary>
                <pre className="text-xs text-dark-300 overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack && `\n${this.state.error.stack}`}
                </pre>
              </details>
            )}
            
            <button
              onClick={this.handleReset}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Réessayer
            </button>
          </div>
        </motion.div>
      )
    }

    return this.props.children
  }
}

// Wrapper simple pour les erreurs de composants
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default ErrorBoundary