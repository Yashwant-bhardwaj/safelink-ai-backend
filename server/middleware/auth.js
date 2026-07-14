import jwt from 'jsonwebtoken'
import { users } from '../lib/db.js'

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing' })
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Token format is invalid. Use Bearer <token>' })
  }

  const token = parts[1]

  // Check if it's an API Key or JWT token
  if (token.startsWith('sk_')) {
    const user = users.find(u => u.apiKey === token)
    if (!user) {
      return res.status(401).json({ error: 'Invalid API Key' })
    }
    req.user = user
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'safelink_jwt_secret_key_1298471092384723908')
    const user = users.find(u => u.id === decoded.id)
    if (!user) {
      return res.status(401).json({ error: 'User does not exist' })
    }
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token or session expired' })
  }
}
