'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline'

interface Option {
  value: string
  label: string
  icon?: string
  color?: string
}

interface CustomSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  icon?: React.ComponentType<{ className?: string }>
  className?: string
  disabled?: boolean
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Sélectionner...',
  icon: Icon,
  className = '',
  disabled = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(option => option.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <motion.button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-4 py-3 
          bg-dark-800/50 border border-dark-600 rounded-xl
          text-white placeholder-dark-400
          hover:border-primary-500/50 hover:bg-dark-700/50
          focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : ''}
        `}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      >
        <div className="flex items-center space-x-3">
          {Icon && <Icon className="w-5 h-5 text-dark-400 flex-shrink-0" />}
          <span className={`truncate ${selectedOption ? 'text-white' : 'text-dark-400'}`}>
            {selectedOption ? (
              <div className="flex items-center space-x-2">
                {selectedOption.icon && <span className="text-sm">{selectedOption.icon}</span>}
                <span>{selectedOption.label}</span>
              </div>
            ) : (
              placeholder
            )}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="w-5 h-5 text-dark-400 flex-shrink-0" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute z-[9999] mt-2 w-full
              bg-dark-800/95 backdrop-blur-xl border border-dark-600
              rounded-xl shadow-2xl overflow-hidden
              ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}
            `}
          >
            <div className="py-2 max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.15 }}
                  className={`
                    w-full flex items-center justify-between px-4 py-3
                    text-left hover:bg-dark-700/50 transition-all duration-150
                    ${option.value === value ? 'bg-primary-500/20 text-primary-300' : 'text-white'}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    {option.icon && (
                      <span className="text-sm flex-shrink-0">{option.icon}</span>
                    )}
                    <span className="truncate">{option.label}</span>
                    {option.color && (
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: option.color }}
                      />
                    )}
                  </div>
                  {option.value === value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      <CheckIcon className="w-4 h-4 text-primary-400" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Composant pour le scrollbar custom
const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(30, 41, 59, 0.3);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.5);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.7);
  }
`

// Injection des styles dans le document
if (typeof window !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = customScrollbarStyles
  if (!document.head.querySelector('style[data-custom-scrollbar]')) {
    styleElement.setAttribute('data-custom-scrollbar', 'true')
    document.head.appendChild(styleElement)
  }
}