'use client'

import { useEffect, useRef, useCallback, useMemo } from 'react'

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  speed: number
}

interface Nebula {
  x: number
  y: number
  radius: number
  color: string
  opacity: number
  drift: number
}

interface StarryBackgroundProps {
  starCount?: number
  className?: string
  enableShootingStars?: boolean
  enableNebula?: boolean
}

export default function StarryBackground({ starCount = 200, className = '', enableShootingStars = true, enableNebula = true }: StarryBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const nebulaRef = useRef<Nebula[]>([])
  const animationRef = useRef<number>()
  const lastFrameTime = useRef<number>(0)
  
  // Memoized nebula colors to prevent recalculation
  const nebulaColors = useMemo(() => [
    'rgba(138, 43, 226, 0.15)', // Violet
    'rgba(255, 20, 147, 0.12)',  // Rose magenta
    'rgba(0, 191, 255, 0.08)',   // Bleu ciel
    'rgba(255, 69, 0, 0.1)',     // Orange rouge
    'rgba(50, 205, 50, 0.06)',   // Vert lime
    'rgba(147, 112, 219, 0.14)', // Violet medium
  ], [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initialiser les étoiles
    const initStars = () => {
      starsRef.current = []
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.5 + 0.1
        })
      }
    }

    // Initialiser les nébuleuses
    const initNebula = () => {
      if (!enableNebula) return
      nebulaRef.current = []
      
      for (let i = 0; i < 4; i++) {
        nebulaRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 300 + 200,
          color: nebulaColors[Math.floor(Math.random() * nebulaColors.length)],
          opacity: Math.random() * 0.6 + 0.2,
          drift: (Math.random() - 0.5) * 0.1
        })
      }
    }

    // Fonction pour redimensionner le canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
      initNebula()
    }

    // Animation des étoiles
    const animate = (currentTime?: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Dessiner les nébuleuses d'abord (arrière-plan)
      if (enableNebula) {
        nebulaRef.current.forEach((nebula) => {
          // Mouvement de dérive lent
          nebula.x += nebula.drift
          nebula.y += nebula.drift * 0.5
          
          // Respiration de la nébuleuse
          nebula.opacity += Math.sin(Date.now() * 0.001 + nebula.x * 0.001) * 0.01
          nebula.opacity = Math.max(0.05, Math.min(0.3, nebula.opacity))
          
          // Créer un gradient radial pour la nébuleuse
          const gradient = ctx.createRadialGradient(
            nebula.x, nebula.y, 0,
            nebula.x, nebula.y, nebula.radius
          )
          
          const baseColor = nebula.color.replace(/[\d\.]+\)$/g, `${nebula.opacity})`)
          gradient.addColorStop(0, baseColor)
          gradient.addColorStop(0.4, baseColor.replace(/[\d\.]+\)$/g, `${nebula.opacity * 0.6})`))
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
          
          ctx.save()
          ctx.globalCompositeOperation = 'screen'
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2)
          ctx.fill()
          
          // Ajouter un effet de poussière stellaire
          ctx.globalAlpha = nebula.opacity * 0.3
          for (let i = 0; i < 20; i++) {
            const particleX = nebula.x + (Math.random() - 0.5) * nebula.radius * 1.5
            const particleY = nebula.y + (Math.random() - 0.5) * nebula.radius * 1.5
            const distance = Math.sqrt((particleX - nebula.x) ** 2 + (particleY - nebula.y) ** 2)
            
            if (distance < nebula.radius) {
              ctx.fillStyle = baseColor
              ctx.beginPath()
              ctx.arc(particleX, particleY, Math.random() * 1.5 + 0.5, 0, Math.PI * 2)
              ctx.fill()
            }
          }
          
          ctx.restore()
        })
      }
      
      starsRef.current.forEach((star) => {
        // Effet de scintillement
        star.opacity += (Math.random() - 0.5) * 0.02
        star.opacity = Math.max(0.1, Math.min(1, star.opacity))
        
        // Mouvement lent des étoiles
        star.y += star.speed
        if (star.y > canvas.height) {
          star.y = 0
          star.x = Math.random() * canvas.width
        }
        
        // Dessiner l'étoile
        ctx.save()
        ctx.globalAlpha = star.opacity
        ctx.fillStyle = '#ffffff'
        ctx.shadowColor = '#ffffff'
        ctx.shadowBlur = star.size * 2
        
        // Forme d'étoile
        const spikes = 5
        const outerRadius = star.size
        const innerRadius = star.size * 0.5
        
        ctx.beginPath()
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius
          const angle = (i * Math.PI) / spikes
          const x = star.x + Math.cos(angle) * radius
          const y = star.y + Math.sin(angle) * radius
          
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }

    // Initialisation
    resizeCanvas()
    animate()

    // Event listeners
    window.addEventListener('resize', resizeCanvas)

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [starCount, enableNebula])

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)' }}
      />
      
      {/* Étoiles filantes occasionnelles */}
      {enableShootingStars && (
        <>
          <div 
            className="absolute w-1 h-1 bg-white rounded-full shooting-star opacity-0"
            style={{ 
              top: '10%', 
              left: '20%',
              '--delay': '0s',
              boxShadow: '0 0 6px #fff, 0 0 12px #fff'
            } as React.CSSProperties}
          />
          <div 
            className="absolute w-1 h-1 bg-blue-200 rounded-full shooting-star opacity-0"
            style={{ 
              top: '30%', 
              left: '60%',
              '--delay': '7s',
              boxShadow: '0 0 6px #dbeafe, 0 0 12px #dbeafe'
            } as React.CSSProperties}
          />
          <div 
            className="absolute w-0.5 h-0.5 bg-purple-200 rounded-full shooting-star opacity-0"
            style={{ 
              top: '70%', 
              left: '10%',
              '--delay': '15s',
              boxShadow: '0 0 4px #e9d5ff, 0 0 8px #e9d5ff'
            } as React.CSSProperties}
          />
        </>
      )}
    </div>
  )
}