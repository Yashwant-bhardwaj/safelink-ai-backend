import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import dotenv from 'dotenv'
import { users } from '../lib/db.js'
import authMiddleware from '../middleware/auth.js'

dotenv.config()

const router = express.Router()

const FRONTEND_URL = {
  toString: () => {
    if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL;
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') return '';
    return 'http://localhost:5173';
  }
};
const JWT_FALLBACK = 'safelink_jwt_secret_key_super_secure_change_in_production'

// ── Helpers ────────────────────────────────────────────────

function getJwtSecret() {
  return process.env.JWT_SECRET || JWT_FALLBACK
}

function generateApiKey() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let key = 'sk_live_safelink_'
  for (let i = 0; i < 16; i++) {
    key += chars[Math.floor(Math.random() * chars.length)]
  }
  return key
}

function signToken(userId) {
  return jwt.sign({ id: userId }, getJwtSecret(), { expiresIn: '30d' })
}

function createUserFromOAuth(profile) {
  const userId = `usr_${Math.random().toString(36).substring(2, 11)}`
  return {
    id: userId,
    name: profile.name,
    email: profile.email,
    password: null,
    provider: profile.provider,
    providerId: profile.providerId,
    avatarUrl: profile.avatarUrl || null,
    role: 'Pro',
    plan: 'Professional',
    apiKey: generateApiKey(),
    scansUsed: 0,
    scansLimit: 5000,
    joinedAt: new Date().toISOString().split('T')[0],
  }
}

// ── Register ───────────────────────────────────────────────

router.post('/register', (req, res) => {
  try {
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

    const newUser = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      provider: 'email',
      role: 'Pro',
      plan: 'Professional',
      apiKey: generateApiKey(),
      scansUsed: 0,
      scansLimit: 5000,
      joinedAt: new Date().toISOString().split('T')[0],
    }

    users.insert(newUser)
    const token = signToken(userId)
    const { password: _, ...userResponse } = newUser

    return res.status(201).json({ user: userResponse, token })
  } catch (err) {
    console.error('Register error:', err)
    return res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
})

// ── Login ──────────────────────────────────────────────────

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      return res.status(400).json({ error: 'Invalid email address or password' })
    }

    if (!user.password) {
      return res.status(400).json({
        error: `This account was created with ${user.provider || 'OAuth'}. Please sign in using that method.`
      })
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: 'Invalid email address or password' })
    }

    const token = signToken(user.id)
    const { password: _, ...userResponse } = user
    return res.json({ user: userResponse, token })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Login failed. Please try again.' })
  }
})

// ── Get Current User ───────────────────────────────────────

router.get('/me', authMiddleware, (req, res) => {
  const { password: _, ...userResponse } = req.user
  res.json({ user: userResponse })
})

// ── Update Profile ─────────────────────────────────────────

router.put('/profile', authMiddleware, (req, res) => {
  try {
    const { name, email } = req.body
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' })
    }

    const conflict = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== req.user.id)
    if (conflict) {
      return res.status(400).json({ error: 'Email address is already in use by another account' })
    }

    const updatedUser = users.update(u => u.id === req.user.id, { name, email })
    if (!updatedUser) return res.status(500).json({ error: 'Failed to update profile' })

    const { password: _, ...userResponse } = updatedUser
    return res.json({ user: userResponse })
  } catch (err) {
    console.error('Profile update error:', err)
    return res.status(500).json({ error: 'Failed to update profile' })
  }
})

// ── Change Password ────────────────────────────────────────

router.put('/change-password', authMiddleware, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' })
    }

    const user = users.find(u => u.id === req.user.id)
    if (!user || !user.password) {
      return res.status(400).json({ error: 'Cannot change password for OAuth-linked accounts' })
    }
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(400).json({ error: 'Incorrect current password' })
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10)
    users.update(u => u.id === req.user.id, { password: hashedPassword })
    return res.json({ success: true, message: 'Password changed successfully' })
  } catch (err) {
    console.error('Change password error:', err)
    return res.status(500).json({ error: 'Failed to change password' })
  }
})

// ══════════════════════════════════════════════════════════════
// ── GOOGLE OAUTH 2.0 (With Mock Fallback) ─────────────────────
// ══════════════════════════════════════════════════════════════

