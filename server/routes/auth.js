import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { users } from '../lib/db.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()

function generateApiKey() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let key = 'sk_live_safelink_'
  for (let i = 0; i < 16; i++) {
    key += chars[Math.floor(Math.random() * chars.length)]
  }
  return key
}

function signToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'safelink_jwt_secret_key_1298471092384723908',
    { expiresIn: '7d' }
  )
}

router.post('/register', (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (existingUser) {
    return res.status(400).json({ error: 'Email address already registered' })
  }

  const hashedPassword = bcrypt.hashSync(password, 10)
  const userId = `usr_${Math.random().toString(36).substring(2, 11)}`
  const apiKey = generateApiKey()
  const joinedAt = new Date().toISOString().split('T')[0]

  const newUser = {
    id: userId,
    name,
    email,
    password: hashedPassword,
    role: 'Pro',
    plan: 'Professional',
    apiKey,
    scansUsed: 0,
    scansLimit: 5000,
    joinedAt,
  }

  users.insert(newUser)

  const token = signToken(userId)
  
  const { password: _, ...userResponse } = newUser
  res.status(201).json({ user: userResponse, token })
})

router.post('/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ error: 'Invalid email address or password' })
  }

  const token = signToken(user.id)
  
  const { password: _, ...userResponse } = user
  res.json({ user: userResponse, token })
})

router.get('/me', authMiddleware, (req, res) => {
  const { password: _, ...userResponse } = req.user
  res.json({ user: userResponse })
})

router.put('/profile', authMiddleware, (req, res) => {
  const { name, email } = req.body
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' })
  }

  const updatedUser = users.update(
    u => u.id === req.user.id,
    { name, email }
  )

  if (!updatedUser) {
    return res.status(500).json({ error: 'Failed to update profile' })
  }

  const { password: _, ...userResponse } = updatedUser
  res.json({ user: userResponse })
})

router.put('/change-password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new passwords are required' })
  }

  const user = users.find(u => u.id === req.user.id)
  if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(400).json({ error: 'Incorrect current password' })
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10)
  users.update(u => u.id === req.user.id, { password: hashedPassword })
  
  res.json({ success: true, message: 'Password changed successfully' })
})

export default router
