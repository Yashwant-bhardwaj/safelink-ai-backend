import { useEffect, useRef, useState } from 'react'

export default function BackgroundEffects() {
  const canvasRef = useRef(null)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const handleMouseMove = (e) => {
      setCoords({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Canvas Particle Animation
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let particles = []

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 0.4
        this.vy = (Math.random() - 0.5) * 0.4
        this.radius = Math.random() * 1.5 + 0.5
      }
      update() {
        this.x += this.vx
        this.y += this.vy
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(10, 132, 255, 0.25)'
        ctx.fill()
      }
    }

    const init = () => {
      particles = []
      const count = Math.min(60, Math.floor((canvas.width * canvas.height) / 25000))
      for (let i = 0; i < count; i++) {
        particles.push(new Particle())
      }
    }
    init()

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
        particles[i].draw()
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(10, 132, 255, ${0.1 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  if (!isMounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dynamic Mouse Spotlight Glow */}
      <div
        className="absolute inset-0 transition-opacity duration-300 opacity-100 dark:opacity-80"
        style={{
          background: `radial-gradient(600px circle at ${coords.x}px ${coords.y}px, rgba(10, 132, 255, 0.08), transparent 80%)`,
        }}
      />

      {/* Floating Network Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full opacity-60 dark:opacity-40" />

      {/* Cyber perspective grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(10, 132, 255, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(10, 132, 255, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Scrolling Scanline Effect */}
      <div className="absolute inset-0 w-full h-full scanline-anim" />

      {/* Noise overlay filter (Linear/Apple aesthetic) */}
      <svg className="absolute w-0 h-0">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.02 0" />
        </filter>
      </svg>
      <div 
        className="absolute inset-0 w-full h-full"
        style={{ filter: 'url(#noiseFilter)' }}
      />
    </div>
  )
}