router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
    // ── MOCK LOGIN FLOW (Since user has no credentials yet) ──
    let user = users.find(u => u.email === 'mock.google@example.com')
    if (!user) {
      user = createUserFromOAuth({
        name: 'Google Demo User',
        email: 'mock.google@example.com',
        provider: 'google',
        providerId: 'mock_google_123',
        avatarUrl: 'https://ui-avatars.com/api/?name=Google+User&background=4285F4&color=fff'
      })
      users.insert(user)
    }
    const token = signToken(user.id)
    return res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`)
  }

  // ── REAL OAUTH FLOW ──
  const callbackUrl = `${req.protocol}://${req.get('host')}/api/auth/google/callback`
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  })

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
})

router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query

  if (error || !code) {
    return res.redirect(`${FRONTEND_URL}/login?error=google_denied`)
  }

  try {
    const callbackUrl = `${req.protocol}://${req.get('host')}/api/auth/google/callback`

    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: callbackUrl,
      grant_type: 'authorization_code',
    })

    const profileRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
    })

    const g = profileRes.data
    let user = users.find(u => u.email.toLowerCase() === g.email.toLowerCase())

    if (!user) {
      user = createUserFromOAuth({ name: g.name, email: g.email, provider: 'google', providerId: g.sub, avatarUrl: g.picture })
      users.insert(user)
    } else if (!user.providerId) {
      users.update(u => u.id === user.id, { provider: 'google', providerId: g.sub, avatarUrl: g.picture })
    }

    const token = signToken(user.id)
    return res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`)
  } catch (err) {
    console.error('Google OAuth error:', err.response?.data || err.message)
    return res.redirect(`${FRONTEND_URL}/login?error=google_failed`)
  }
})

// ══════════════════════════════════════════════════════════════
// ── GITHUB OAUTH 2.0 (With Mock Fallback) ─────────────────────
// ══════════════════════════════════════════════════════════════

router.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId || clientId === 'YOUR_GITHUB_CLIENT_ID_HERE') {
    // ── MOCK LOGIN FLOW (Since user has no credentials yet) ──
    let user = users.find(u => u.email === 'mock.github@example.com')
    if (!user) {
      user = createUserFromOAuth({
        name: 'GitHub Demo User',
        email: 'mock.github@example.com',
        provider: 'github',
        providerId: 'mock_github_123',
        avatarUrl: 'https://ui-avatars.com/api/?name=GitHub+User&background=333&color=fff'
      })
      users.insert(user)
    }
    const token = signToken(user.id)
    return res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`)
  }

  // ── REAL OAUTH FLOW ──
  const callbackUrl = `${req.protocol}://${req.get('host')}/api/auth/github/callback`
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    scope: 'user:email read:user',
  })

  res.redirect(`https://github.com/login/oauth/authorize?${params}`)
})

router.get('/github/callback', async (req, res) => {
  const { code, error } = req.query

  if (error || !code) {
    return res.redirect(`${FRONTEND_URL}/login?error=github_denied`)
  }

  try {
    const callbackUrl = `${req.protocol}://${req.get('host')}/api/auth/github/callback`

    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: callbackUrl,
      },
      { headers: { Accept: 'application/json' } }
    )

    const accessToken = tokenRes.data.access_token
    if (!accessToken) throw new Error('No access token from GitHub')

    const ghHeaders = { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'SafeLink-AI' }
    const [profileRes, emailsRes] = await Promise.all([
      axios.get('https://api.github.com/user', { headers: ghHeaders }),
      axios.get('https://api.github.com/user/emails', { headers: ghHeaders }),
    ])

    const primaryEmail = emailsRes.data.find(e => e.primary && e.verified)?.email || emailsRes.data[0]?.email
    if (!primaryEmail) throw new Error('No verified email on GitHub account')

    const gh = profileRes.data
    let user = users.find(u => u.email.toLowerCase() === primaryEmail.toLowerCase())

    if (!user) {
      user = createUserFromOAuth({ name: gh.name || gh.login, email: primaryEmail, provider: 'github', providerId: String(gh.id), avatarUrl: gh.avatar_url })
      users.insert(user)
    } else if (!user.providerId) {
      users.update(u => u.id === user.id, { provider: 'github', providerId: String(gh.id), avatarUrl: gh.avatar_url })
    }

    const token = signToken(user.id)
    return res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`)
  } catch (err) {
    console.error('GitHub OAuth error:', err.response?.data || err.message)
    return res.redirect(`${FRONTEND_URL}/login?error=github_failed`)
  }
})

export default router
