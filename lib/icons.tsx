/**
 * Imports optimisés des icônes Heroicons
 * Tree-shaking friendly - importe uniquement les icônes utilisées
 * Suit le principe DRY (Don't Repeat Yourself)
 */

import React from 'react';

// Icons Outline (24px) - Import spécifique pour tree-shaking optimal
export {
  ArrowRightIcon,
  ClockIcon,
  DocumentIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  UserIcon,
  CogIcon,
  HomeIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  BellIcon,
  Squares2X2Icon,
  DocumentArrowDownIcon, // Remplace DownloadIcon qui n'existe plus
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  KeyIcon,
  GlobeAltIcon,
  CubeIcon,
  ServerIcon,
  CloudIcon,
  WifiIcon,
  SignalIcon,
  ChartPieIcon,
  UsersIcon,
  FolderIcon,
  ArchiveBoxIcon,
  CalendarIcon,
  ClipboardDocumentIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  WalletIcon,
  LinkIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
  PrinterIcon,
  DocumentDuplicateIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  Bars3Icon,
  XCircleIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/24/outline';

// Icons Solid (20px) - Pour les versions remplies
export {
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  InformationCircleIcon as InformationCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  LockClosedIcon as LockClosedIconSolid,
  UserIcon as UserIconSolid,
  HomeIcon as HomeIconSolid,
  BellIcon as BellIconSolid,
  CogIcon as CogIconSolid,
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid,
} from '@heroicons/react/20/solid';

/**
 * Types pour une utilisation TypeScript sécurisée
 */
export type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

/**
 * Map des icônes par catégorie pour une meilleure organisation
 */
export const iconCategories = {
  // Navigation
  navigation: {
    home: HomeIcon,
    user: UserIcon,
    settings: CogIcon,
    dashboard: Squares2X2Icon,
    menu: Bars3Icon,
  },
  
  // Actions
  actions: {
    add: PlusIcon,
    edit: PencilIcon,
    delete: TrashIcon,
    search: MagnifyingGlassIcon,
    download: DocumentArrowDownIcon,
    share: ShareIcon,
    copy: DocumentDuplicateIcon,
    print: PrinterIcon,
    link: LinkIcon,
  },
  
  // État et feedback
  status: {
    success: CheckCircleIcon,
    warning: ExclamationTriangleIcon,
    error: XCircleIcon,
    info: InformationCircleIcon,
    loading: ClockIcon,
  },
  
  // Sécurité et auth
  security: {
    lock: LockClosedIcon,
    shield: ShieldCheckIcon,
    key: KeyIcon,
    eye: EyeIcon,
    eyeSlash: EyeSlashIcon,
  },
  
  // Blockchain et crypto
  crypto: {
    wallet: WalletIcon,
    currency: CurrencyDollarIcon,
    banknotes: BanknotesIcon,
    cube: CubeIcon,
    server: ServerIcon,
  },
  
  // Données et documents
  data: {
    document: DocumentIcon,
    documentText: DocumentTextIcon,
    folder: FolderIcon,
    archive: ArchiveBoxIcon,
    clipboard: ClipboardDocumentIcon,
  },
  
  // Réseau et communication
  network: {
    globe: GlobeAltIcon,
    cloud: CloudIcon,
    wifi: WifiIcon,
    signal: SignalIcon,
    bell: BellIcon,
  },
  
  // Analytics et charts
  analytics: {
    chartBar: ChartBarIcon,
    chartPie: ChartPieIcon,
    users: UsersIcon,
    filter: FunnelIcon,
    adjustments: AdjustmentsHorizontalIcon,
  },
  
  // Temps et calendrier
  time: {
    clock: ClockIcon,
    calendar: CalendarIcon,
  },
  
  // Contrôles média
  media: {
    play: PlayIcon,
    pause: PauseIcon,
    stop: StopIcon,
    forward: ForwardIcon,
    backward: BackwardIcon,
    sound: SpeakerWaveIcon,
    soundOff: SpeakerXMarkIcon,
  },
  
  // Interface
  ui: {
    close: XMarkIcon,
    help: QuestionMarkCircleIcon,
    arrow: ArrowRightIcon,
  },
} as const;

/**
 * Helper function pour obtenir une icône par nom
 */
export const getIcon = (category: keyof typeof iconCategories, name: string): IconComponent | undefined => {
  return (iconCategories[category] as any)?.[name];
};

/**
 * Tailles d'icônes standardisées selon le design system
 */
export const iconSizes = {
  xs: 'w-3 h-3', // 12px
  sm: 'w-4 h-4', // 16px
  md: 'w-5 h-5', // 20px
  lg: 'w-6 h-6', // 24px
  xl: 'w-8 h-8', // 32px
  '2xl': 'w-10 h-10', // 40px
} as const;

/**
 * Classes CSS pour les couleurs d'icônes standardisées
 */
export const iconColors = {
  primary: 'text-blue-600 dark:text-blue-400',
  secondary: 'text-gray-600 dark:text-gray-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
  muted: 'text-gray-400 dark:text-gray-500',
} as const;

/**
 * Composant wrapper pour une utilisation cohérente des icônes
 */
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: IconComponent;
  size?: keyof typeof iconSizes;
  color?: keyof typeof iconColors;
  className?: string;
}

/**
 * Composant Icon réutilisable avec props standardisées
 */
export const Icon: React.FC<IconProps> = ({ 
  icon: IconComponent, 
  size = 'md', 
  color = 'secondary',
  className = '',
  ...props 
}) => {
  const sizeClass = iconSizes[size];
  const colorClass = iconColors[color];
  const combinedClassName = `${sizeClass} ${colorClass} ${className}`.trim();

  return <IconComponent className={combinedClassName} {...props} />;
};