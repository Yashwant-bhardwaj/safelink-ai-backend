import { generateId } from '@/utils/helpers'

// Generate a realistic mock scan result
export function generateMockScan(url) {
  const domain = (() => {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname
    } catch {
      return url
    }
  })()

  const isHttps = url.startsWith('https://') || !url.startsWith('http://')
  const responseTime = Math.floor(Math.random() * 800) + 100
  const score = Math.floor(Math.random() * 30) + 65

  return {
    id: generateId(),
    url: url.startsWith('http') ? url : `https://${url}`,
    domain,
    scannedAt: new Date().toISOString(),
    score,
    status: score >= 70 ? 'safe' : score >= 50 ? 'warning' : 'danger',
    httpStatus: 200,
    isHttps,
    responseTime,
    redirectCount: Math.floor(Math.random() * 3),
    finalUrl: url,
    metadata: {
      title: `${domain} - Official Website`,
      description: `Welcome to ${domain}. We provide world-class services and products for our valued customers worldwide.`,
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      canonical: `https://${domain}/`,
      robots: 'index, follow',
      charset: 'UTF-8',
      language: 'en',
      generator: Math.random() > 0.5 ? 'WordPress 6.4' : 'Next.js',
      viewport: 'width=device-width, initial-scale=1',
      themeColor: '#000000',
    },
    openGraph: {
      title: `${domain} - Official`,
      description: 'Discover our amazing products and services.',
      image: null,
      type: 'website',
      siteName: domain,
      url: `https://${domain}/`,
    },
    twitterCard: {
      card: 'summary_large_image',
      site: `@${domain.replace('.', '')}`,
      title: `${domain} - Official`,
      description: 'Discover our amazing products and services.',
    },
    headers: {
      'content-type': 'text/html; charset=UTF-8',
      'x-frame-options': Math.random() > 0.4 ? 'SAMEORIGIN' : null,
      'x-content-type-options': Math.random() > 0.3 ? 'nosniff' : null,
      'strict-transport-security': isHttps && Math.random() > 0.3 ? 'max-age=31536000; includeSubDomains' : null,
      'content-security-policy': Math.random() > 0.5 ? "default-src 'self'" : null,
      'x-xss-protection': Math.random() > 0.4 ? '1; mode=block' : null,
      'referrer-policy': Math.random() > 0.5 ? 'strict-origin-when-cross-origin' : null,
      'permissions-policy': Math.random() > 0.6 ? 'camera=(), microphone=()' : null,
      server: Math.random() > 0.5 ? 'nginx/1.24.0' : 'Apache/2.4.54',
      'cache-control': 'public, max-age=3600',
      'x-powered-by': Math.random() > 0.6 ? null : 'Express',
    },
    technologies: (() => {
      const tech = []
      const allTech = ['React', 'Next.js', 'Nginx', 'Cloudflare', 'Google Analytics', 'jQuery', 'Bootstrap', 'Webpack', 'TypeScript', 'Node.js']
      const count = Math.floor(Math.random() * 5) + 2
      const shuffled = allTech.sort(() => Math.random() - 0.5)
      return shuffled.slice(0, count)
    })(),
    redirectChain: (() => {
      const chain = []
      const count = Math.floor(Math.random() * 2)
      for (let i = 0; i < count; i++) {
        chain.push({
          url: `http://${domain}/`,
          status: 301,
          method: 'GET',
        })
      }
      chain.push({ url: `https://${domain}/`, status: 200, method: 'GET' })
      return chain
    })(),
    securityChecks: {
      malware: score >= 70,
      phishing: score >= 75,
      ssl: isHttps,
      dnssec: Math.random() > 0.5,
      xssProtection: Math.random() > 0.4,
      clickjacking: Math.random() > 0.3,
      contentType: true,
      hsts: isHttps && Math.random() > 0.3,
    },
    whois: {
      registrar: 'GoDaddy LLC',
      createdAt: '2010-04-12',
      expiresAt: '2026-04-12',
      country: 'US',
    },
    performance: {
      ttfb: Math.floor(responseTime * 0.3),
      fcp: Math.floor(responseTime * 0.8),
      lcp: Math.floor(responseTime * 1.5),
      cls: (Math.random() * 0.2).toFixed(3),
    },
  }
}

// Mock scan history
export const MOCK_HISTORY = Array.from({ length: 24 }, (_, i) => {
  const urls = [
    'https://github.com', 'https://google.com', 'https://stackoverflow.com',
    'https://stripe.com', 'https://vercel.com', 'https://cloudflare.com',
    'https://amazon.com', 'https://youtube.com', 'https://reddit.com',
    'https://example-phishing-site.com', 'https://malware-test.org', 'https://openai.com',
    'https://react.dev', 'https://tailwindcss.com', 'https://npmjs.com',
    'https://netlify.com', 'https://linear.app', 'https://figma.com',
  ]
  const url = urls[i % urls.length]
  const domain = (() => { try { return new URL(url).hostname } catch { return url } })()
  const score = Math.floor(Math.random() * 40) + 60
  const date = new Date()
  date.setHours(date.getHours() - i * 3)

  return {
    id: generateId(),
    url,
    domain,
    score,
    status: score >= 70 ? 'safe' : score >= 50 ? 'warning' : 'danger',
    responseTime: Math.floor(Math.random() * 600) + 100,
    scannedAt: date.toISOString(),
    isHttps: url.startsWith('https://'),
    httpStatus: 200,
  }
})

// Mock dashboard stats
export const MOCK_STATS = {
  totalScans: 1247,
  safeUrls: 986,
  unsafeUrls: 261,
  httpsWebsites: 1089,
  avgResponseTime: 342,
  scansToday: 23,
  scansTrend: '+12%',
  threatsBlocked: 261,
}

// Mock chart data (last 7 days)
export const MOCK_CHART_DATA = Array.from({ length: 7 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (6 - i))
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    safe: Math.floor(Math.random() * 80) + 40,
    unsafe: Math.floor(Math.random() * 20) + 5,
    total: Math.floor(Math.random() * 100) + 50,
  }
})

export const MOCK_SECURITY_SCORE_DATA = [
  { name: 'Malware Free', value: 94, color: '#22C55E' },
  { name: 'Phishing Safe', value: 89, color: '#3B82F6' },
  { name: 'HTTPS Enabled', value: 87, color: '#06B6D4' },
  { name: 'No XSS Risk', value: 76, color: '#F59E0B' },
]
