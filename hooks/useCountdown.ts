'use client'

import { useState, useEffect } from 'react'

export interface CountdownResult {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
  timeString: string
  shortTimeString: string
  percentage: number
}

interface UseCountdownOptions {
  onExpire?: () => void
  updateInterval?: number
  includeSeconds?: boolean
  createdAt?: Date
}

export function useCountdown(
  targetDate: Date | string | null,
  options: UseCountdownOptions = {}
): CountdownResult {
  const {
    onExpire,
    updateInterval = 1000,
    includeSeconds = true,
    createdAt
  } = options

  const [timeLeft, setTimeLeft] = useState<CountdownResult>(() => {
    if (!targetDate) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        timeString: 'Expiré',
        shortTimeString: 'Expiré',
        percentage: 100
      }
    }

    const target = new Date(targetDate)
    const now = new Date()
    const difference = target.getTime() - now.getTime()

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        timeString: 'Peut être débloquée maintenant',
        shortTimeString: 'Débloquable',
        percentage: 100
      }
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((difference % (1000 * 60)) / 1000)

    // Calculer le pourcentage basé sur la date de création réelle ou approximation
    const creationDate = createdAt || new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)) // Utiliser la vraie date ou approximation
    const totalDuration = target.getTime() - creationDate.getTime()
    const elapsed = now.getTime() - creationDate.getTime()
    const percentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))

    const timeString = formatTimeString(days, hours, minutes, seconds, includeSeconds)
    const shortTimeString = formatShortTimeString(days, hours, minutes, seconds)

    return {
      days,
      hours,
      minutes,
      seconds,
      isExpired: false,
      timeString,
      shortTimeString,
      percentage
    }
  })

  useEffect(() => {
    if (!targetDate) return

    const target = new Date(targetDate)
    
    const interval = setInterval(() => {
      const now = new Date()
      const difference = target.getTime() - now.getTime()

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          timeString: 'Peut être débloquée maintenant',
          shortTimeString: 'Débloquable',
          percentage: 100
        })
        
        if (onExpire) {
          onExpire()
        }
        
        clearInterval(interval)
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      // Calculer le pourcentage basé sur la date de création réelle ou approximation
      const creationDate = createdAt || new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
      const totalDuration = target.getTime() - creationDate.getTime()
      const elapsed = now.getTime() - creationDate.getTime()
      const percentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))

      const timeString = formatTimeString(days, hours, minutes, seconds, includeSeconds)
      const shortTimeString = formatShortTimeString(days, hours, minutes, seconds)

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
        timeString,
        shortTimeString,
        percentage
      })
    }, updateInterval)

    return () => clearInterval(interval)
  }, [targetDate, updateInterval, onExpire, includeSeconds, createdAt])

  return timeLeft
}

function formatTimeString(days: number, hours: number, minutes: number, seconds: number, includeSeconds: boolean): string {
  const parts: string[] = []
  
  if (days > 0) {
    parts.push(`${days} jour${days > 1 ? 's' : ''}`)
  }
  
  if (hours > 0 || days > 0) {
    parts.push(`${hours} heure${hours > 1 ? 's' : ''}`)
  }
  
  if (minutes > 0 || hours > 0 || days > 0) {
    parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`)
  }
  
  if (includeSeconds && (seconds > 0 || (days === 0 && hours === 0 && minutes === 0))) {
    parts.push(`${seconds} seconde${seconds > 1 ? 's' : ''}`)
  }
  
  if (parts.length === 0) {
    return includeSeconds ? '0 seconde' : '0 minute'
  }
  
  return parts.join(', ')
}

function formatShortTimeString(days: number, hours: number, minutes: number, seconds: number): string {
  if (days > 0) {
    return `${days}j ${hours}h`
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  
  return `${seconds}s`
}

// Hook utilitaire pour vérifier si une date est dans le futur
export function useIsFutureDate(date: Date | string | null): boolean {
  const [isFuture, setIsFuture] = useState(() => {
    if (!date) return false
    return new Date(date) > new Date()
  })

  useEffect(() => {
    if (!date) {
      setIsFuture(false)
      return
    }

    const checkDate = () => {
      setIsFuture(new Date(date) > new Date())
    }

    checkDate()
    const interval = setInterval(checkDate, 1000)
    return () => clearInterval(interval)
  }, [date])

  return isFuture
}