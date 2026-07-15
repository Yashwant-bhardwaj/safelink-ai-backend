import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { users } from '../lib/db.js'

dotenv.config()

const JWT_FALLBACK = 'safelink_jwt_secret_key_super_secure_change_in_production'

function getJwtSecret() {
  return process.env.JWT_SECRET || JWT_FALLBACK
}

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing' })
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Token format is invalid. Use: Bearer <token>' })
  }

  const token = parts[1]

  // ── API Key auth ─────────────────────────────────────────
  if (token.startsWith('sk_')) {
    const user = users.find(u => u.apiKey === token)
    if (!user) {
      return res.status(401).json({ error: 'Invalid API Key' })
    }
    req.user = user
    return next()
  }

  // ── JWT auth ─────────────────────────────────────────────
  try {
    const decoded = jwt.verify(token, getJwtSecret())
    const user = users.find(u => u.id === decoded.id)
    if (!user) {
      return res.status(401).json({ error: 'User account not found. Please sign in again.' })
    }
    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' })
    }
    return res.status(401).json({ error: 'Invalid token. Please sign in again.' })
  }
}
