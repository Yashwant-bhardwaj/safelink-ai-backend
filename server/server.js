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

// Configure CORS to allow our Vite frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use(morgan('dev'))

// Welcome endpoint
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to SafeLink AI API v1' })
})

// Route registrations
app.use('/api/auth', authRoutes)
app.use('/api/scan', scanRoutes) // Apply scan routes (SSRF Guard will be applied internally on scan execution)
app.use('/api/stats', statsRoutes)
app.use('/api/ai', aiRoutes)

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Global Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err)
  res.status(500).json({ error: 'Internal server error occurred' })
})

app.listen(PORT, () => {
  console.log(`🚀 SafeLink AI backend server running on http://localhost:${PORT}`)
})
