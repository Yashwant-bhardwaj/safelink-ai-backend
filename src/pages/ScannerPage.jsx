import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  Shield, Search, CheckCircle, XCircle, AlertTriangle, Globe,
  Clock, RefreshCw, ExternalLink, Lock, Unlock, Code, Server,
  Eye, ArrowRight, Zap, ChevronRight, Info, Image, Download, Share2
} from 'lucide-react'
import { scanUrl } from '@/services/scannerService'
import { normalizeUrl, isValidUrl, getScoreColor, getScoreLabel, formatMs, getStatusColor } from '@/utils/helpers'
import SecurityScoreCard from '@/components/cards/SecurityScoreCard'
import Badge from '@/components/common/Badge'
import toast from 'react-hot-toast'

// ── Interactive Radar Sweep & Shield Animation ──
function ScanningAnimation({ url }) {
  const steps = [
    'Resolving DNS routes...',
    'Validating local SSRF sandbox...',
    'Fetching active SSL certificate...',
    'Auditing response headers...',
    'Evaluating cookie attributes...',
    'Generating security assessment...',
  ]
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(p => (p < steps.length - 1 ? p + 1 : p))
      setProgress(p => Math.min(p + (100 / steps.length), 95))
    }, 450)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* High-fidelity radar sweeper */}
      <div className="relative w-36 h-36 mb-8 flex items-center justify-center">
        {/* Outer scanning lines */}
        <div className="absolute inset-0 rounded-full border border-blue-500/20" />
        <div className="absolute inset-4 rounded-full border border-blue-500/15" />
        <div className="absolute inset-8 rounded-full border border-blue-500/10" />

        {/* Sweeping gradient line */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, rgba(10, 132, 255, 0.15) 0deg, transparent 90deg, transparent 360deg)'
          }}
        />

        {/* Rotating center shield */}
        <motion.div
          animate={{ rotateY: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-full flex items-center justify-center z-10 shadow-[0_0_20px_rgba(10,132,255,0.3)]"
          style={{ background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)' }}
        >
          <Shield size={24} className="text-white" />
        </motion.div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-sm font-semibold text-white mb-1">Performing Analysis...</h3>
        <p className="text-xs text-gray-500 max-w-xs truncate">{url}</p>
      </div>

      {/* Progress */}
      <div className="w-64 progress-bar mb-4">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          style={{ background: 'linear-gradient(90deg, #0A84FF, #5E5CE6)' }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="text-[11px] text-gray-400 font-semibold"
        >
          {steps[step]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

// ── Circular Score Progress Gauge ──
function CircularScoreGauge({ score, color }) {
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          className="stroke-white/[0.06]"
          strokeWidth="6"
          fill="transparent"
        />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          stroke={color}
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white leading-none">{score}</span>
        <span className="text-[8px] text-gray-500 uppercase mt-0.5">Score</span>
      </div>
    </div>
  )
}

function MetadataCard({ icon: Icon, label, value, color = '#8E8E93', children }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.01] border border-white/[0.04]">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-gray-500 mb-0.5">{label}</div>
        {children || <div className="text-xs font-semibold text-white truncate">{value || '—'}</div>}
      </div>
    </div>
  )
}

function HeaderCheck({ label, value }) {
  const present = !!value
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
      <div className="flex items-center gap-2">
        {present ? <CheckCircle size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-red-400" />}
        <span className="text-xs text-gray-300">{label}</span>
      </div>
      <div className="text-right">
        {present ? (
          <span className="text-[10px] text-gray-500 max-w-[180px] truncate block" title={value}>{value}</span>
        ) : (
          <span className="text-[10px] text-red-400">Not set</span>
        )}
      </div>
    </div>
  )
}

export default function ScannerPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [inputUrl, setInputUrl] = useState(searchParams.get('url') || '')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    const urlParam = searchParams.get('url')
    if (urlParam && isValidUrl(urlParam)) {
      setInputUrl(urlParam)
      performScan(urlParam)
    }
  }, [])

  const performScan = async (url) => {
    setScanning(true)
    setResult(null)
    setError('')
    try {
      const scanResult = await scanUrl(url)
      setResult(scanResult)
      toast.success('URL scan completed! 🛡️')
    } catch (err) {
      setError(err.message || 'Scan failed. Please try again.')
      toast.error(err.message || 'Failed to scan URL')
    } finally {
      setScanning(false)
    }
  }

  const handleScan = (e) => {
    e?.preventDefault()
    if (!inputUrl.trim()) { setError('Please enter a URL'); return }
    const normalized = normalizeUrl(inputUrl.trim())
    if (!isValidUrl(normalized)) { setError('Please enter a valid URL'); return }
    setError('')
    setInputUrl(normalized)
    performScan(normalized)
  }

  const handleExportPDF = () => {
    window.print()
    toast.success('Preparing document export...')
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Report URL copied to clipboard! 🔗')
  }

  const score = result?.score || 0
  const scoreColor = getScoreColor(score)

  return (
    <>
      <Helmet>
        <title>URL Scanner – SafeLink AI</title>
        <meta name="description" content="Scan any URL for malware, phishing, and security threats with SafeLink AI." />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">URL Scanner</h2>
        <p className="text-gray-400 text-xs mb-6">Instantly audit target domains for routing integrity, certificates, and DNS parameters.</p>

        <form onSubmit={handleScan}>
          <div className="flex gap-3 p-2 rounded-2xl glass" style={error ? { borderColor: 'rgba(255,69,58,0.4)' } : {}}>
            <div className="flex-1 flex items-center gap-3 px-3">
              <Search size={18} className="text-gray-500 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={inputUrl}
                onChange={(e) => { setInputUrl(e.target.value); setError('') }}
                placeholder="Enter URL to evaluate... (e.g. google.com)"
                className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm outline-none py-2"
                aria-label="URL to scan"
                disabled={scanning}
              />
              {inputUrl && !scanning && (
                <button type="button" onClick={() => { setInputUrl(''); setResult(null); inputRef.current?.focus() }}
                  className="text-gray-500 hover:text-gray-300 cursor-pointer text-lg">×</button>
              )}
            </div>
            <motion.button
              type="submit"
              disabled={scanning}
              whileHover={!scanning ? { scale: 1.02 } : {}}
              whileTap={!scanning ? { scale: 0.98 } : {}}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white disabled:opacity-60 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)' }}
            >
              {scanning ? <RefreshCw size={14} className="animate-spin" /> : <Shield size={14} />}
              {scanning ? 'Scanning...' : 'Scan URL'}
            </motion.button>
          </div>
          {error && <p className="mt-2 text-xs text-red-400">⚠ {error}</p>}
        </form>

        {!result && !scanning && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Try:</span>
            {['https://github.com', 'https://stripe.com', 'https://example.com'].map((ex) => (
              <button
                key={ex}
                onClick={() => { setInputUrl(ex); setError('') }}
                className="text-xs px-3 py-1.5 rounded-full text-gray-400 hover:text-white transition-all cursor-pointer bg-white/[0.04] border border-white/[0.08]"
              >
                {ex}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {scanning && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl glass">
          <ScanningAnimation url={inputUrl} />
        </motion.div>
      )}

      <AnimatePresence>
        {result && !scanning && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            
            {/* Overview Result Box */}
            <div className="p-6 rounded-2xl glass" style={{ borderColor: `${scoreColor}30`, boxShadow: `0 0 30px ${scoreColor}08` }}>
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                
                {/* Score Dial */}
                <CircularScoreGauge score={score} color={scoreColor} />

                {/* Info Text */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant={score >= 70 ? 'safe' : score >= 50 ? 'warning' : 'danger'} dot>
                      {getScoreLabel(score)}
                    </Badge>
                    <Badge variant={result.isHttps ? 'safe' : 'danger'} size="xs">
                      {result.isHttps ? <><Lock size={10} /> HTTPS</> : <><Unlock size={10} /> HTTP</>}
                    </Badge>
                    <span className="text-[10px] px-2 py-0.5 rounded-full text-gray-400"
                      style={{ background: `${getStatusColor(result.httpStatus)}15`, color: getStatusColor(result.httpStatus), border: `1px solid ${getStatusColor(result.httpStatus)}30` }}>
                      {result.httpStatus} OK
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white truncate">{result.url}</h3>
                  <p className="text-xs text-gray-400 truncate">{result.metadata?.title}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap md:flex-col gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/scan/${result.id}`, { state: { scan: result } })}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)' }}
                  >
                    Full Report <ChevronRight size={12} />
                  </motion.button>
                  <div className="flex gap-2">
                    <button onClick={handleExportPDF} className="flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer">
                      <Download size={14} />
                    </button>
                    <button onClick={handleShare} className="flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer">
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Clock, label: 'Response Time', value: formatMs(result.responseTime), color: '#0A84FF' },
                { icon: RefreshCw, label: 'Redirects', value: `${result.redirectCount} redirects`, color: '#FF9F0A' },
                { icon: Globe, label: 'Final host', value: result.domain, color: '#32ADE6' },
                { icon: Server, label: 'Server Engine', value: result.headers?.server || 'Unknown', color: '#5E5CE6' },
              ].map((item) => (
                <MetadataCard key={item.label} {...item} />
              ))}
            </div>

            {/* Main results columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                
                {/* Screenshot Preview Box */}
                <div className="p-6 rounded-2xl glass">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Image size={15} className="text-blue-400" /> Site Screenshot Preview
                  </h3>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                    <img
                      src={`https://image.thum.io/get/width/800/crop/800/${result.url}`}
                      alt="Site Preview"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" fill="%23111827"/><text x="50" y="50" fill="%234B5563" font-size="10" text-anchor="middle" dominant-baseline="middle">Preview Unreachable</text></svg>'
                      }}
                    />
                  </div>
                </div>

                {/* Metadata */}
                <div className="p-6 rounded-2xl glass">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Eye size={15} className="text-blue-400" /> Page Metadata
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Title', value: result.metadata?.title },
                      { label: 'Description', value: result.metadata?.description },
                      { label: 'Canonical', value: result.metadata?.canonical },
                      { label: 'Robots', value: result.metadata?.robots },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-start gap-4 py-2 border-b border-white/[0.04] last:border-0">
                        <span className="text-xs text-gray-500 flex-shrink-0">{label}</span>
                        <span className="text-xs text-gray-300 text-right break-all max-w-[280px]">{value || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Score breakdown side column */}
              <div>
                <SecurityScoreCard score={result.score} checks={result.securityChecks} />
              </div>
            </div>

            {/* Security Headers */}
            <div className="p-6 rounded-2xl glass">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Lock size={15} className="text-emerald-400" /> Security Headers Check
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                {Object.entries({
                  'Strict-Transport-Security': result.headers?.['strict-transport-security'],
                  'Content-Security-Policy': result.headers?.['content-security-policy'],
                  'X-Frame-Options': result.headers?.['x-frame-options'],
                  'X-Content-Type-Options': result.headers?.['x-content-type-options'],
                  'X-XSS-Protection': result.headers?.['x-xss-protection'],
                  'Referrer-Policy': result.headers?.['referrer-policy'],
                }).map(([label, value]) => (
                  <HeaderCheck key={label} label={label} value={value} />
                ))}
              </div>
            </div>

            {/* Technology detection */}
            {result.technologies?.length > 0 && (
              <div className="p-6 rounded-2xl glass">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Code size={15} className="text-purple-400" /> Technology Detection
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.technologies.map((tech) => (
                    <span key={tech} className="px-3 py-1.5 rounded-full text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !scanning && !error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center py-20">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 bg-blue-500/10 border border-blue-500/20">
            <Shield size={36} className="text-blue-400" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">Guarded Scanning Ready</h3>
          <p className="text-gray-500 max-w-xs mx-auto text-xs leading-relaxed">
            Enter target URL domain paths to parse structure, redirects, certificates, and check reputation rating index.
          </p>
        </motion.div>
      )}
    </>
  )
}
