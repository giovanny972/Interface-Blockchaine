import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface VirtualizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight?: number
  maxVisibleItems?: number
  className?: string
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight = 100,
  maxVisibleItems = 10,
  className = ''
}: VirtualizedListProps<T>) {
  
  // Calculer les éléments visibles
  const visibleItems = useMemo(() => {
    if (items.length <= maxVisibleItems) {
      return items
    }
    
    // Pour l'instant, on montre simplement les premiers éléments
    // Dans une vraie implémentation, on calculerait basé sur le scroll
    return items.slice(0, maxVisibleItems)
  }, [items, maxVisibleItems])

  const containerHeight = Math.min(items.length, maxVisibleItems) * itemHeight

  return (
    <div 
      className={`overflow-hidden ${className}`}
      style={{ height: containerHeight }}
    >
      <div className="space-y-4">
        {visibleItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.2,
              delay: index * 0.05,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            style={{ height: itemHeight }}
            className="flex-shrink-0"
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </div>
      
      {items.length > maxVisibleItems && (
        <div className="text-center py-4">
          <p className="text-sm text-dark-400">
            Affichage de {maxVisibleItems} sur {items.length} éléments
          </p>
        </div>
      )}
    </div>
  )
}

export default VirtualizedList