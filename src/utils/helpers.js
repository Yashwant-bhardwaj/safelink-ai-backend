// URL validation
export function isValidUrl(string) {
  try {
    const url = new URL(string.startsWith('http') ? string : `https://${string}`)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function normalizeUrl(url) {
  if (!url) return ''
  const trimmed = url.trim()
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`
  }
  return trimmed
}

export function extractDomain(url) {
  try {
    return new URL(normalizeUrl(url)).hostname
  } catch {
    return url
  }
}

// Date formatting
export function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(dateStr)
}

// Number formatting
export function formatNumber(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num?.toString() || '0'
}

export function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatMs(ms) {
  if (!ms) return '0ms'
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`
  return `${ms}ms`
}

// Security score
export function getScoreColor(score) {
  if (score >= 80) return '#22C55E'
  if (score >= 60) return '#F59E0B'
  if (score >= 40) return '#F97316'
  return '#EF4444'
}

export function getScoreLabel(score) {
  if (score >= 80) return 'Safe'
  if (score >= 60) return 'Low Risk'
  if (score >= 40) return 'Medium Risk'
  return 'High Risk'
}

export function getScoreBadgeClass(score) {
  if (score >= 80) return 'badge-safe'
  if (score >= 60) return 'badge-warning'
  return 'badge-danger'
}

// Risk level
export function getRiskLevel(score) {
  if (score >= 80) return { level: 'Safe', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' }
  if (score >= 60) return { level: 'Low Risk', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' }
  if (score >= 40) return { level: 'Medium Risk', color: '#F97316', bg: 'rgba(249,115,22,0.1)' }
  return { level: 'High Risk', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' }
}

// Generate random ID
export function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

// Truncate string
export function truncate(str, length = 50) {
  if (!str) return ''
  return str.length > length ? `${str.slice(0, length)}...` : str
}

// Get favicon URL
export function getFaviconUrl(domain) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
}

// HTTP status label
export function getStatusLabel(code) {
  if (!code) return 'Unknown'
  if (code >= 200 && code < 300) return `${code} OK`
  if (code >= 300 && code < 400) return `${code} Redirect`
  if (code >= 400 && code < 500) return `${code} Client Error`
  if (code >= 500) return `${code} Server Error`
  return `${code}`
}

export function getStatusColor(code) {
  if (!code) return '#6B7280'
  if (code >= 200 && code < 300) return '#22C55E'
  if (code >= 300 && code < 400) return '#F59E0B'
  return '#EF4444'
}
