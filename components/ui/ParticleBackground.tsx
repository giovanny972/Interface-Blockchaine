'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  color: string
}

interface ParticleBackgroundProps {
  particleCount?: number
  colors?: string[]
  speed?: number
  size?: number
  interactive?: boolean
}

export function ParticleBackground({
  particleCount = 50,
  colors = ['#0ea5e9', '#d946ef', '#22c55e', '#f59e0b'],
  speed = 0.5,
  size = 2,
  interactive = true
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>()
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createParticles = () => {
      const particles: Particle[] = []
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * size + 1,
          speedX: (Math.random() - 0.5) * speed,
          speedY: (Math.random() - 0.5) * speed,
          opacity: Math.random() * 0.5 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)]
        })
      }
      particlesRef.current = particles
    }

    const drawParticle = (particle: Particle) => {
      ctx.save()
      ctx.globalAlpha = particle.opacity
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    const updateParticle = (particle: Particle) => {
      particle.x += particle.speedX
      particle.y += particle.speedY

      // Rebond sur les bords
      if (particle.x <= 0 || particle.x >= canvas.width) {
        particle.speedX *= -1
      }
      if (particle.y <= 0 || particle.y >= canvas.height) {
        particle.speedY *= -1
      }

      // Interaction avec la souris
      if (interactive) {
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 100) {
          const force = (100 - distance) / 100
          particle.speedX += (dx / distance) * force * 0.01
          particle.speedY += (dy / distance) * force * 0.01
        }
      }

      // Limiter la vitesse
      const maxSpeed = speed * 2
      if (Math.abs(particle.speedX) > maxSpeed) {
        particle.speedX = particle.speedX > 0 ? maxSpeed : -maxSpeed
      }
      if (Math.abs(particle.speedY) > maxSpeed) {
        particle.speedY = particle.speedY > 0 ? maxSpeed : -maxSpeed
      }
    }

    const drawConnections = () => {
      const particles = particlesRef.current
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            const opacity = (150 - distance) / 150 * 0.1
            ctx.save()
            ctx.globalAlpha = opacity
            ctx.strokeStyle = particles[i].color
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
            ctx.restore()
          }
        }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach(particle => {
        updateParticle(particle)
        drawParticle(particle)
      })

      drawConnections()

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = event.clientX
      mouseRef.current.y = event.clientY
    }

    const handleResize = () => {
      resizeCanvas()
      createParticles()
    }

    // Initialisation
    resizeCanvas()
    createParticles()
    animate()

    // Event listeners
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
    }
  }, [particleCount, colors, speed, size, interactive])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  )
}