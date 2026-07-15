import express from 'express'
import { scans } from '../lib/db.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()

router.get('/', authMiddleware, (req, res) => {
  const userId = req.user.id
  const userScans = scans.filter(s => s.userId === userId)

  const totalScans = userScans.length
  const safeUrls = userScans.filter(s => s.score >= 80).length
  const warningUrls = userScans.filter(s => s.score >= 60 && s.score < 80).length
  const dangerUrls = userScans.filter(s => s.score < 60).length
  const httpsWebsites = userScans.filter(s => s.isHttps).length

  // Calculate average response time
  const totalResponseTime = userScans.reduce((sum, s) => sum + (s.responseTime || 0), 0)
  const avgResponseTime = totalScans > 0 ? Math.round(totalResponseTime / totalScans) : 0

  // Calculate recent activity (last 7 days)
  const chartData = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const startOfDay = new Date(date.setHours(0, 0, 0, 0))
    const endOfDay = new Date(date.setHours(23, 59, 59, 999))

    const dayScans = userScans.filter(s => {
      const d = new Date(s.scannedAt)
      return d >= startOfDay && d <= endOfDay
    })

    chartData.push({
      date: dateStr,
      safe: dayScans.filter(s => s.score >= 80).length,
      unsafe: dayScans.filter(s => s.score < 80).length,
      total: dayScans.length,
    })
  }

  // Calculate security score cells
  const passRates = {
    ssl: 0,
    malware: 0,
    phishing: 0,
    xss: 0
  }
  if (totalScans > 0) {
    passRates.ssl = Math.round((userScans.filter(s => s.securityChecks?.ssl).length / totalScans) * 100)
    passRates.malware = Math.round((userScans.filter(s => s.securityChecks?.malware).length / totalScans) * 100)
    passRates.phishing = Math.round((userScans.filter(s => s.securityChecks?.phishing).length / totalScans) * 100)
    passRates.xss = Math.round((userScans.filter(s => s.securityChecks?.xssProtection).length / totalScans) * 100)
  }

  const securityScoreData = [
    { name: 'Malware Free', value: totalScans > 0 ? passRates.malware : 100, color: '#22C55E' },
    { name: 'Phishing Safe', value: totalScans > 0 ? passRates.phishing : 100, color: '#3B82F6' },
    { name: 'HTTPS Enabled', value: totalScans > 0 ? passRates.ssl : 100, color: '#06B6D4' },
    { name: 'No XSS Risk', value: totalScans > 0 ? passRates.xss : 100, color: '#F59E0B' },
  ]

  res.json({
    stats: {
      totalScans,
      safeUrls,
      unsafeUrls: warningUrls + dangerUrls,
      httpsWebsites,
      avgResponseTime,
      threatsBlocked: warningUrls + dangerUrls,
    },
    chartData,
    securityScoreData,
  })
})

export default router
