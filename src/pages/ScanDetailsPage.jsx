import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  ArrowLeft, Shield, CheckCircle, XCircle, Globe, Clock,
  Lock, Server, Code, Eye, AlertTriangle, ChevronRight,
  BarChart2, ExternalLink, RefreshCw, Download
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getScanById } from '@/services/scannerService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  getScoreColor, getScoreLabel, formatMs, formatDateTime,
  getStatusColor, getStatusLabel
} from '@/utils/helpers'
import SecurityScoreCard from '@/components/cards/SecurityScoreCard'
import Badge from '@/components/common/Badge'

function InfoRow({ label, value, mono = false }) {
  if (!value) return null
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-white/[0.04] last:border-0 gap-4">
      <span className="text-xs text-gray-500 flex-shrink-0">{label}</span>
      <span className={`text-xs text-gray-300 text-right break-all max-w-[260px] ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function SectionCard({ title, icon: Icon, color = '#3B82F6', children }) {
  return (
    <div className="p-6 rounded-2xl" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
      <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
        <Icon size={15} style={{ color }} />
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function ScanDetailsPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'headers' | 'ssl' | 'geoip'

  const { data: scan, isLoading, error } = useQuery({
    queryKey: ['scan', id],
    queryFn: () => getScanById(id),
    initialData: location.state?.scan,
  })

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !scan) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="text-red-400 font-medium mb-3">Failed to load scan report</div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>
    )
  }

  const scoreColor = getScoreColor(scan.score)

  const tabVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, x: 10, transition: { duration: 0.15 } }
  }

  return (
    <>
      <Helmet>
        <title>Scan Report – {scan.domain} – SafeLink AI</title>
        <meta name="description" content={`Complete security scan report for ${scan.domain}`} />
      </Helmet>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl"
          style={{
            background: '#111827',
            border: `1px solid ${scoreColor}25`,
            boxShadow: `0 0 30px ${scoreColor}06`,
          }}>
          <div className="flex items-center gap-4">
            <img
              src={scan.metadata?.favicon}
              alt=""
              className="w-12 h-12 rounded-xl"
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant={scan.score >= 70 ? 'safe' : scan.score >= 50 ? 'warning' : 'danger'} dot>
                  {getScoreLabel(scan.score)}
                </Badge>
                <Badge variant={scan.isHttps ? 'safe' : 'danger'} size="xs">
                  {scan.isHttps ? 'HTTPS' : 'HTTP'}
                </Badge>
              </div>
              <h1 className="text-xl font-bold text-white">{scan.domain}</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Scanned on {formatDateTime(scan.scannedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-4xl font-black" style={{ color: scoreColor }}>{scan.score}</div>
              <div className="text-xs text-gray-400">Security Score</div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate('/scanner', { state: { url: scan.url } })}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all cursor-pointer"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <RefreshCw size={14} /> Re-scan
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab bar navigation */}
      <div className="flex border-b border-white/[0.08] mb-6 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart2 },
          { id: 'headers', label: 'Security Headers', icon: Lock },
          { id: 'ssl', label: 'SSL & Connections', icon: Shield },
          { id: 'geoip', label: 'Geo-IP & Meta', icon: Globe },
        ].map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-blue-500/[0.02]'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Dynamic Sub-Page panels content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tabVariants}
            className="space-y-6"
          >
            {/* Quick stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Clock, label: 'Response Time', value: formatMs(scan.responseTime), color: '#3B82F6' },
                { icon: RefreshCw, label: 'Redirects', value: `${scan.redirectCount}`, color: '#F59E0B' },
                { icon: BarChart2, label: 'HTTP Status', value: getStatusLabel(scan.httpStatus), color: getStatusColor(scan.httpStatus) },
                { icon: Server, label: 'Server', value: scan.headers?.server || 'Unknown', color: '#8B5CF6' },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-xl" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: `${item.color}15` }}>
                    <item.icon size={16} style={{ color: item.color }} />
                  </div>
                  <div className="text-sm font-semibold text-white truncate">{item.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Recommendation box */}
            {scan.score < 70 && (
              <div
                className="flex items-start gap-4 p-5 rounded-2xl"
                style={{
                  background: scan.score < 50 ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
                  border: `1px solid ${scan.score < 50 ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                }}
              >
                <AlertTriangle size={20} style={{ color: scan.score < 50 ? '#EF4444' : '#F59E0B', flexShrink: 0 }} />
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Security Recommendation</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {scan.score < 50
                      ? 'This URL shows signs of potential security risks. We recommend avoiding visiting this site and not sharing any personal information with it.'
                      : 'This URL has some minor security concerns. Some security headers are missing that could improve protection. Use caution when sharing sensitive information.'
                    }
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SecurityScoreCard score={scan.score} checks={scan.securityChecks} />

              <SectionCard title="Technology Stack" icon={Code} color="#A855F7">
                {scan.technologies && scan.technologies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {scan.technologies.map((tech) => (
                      <span key={tech} className="px-3 py-1.5 rounded-full text-xs font-medium text-gray-300"
                        style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 py-3">No software technologies identified in metadata tags.</div>
                )}
              </SectionCard>
            </div>

            {/* WHOIS */}
            <SectionCard title="Domain Registration Details" icon={Globe} color="#F59E0B">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Registrar', value: scan.whois?.registrar },
                  { label: 'Created', value: scan.whois?.createdAt },
                  { label: 'Expires', value: scan.whois?.expiresAt },
                  { label: 'Country', value: scan.whois?.country },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="text-xs text-gray-500 mb-1">{label}</div>
                    <div className="text-sm font-medium text-white truncate">{value || '—'}</div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </motion.div>
        )}

        {activeTab === 'headers' && (
          <motion.div
            key="headers"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tabVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Security headers */}
            <SectionCard title="Security Headers Audit" icon={Lock} color="#22C55E">
              {Object.entries({
                'Strict-Transport-Security': scan.headers?.['strict-transport-security'],
                'Content-Security-Policy': scan.headers?.['content-security-policy'],
                'X-Frame-Options': scan.headers?.['x-frame-options'],
                'X-Content-Type-Options': scan.headers?.['x-content-type-options'],
                'X-XSS-Protection': scan.headers?.['x-xss-protection'],
                'Referrer-Policy': scan.headers?.['referrer-policy'],
                'Permissions-Policy': scan.headers?.['permissions-policy'],
              }).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {value ? <CheckCircle size={13} className="text-green-400 flex-shrink-0" /> : <XCircle size={13} className="text-red-400 flex-shrink-0" />}
                    <span className="text-xs text-gray-400 truncate">{label}</span>
                  </div>
                  {value
                    ? <span className="text-xs text-gray-500 max-w-[200px] truncate">{value}</span>
                    : <span className="text-xs text-red-400 flex-shrink-0">Missing</span>
                  }
                </div>
              ))}
            </SectionCard>

            {/* All response headers */}
            <SectionCard title="All Response Headers" icon={Server} color="#8B5CF6">
              <div className="max-h-[380px] overflow-y-auto pr-1 space-y-1">
                {Object.entries(scan.headers || {}).filter(([_, v]) => v).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-white/[0.04] last:border-0 gap-3">
                    <span className="text-xs text-gray-500 font-mono flex-shrink-0">{key}</span>
                    <span className="text-xs text-gray-300 text-right break-all max-w-[240px] font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </motion.div>
        )}

        {activeTab === 'ssl' && (
          <motion.div
            key="ssl"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tabVariants}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SSL details */}
              <SectionCard title="SSL/TLS Certificate Details" icon={Lock} color="#06B6D4">
                {scan.ssl ? (
                  <>
                    <InfoRow label="Common Name (Subject)" value={scan.ssl.subject} />
                    <InfoRow label="Issuer Authority" value={scan.ssl.issuer} />
                    <InfoRow label="Signature Algorithm" value={scan.ssl.sigAlg} />
                    <InfoRow label="Key Strength" value={`${scan.ssl.bits} bits`} />
                    <InfoRow label="Days Remaining" value={`${scan.ssl.daysRemaining} days`} />
                    <InfoRow label="Validity Status" value={scan.ssl.authorized ? 'Authorized' : `Warning: ${scan.ssl.error || 'Self-signed'}`} />
                  </>
                ) : (
                  <div className="text-xs text-gray-500 py-3">No SSL details available. The connection was made over unencrypted HTTP.</div>
                )}
              </SectionCard>

              {/* Redirect chain */}
              <SectionCard title="Redirect Chain Trace" icon={ChevronRight} color="#F59E0B">
                {scan.redirectChain && scan.redirectChain.length > 0 ? (
                  <div className="space-y-3">
                    {scan.redirectChain.map((step, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-xs font-mono px-2 py-0.5 rounded"
                          style={{ background: getStatusColor(step.status) + '20', color: getStatusColor(step.status) }}>
                          {step.status}
                        </span>
                        <span className="text-xs text-gray-400 flex-1 truncate">{step.url}</span>
                        <span className="text-xs text-gray-600">{step.method}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 py-3">No redirect hops detected. The URL loaded on the first query.</div>
                )}
              </SectionCard>
            </div>
          </motion.div>
        )}

        {activeTab === 'geoip' && (
          <motion.div
            key="geoip"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tabVariants}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Server geolocation */}
              <SectionCard title="Server Location & Network" icon={Globe} color="#3B82F6">
                {scan.geoIp ? (
                  <>
                    <InfoRow label="Hosting ISP" value={scan.geoIp.isp} />
                    <InfoRow label="Hosting Country" value={`${scan.geoIp.country} (${scan.geoIp.countryCode})`} />
                    <InfoRow label="Hosting City" value={scan.geoIp.city} />
                    <InfoRow label="IP Version" value={`IPv${scan.geoIp.ipVersion}`} />
                  </>
                ) : (
                  <div className="text-xs text-gray-500 py-3">No Geo-IP coordinates could be resolved.</div>
                )}
              </SectionCard>

              {/* Page Metadata */}
              <SectionCard title="HTML Page Metadata" icon={Eye} color="#06B6D4">
                <InfoRow label="Title" value={scan.metadata?.title} />
                <InfoRow label="Description" value={scan.metadata?.description} />
                <InfoRow label="Canonical URL" value={scan.metadata?.canonical} />
                <InfoRow label="Generator" value={scan.metadata?.generator} />
                <InfoRow label="Charset" value={scan.metadata?.charset} />
                <InfoRow label="Language" value={scan.metadata?.language} />
              </SectionCard>
            </div>

            {/* OG & Twitter Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SectionCard title="Open Graph Metadata" icon={Globe} color="#06B6D4">
                {scan.openGraph && Object.keys(scan.openGraph).length > 0 ? (
                  Object.entries(scan.openGraph).map(([key, value]) => value && (
                    <InfoRow key={key} label={`og:${key}`} value={value} />
                  ))
                ) : (
                  <div className="text-xs text-gray-500 py-3">No Open Graph protocols declared.</div>
                )}
              </SectionCard>

              <SectionCard title="Twitter Cards Metadata" icon={Globe} color="#1DA1F2">
                {scan.twitterCard && Object.keys(scan.twitterCard).length > 0 ? (
                  Object.entries(scan.twitterCard).map(([key, value]) => value && (
                    <InfoRow key={key} label={`twitter:${key}`} value={value} />
                  ))
                ) : (
                  <div className="text-xs text-gray-500 py-3">No Twitter Cards metadata detected.</div>
                )}
              </SectionCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
