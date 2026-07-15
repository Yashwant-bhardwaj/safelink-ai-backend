import dns from 'node:dns/promises'
import ipaddr from 'ipaddr.js'

// Normalize URL host
function getHost(urlStr) {
  try {
    let normalized = urlStr.trim()
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`
    }
    const parsed = new URL(normalized)
    return parsed.hostname
  } catch {
    return null
  }
}

// Check if IP is private/local
function isPrivateIp(ipString) {
  try {
    const addr = ipaddr.parse(ipString)
    const range = addr.range()
    
    // Check if IPv4 or IPv6 is in private ranges
    const privateRanges = [
      'private',      // RFC 1918 (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
      'loopback',     // 127.0.0.0/8
      'linkLocal',    // 169.254.0.0/16
      'uniqueLocal',  // IPv6 fc00::/7
      'unspecified'   // 0.0.0.0 or ::
    ]

    return privateRanges.includes(range)
  } catch (err) {
    // If it fails to parse, treat it as suspicious/private to be safe
    return true
  }
}

export default async function ssrfGuard(req, res, next) {
  const { url } = req.body
  if (!url) {
    return res.status(400).json({ error: 'URL is required' })
  }

  const host = getHost(url)
  if (!host) {
    return res.status(400).json({ error: 'Invalid URL format' })
  }

  // If it's directly an IP address
  if (ipaddr.isValid(host)) {
    if (isPrivateIp(host)) {
      return res.status(400).json({
        error: 'Access denied: Scanning loopback, private, or local subnet addresses is prohibited.'
      })
    }
    return next()
  }

  // Resolve DNS to verify resolved IP addresses
  try {
    const addresses = await dns.resolve(host, 'A')
    for (const ip of addresses) {
      if (isPrivateIp(ip)) {
        return res.status(400).json({
          error: 'Access denied: The domain resolves to a private or loopback IP range.'
        })
      }
    }
    next()
  } catch (err) {
    // If it fails DNS check, analyzer.js will handle the DNS failure gracefully.
    // Let it pass to analyzer so we get a formal DNS resolution report.
    next()
  }
}
