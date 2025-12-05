/**
 * Utilitaires React pour éviter les problèmes de clés dupliquées
 * et améliorer les performances de rendu
 */

/**
 * Génère une clé unique pour les éléments de liste
 * @param prefix Préfixe pour identifier le type d'élément
 * @param id ID unique de l'élément (si disponible)
 * @param index Index dans la liste
 * @returns Clé unique pour React
 */
export function generateKey(prefix: string, id?: string | number, index?: number): string {
  if (id !== undefined) {
    return `${prefix}-${id}${index !== undefined ? `-${index}` : ''}`;
  }
  if (index !== undefined) {
    return `${prefix}-${index}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Génère des clés pour des éléments skeleton/loading
 * @param prefix Préfixe identifiant le composant
 * @param count Nombre d'éléments
 * @returns Array de clés uniques
 */
export function generateSkeletonKeys(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => 
    generateKey(`${prefix}-skeleton`, undefined, index)
  );
}

/**
 * Crée un générateur de clés pour un composant donné
 * @param componentName Nom du composant
 * @returns Fonction pour générer des clés
 */
export function createKeyGenerator(componentName: string) {
  return {
    /**
     * Clé pour un élément avec ID
     */
    item: (id: string | number, index?: number) => 
      generateKey(`${componentName}-item`, id, index),
    
    /**
     * Clé pour un skeleton/placeholder
     */
    skeleton: (index: number) => 
      generateKey(`${componentName}-skeleton`, undefined, index),
    
    /**
     * Clé pour un élément de section
     */
    section: (name: string, index?: number) => 
      generateKey(`${componentName}-section-${name}`, undefined, index),
    
    /**
     * Clé générique
     */
    generic: (suffix: string, index?: number) => 
      generateKey(`${componentName}-${suffix}`, undefined, index),
  };
}

/**
 * Hook pour générer des clés uniques dans un composant
 * @param componentName Nom du composant
 * @returns Générateur de clés
 */
export function useKeyGenerator(componentName: string) {
  return createKeyGenerator(componentName);
}

/**
 * Utilitaire pour mapper des éléments avec des clés sécurisées
 * @param items Liste d'éléments à mapper
 * @param prefix Préfixe pour les clés
 * @param renderFn Fonction de rendu pour chaque élément
 * @returns Array d'éléments React avec clés uniques
 */
export function mapWithKeys<T, R>(
  items: T[],
  prefix: string,
  renderFn: (item: T, index: number) => R,
  getItemId?: (item: T) => string | number
): Array<{ key: string; element: R }> {
  return items.map((item, index) => {
    const id = getItemId?.(item);
    const key = generateKey(prefix, id, index);
    return {
      key,
      element: renderFn(item, index)
    };
  });
}

/**
 * Génère des éléments skeleton avec des clés uniques
 * @param count Nombre d'éléments
 * @param prefix Préfixe pour les clés
 * @param renderFn Fonction de rendu pour chaque élément
 * @returns Array d'éléments skeleton avec clés uniques
 */
export function generateSkeletonElements<R>(
  count: number,
  prefix: string,
  renderFn: (index: number) => R
): Array<{ key: string; element: R }> {
  return Array.from({ length: count }, (_, index) => ({
    key: generateKey(`${prefix}-skeleton`, undefined, index),
    element: renderFn(index)
  }));
}

/**
 * Validation des clés pour le développement
 * Utile pour détecter les clés dupliquées en mode dev
 */
export function validateKeys(keys: string[], componentName?: string): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  
  keys.forEach(key => {
    if (seen.has(key)) {
      duplicates.add(key);
    } else {
      seen.add(key);
    }
  });
  
  if (duplicates.size > 0) {
    const message = componentName 
      ? `Clés dupliquées détectées dans ${componentName}: ${Array.from(duplicates).join(', ')}`
      : `Clés dupliquées détectées: ${Array.from(duplicates).join(', ')}`;
    
    console.warn(message);
  }
}

/**
 * Types utiles pour les composants avec listes
 */
export interface KeyedElement<T> {
  key: string;
  data: T;
  index: number;
}

export interface ListRenderProps<T> {
  items: T[];
  isLoading?: boolean;
  skeletonCount?: number;
  keyPrefix: string;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderSkeleton?: (index: number) => React.ReactNode;
  getItemId?: (item: T) => string | number;
}

/**
 * Composant générique pour rendre des listes avec clés sécurisées
 */
export function renderListWithKeys<T>({
  items,
  isLoading = false,
  skeletonCount = 3,
  keyPrefix,
  renderItem,
  renderSkeleton,
  getItemId
}: ListRenderProps<T>): React.ReactNode[] {
  if (isLoading && renderSkeleton) {
    return generateSkeletonElements(skeletonCount, keyPrefix, renderSkeleton)
      .map(({ key, element }) => (
        <React.Fragment key={key}>
          {element}
        </React.Fragment>
      ));
  }
  
  return mapWithKeys(items, keyPrefix, renderItem, getItemId)
    .map(({ key, element }) => (
      <React.Fragment key={key}>
        {element}
      </React.Fragment>
    ));
}

/**
 * Constantes pour les préfixes de clés couramment utilisés
 */
export const KEY_PREFIXES = {
  CAPSULE: 'capsule',
  USER: 'user',
  STAT: 'stat',
  ACTIVITY: 'activity',
  NETWORK: 'network',
  SKELETON: 'skeleton',
  NOTIFICATION: 'notification',
  MODAL: 'modal',
  TAB: 'tab',
  FORM: 'form',
  LIST_ITEM: 'list-item',
} as const;

/**
 * Exemple d'utilisation dans un composant :
 * 
 * ```tsx
 * import { useKeyGenerator, KEY_PREFIXES } from '@/lib/react-utils';
 * 
 * function MyComponent() {
 *   const keys = useKeyGenerator('dashboard');
 *   
 *   return (
 *     <div>
 *       {isLoading 
 *         ? Array.from({ length: 3 }, (_, i) => (
 *             <SkeletonCard key={keys.skeleton(i)} />
 *           ))
 *         : capsules.map((capsule, index) => (
 *             <CapsuleCard key={keys.item(capsule.id, index)} capsule={capsule} />
 *           ))
 *       }
 *     </div>
 *   );
 * }
 * ```
 */