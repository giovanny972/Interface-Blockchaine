'use client'

import { useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

interface AnimatedCounterProps {
  end: number
  duration?: number
  delay?: number
  suffix?: string
  prefix?: string
  decimals?: number
  className?: string
}

export function AnimatedCounter({
  end,
  duration = 2000,
  delay = 0,
  suffix = '',
  prefix = '',
  decimals = 0,
  className = ''
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      let startTime: number
      let animationFrame: number

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp

        const progress = Math.min((timestamp - startTime - delay) / duration, 1)
        
        if (progress >= 0) {
          const easeOutCubic = 1 - Math.pow(1 - progress, 3)
          const currentCount = end * easeOutCubic
          setCount(currentCount)
        }

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        }
      }

      animationFrame = requestAnimationFrame(animate)

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame)
        }
      }
    }
  }, [isInView, end, duration, delay])

  const formatNumber = (num: number) => {
    return num.toLocaleString('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : {}}
      transition={{ duration: 0.5, delay: delay / 1000 }}
    >
      {prefix}{formatNumber(count)}{suffix}
    </motion.span>
  )
}

interface TypewriterProps {
  text: string
  delay?: number
  speed?: number
  className?: string
  onComplete?: () => void
}

export function TypewriterEffect({
  text,
  delay = 0,
  speed = 50,
  className = '',
  onComplete
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    const timeout = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      } else if (onComplete) {
        onComplete()
      }
    }, currentIndex === 0 ? delay : speed)

    return () => clearTimeout(timeout)
  }, [currentIndex, text, delay, speed, isInView, onComplete])

  return (
    <span ref={ref} className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        className="inline-block w-0.5 h-[1em] bg-current ml-1"
      />
    </span>
  )
}

interface FloatingElementProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  distance?: number
  className?: string
}

export function FloatingElement({
  children,
  delay = 0,
  duration = 6,
  distance = 20,
  className = ''
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-distance, distance, -distance]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  )
}

interface GlowEffectProps {
  children: React.ReactNode
  color?: string
  intensity?: number
  className?: string
}

export function GlowEffect({
  children,
  color = '#0ea5e9',
  intensity = 1,
  className = ''
}: GlowEffectProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className={className}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={{
        boxShadow: isHovered
          ? `0 0 ${20 * intensity}px ${color}, 0 0 ${40 * intensity}px ${color}, 0 0 ${60 * intensity}px ${color}`
          : `0 0 ${5 * intensity}px ${color}50`
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

interface PulseProps {
  children: React.ReactNode
  color?: string
  size?: number
  duration?: number
  className?: string
}

export function PulseAnimation({
  children,
  color = '#0ea5e9',
  size = 1.1,
  duration = 2,
  className = ''
}: PulseProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      animate={{
        scale: [1, size, 1]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
      <motion.div
        className="absolute inset-0 rounded-full opacity-30"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, size + 0.2, 1],
          opacity: [0.3, 0, 0.3]
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </motion.div>
  )
}

interface MatrixRainProps {
  className?: string
  characters?: string
  fontSize?: number
  speed?: number
}

export function MatrixRain({
  className = '',
  characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  fontSize = 14,
  speed = 50
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const columns = Math.floor(canvas.width / fontSize)
    const drops: number[] = Array(columns).fill(0)

    const draw = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#0ea5e950'
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length))
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    const interval = setInterval(draw, speed)

    return () => clearInterval(interval)
  }, [characters, fontSize, speed])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
    />
  )
}

interface ScrollRevealProps {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
  duration?: number
  delay?: number
  className?: string
}

export function ScrollReveal({
  children,
  direction = 'up',
  distance = 50,
  duration = 0.6,
  delay = 0,
  className = ''
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const variants = {
    hidden: {
      opacity: 0,
      x: direction === 'left' ? -distance : direction === 'right' ? distance : 0,
      y: direction === 'up' ? distance : direction === 'down' ? -distance : 0
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0
    }
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  )
}