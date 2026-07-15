import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.js'
import scanRoutes from './routes/scan.js'
import statsRoutes from './routes/stats.js'
import aiRoutes from './routes/ai.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

app.set('trust proxy', 1)

// ── CORS: Allow only our Vite frontend origin ──────────────
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

app.use(express.json({ limit: '5mb' }))
app.use(morgan('dev'))

// ── Welcome endpoint ───────────────────────────────────────
app.get('/api', (req, res) => {
  res.json({
    message: 'SafeLink AI API v1',
    status: 'online',
    ai: process.env.GEMINI_API_KEY ? 'configured' : 'missing_key',
    oauth: {
      google: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'missing_credentials',
      github: process.env.GITHUB_CLIENT_ID ? 'configured' : 'missing_credentials',
    }
  })
})

// ── Route registrations ────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/scan', scanRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/ai', aiRoutes)

// ── 404 handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// ── Global error handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err)
  res.status(500).json({ error: 'Internal server error occurred' })
})


// Start server
app.listen(PORT, () => {
  console.log(`🚀 SafeLink AI backend running on port ${PORT}`)
})