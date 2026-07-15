import express from 'express'
import { scans, users } from '../lib/db.js'
import authMiddleware from '../middleware/auth.js'
import ssrfGuard from '../middleware/ssrfGuard.js'
import { analyzeUrl } from '../services/analyzer.js'

const router = express.Router()

router.post('/', authMiddleware, ssrfGuard, async (req, res) => {
  const { url } = req.body
  if (!url) {
    return res.status(400).json({ error: 'URL is required' })
  }

  // Increment usage count
  const updatedUser = users.update(
    u => u.id === req.user.id,
    { scansUsed: (req.user.scansUsed || 0) + 1 }
  )

  try {
    const report = await analyzeUrl(url)
    
    // Add DB properties
    const scanRecord = {
      id: `scan_${Math.random().toString(36).substring(2, 11)}`,
      userId: req.user.id,
      ...report,
    }

    scans.insert(scanRecord)
    res.status(201).json(scanRecord)
  } catch (err) {
    console.error('Scan execution error:', err)
    res.status(500).json({ error: 'An error occurred during safety analysis' })
  }
})

router.get('/history', authMiddleware, (req, res) => {
  const userId = req.user.id
  const { search, status, sortBy = 'date', sortDir = 'desc', page = 1, limit = 10 } = req.query

  let userScans = scans.filter(s => s.userId === userId)

  // Search filter
  if (search) {
    const q = search.toLowerCase()
    userScans = userScans.filter(s => 
      s.url.toLowerCase().includes(q) || 
      s.domain.toLowerCase().includes(q)
    )
  }

  // Status filter (safe, warning, danger)
  if (status && status !== 'all') {
    userScans = userScans.filter(s => {
      if (status === 'safe') return s.score >= 80
      if (status === 'warning') return s.score >= 60 && s.score < 80
      if (status === 'danger') return s.score < 60
      return true
    })
  }

  // Sort
  userScans.sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    if (sortBy === 'date') return dir * (new Date(a.scannedAt) - new Date(b.scannedAt))
    if (sortBy === 'score') return dir * (a.score - b.score)
    if (sortBy === 'domain') return dir * a.domain.localeCompare(b.domain)
    return 0
  })

  // Pagination
  const total = userScans.length
  const pIndex = parseInt(page)
  const limitVal = parseInt(limit)
  const paginated = userScans.slice((pIndex - 1) * limitVal, pIndex * limitVal)

  res.json({
    data: paginated,
    total,
    page: pIndex,
    pageSize: limitVal,
    totalPages: Math.ceil(total / limitVal)
  })
})

router.get('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const scan = scans.find(s => s.id === id && s.userId === req.user.id)
  if (!scan) {
    return res.status(404).json({ error: 'Scan report not found' })
  }
  res.json(scan)
})

router.delete('/clear', authMiddleware, (req, res) => {
  const userId = req.user.id
  scans.delete(s => s.userId === userId)
  res.json({ success: true, message: 'Scan history cleared' })
})

router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const deleted = scans.delete(s => s.id === id && s.userId === req.user.id)
  if (!deleted) {
    return res.status(404).json({ error: 'Scan record not found or permission denied' })
  }
  res.json({ success: true, message: 'Scan report deleted' })
})

export default router
