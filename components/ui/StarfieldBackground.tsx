'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  twinkleSpeed: number
  twinkleOffset: number
}

interface StarfieldBackgroundProps {
  starCount?: number
  className?: string
}

export default function StarfieldBackground({ 
  starCount = 200, 
  className = '' 
}: StarfieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Fonction pour redimensionner le canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // Initialiser les étoiles
    const initStars = () => {
      starsRef.current = []
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.5 + 0.1,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2
        })
      }
    }

    // Animation des étoiles
    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      starsRef.current.forEach((star, index) => {
        // Mouvement vertical lent
        star.y += star.speed
        
        // Réapparaître en haut quand l'étoile sort par le bas
        if (star.y > canvas.height) {
          star.y = -5
          star.x = Math.random() * canvas.width
        }
        
        // Effet de scintillement
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset)
        const currentOpacity = star.opacity + (twinkle * 0.3)
        
        // Dessiner l'étoile
        ctx.save()
        ctx.globalAlpha = Math.max(0.1, currentOpacity)
        
        // Gradient radial pour un effet lumineux
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.size * 2
        )
        gradient.addColorStop(0, '#ffffff')
        gradient.addColorStop(0.5, '#e0f2fe')
        gradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()
        
        // Effet de croix pour les étoiles plus grandes
        if (star.size > 1.5) {
          ctx.strokeStyle = gradient
          ctx.lineWidth = 0.5
          ctx.globalAlpha = currentOpacity * 0.6
          
          // Ligne horizontale
          ctx.beginPath()
          ctx.moveTo(star.x - star.size * 2, star.y)
          ctx.lineTo(star.x + star.size * 2, star.y)
          ctx.stroke()
          
          // Ligne verticale
          ctx.beginPath()
          ctx.moveTo(star.x, star.y - star.size * 2)
          ctx.lineTo(star.x, star.y + star.size * 2)
          ctx.stroke()
        }
        
        ctx.restore()
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }

    // Initialisation
    resizeCanvas()
    initStars()
    animate(0)

    // Gestionnaire de redimensionnement
    const handleResize = () => {
      resizeCanvas()
      initStars()
    }

    window.addEventListener('resize', handleResize)

    // Nettoyage
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [starCount])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
      }}
    />
  )
}