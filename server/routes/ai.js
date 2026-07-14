import express from 'express'
import jwt from 'jsonwebtoken'
import { scans, users, conversations } from '../lib/db.js'
import { getChatStream } from '../services/aiService.js'
import crypto from 'node:crypto'

const router = express.Router()

// Helper to optionally parse user details from Auth header
function getOptionalUser(req) {
  const authHeader = req.headers.authorization
  if (!authHeader) return null

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null

  const token = parts[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'safelink_jwt_secret_key_1298471092384723908')
    return users.find(u => u.id === decoded.id) || null
  } catch (err) {
    return null
  }
}

// 1. Get all conversations for a user
router.get('/conversations', (req, res) => {
  const user = getOptionalUser(req)
  if (!user) return res.json([])

  const userConvos = conversations.filter(c => c.userId === user.id)
  res.json(userConvos.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)))
})

// 2. Create a new conversation
router.post('/conversations', (req, res) => {
  const user = getOptionalUser(req)
  const { title, scanId } = req.body

  const newConvo = {
    id: crypto.randomUUID(),
    userId: user ? user.id : 'guest',
    title: title || 'New Security Chat',
    scanId: scanId || null,
    messages: [],
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  conversations.insert(newConvo)
  res.status(201).json(newConvo)
})

// 3. Update conversation (rename/pin)
router.patch('/conversations/:id', (req, res) => {
  const user = getOptionalUser(req)
  const { id } = req.params
  const { title, isPinned } = req.body

  const predicate = c => c.id === id && (user ? c.userId === user.id : c.userId === 'guest')
  const updated = conversations.update(predicate, {
    ...(title !== undefined && { title }),
    ...(isPinned !== undefined && { isPinned }),
    updatedAt: new Date().toISOString()
  })

  if (!updated) return res.status(404).json({ error: 'Conversation not found' })
  res.json(updated)
})

// 4. Delete conversation
router.delete('/conversations/:id', (req, res) => {
  const user = getOptionalUser(req)
  const { id } = req.params

  const predicate = c => c.id === id && (user ? c.userId === user.id : c.userId === 'guest')
  const deleted = conversations.delete(predicate)

  if (!deleted) return res.status(404).json({ error: 'Conversation not found' })
  res.json({ success: true })
})

// 5. Main Chat Endpoint (Streaming)
router.post('/chat', async (req, res) => {
  const { message, scanId, conversationId, stream = true } = req.body
  if (!message) {
    return res.status(400).json({ error: 'Message content is required' })
  }

  const user = getOptionalUser(req)
  const userId = user ? user.id : 'guest'

  // Fetch or create conversation
  let convo = null
  if (conversationId) {
    convo = conversations.find(c => c.id === conversationId && c.userId === userId)
  }

  if (!convo) {
    convo = {
      id: conversationId || crypto.randomUUID(),
      userId,
      title: message.substring(0, 40) + '...',
      scanId: scanId || null,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    if (userId !== 'guest') conversations.insert(convo)
  }

  // Add user message to history
  const userMsg = { role: 'user', content: message, timestamp: new Date().toISOString() }
  convo.messages.push(userMsg)

  // Context preparation
  let activeScan = null
  if (scanId) {
    activeScan = scans.find(s => s.id === scanId && (user ? s.userId === user.id : true))
  }

  // Handle non-streaming (fallback)
  if (!stream) {
    // We could implement getChatResponse here if needed, but we prefer streaming
    return res.status(400).json({ error: 'Only streaming is currently supported for production-grade Copilot' })
  }

  // Streaming setup
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  let fullReply = ''
  try {
    const streamGenerator = getChatStream(convo.messages, { scan: activeScan })
    
    for await (const chunk of streamGenerator) {
      fullReply += chunk
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`)
    }

    // Save assistant message to history
    const assistantMsg = { role: 'assistant', content: fullReply, timestamp: new Date().toISOString() }
    convo.messages.push(assistantMsg)
    convo.updatedAt = new Date().toISOString()
    
    if (userId !== 'guest') {
      conversations.update(c => c.id === convo.id, { 
        messages: convo.messages,
        updatedAt: convo.updatedAt
      })
    }

    res.write(`data: [DONE]\n\n`)
    res.end()
  } catch (err) {
    console.error('Chat Streaming Error:', err)
    res.write(`data: ${JSON.stringify({ error: 'AI Stream disconnected' })}\n\n`)
    res.end()
  }
})

export default router
