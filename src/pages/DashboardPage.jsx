import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  BarChart2, Shield, AlertTriangle, Clock, Zap,
  TrendingUp, ExternalLink, ChevronRight, Globe, Activity, Eye, ShieldAlert
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import StatCard from '@/components/cards/StatCard'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import { ScanAreaChart, ScanBarChart, SecurityPieChart } from '@/components/charts/ScanCharts'
import Badge from '@/components/common/Badge'
import { useQuery } from '@tanstack/react-query'
import { getDashboardStats, getScanHistory } from '@/services/scannerService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatDateTime, getScoreColor, getScoreLabel, truncate, timeAgo } from '@/utils/helpers'

const STAT_CARDS = [
  {
    title: 'Total Scans',
    valueKey: 'totalScans',
    icon: BarChart2,
    color: '#0A84FF',
    trend: true,
    trendValue: 12,
    subtitle: '+23 today',
  },
  {
    title: 'Safe URLs',
    valueKey: 'safeUrls',
    icon: Shield,
    color: '#30D158',
    trend: true,
    trendValue: 8,
    subtitle: '79% of total',
  },
  {
    title: 'Threats Detected',
    valueKey: 'unsafeUrls',
    icon: AlertTriangle,
    color: '#FF453A',
    trend: true,
    trendValue: -3,
    subtitle: '21% of total',
  },
  {
    title: 'Avg Response Time',
    valueKey: 'avgResponseTime',
    icon: Clock,
    color: '#FF9F0A',
    trend: true,
    trendValue: -5,
    subtitle: 'vs last week',
    suffix: 'ms',
  },
  {
    title: 'HTTPS Websites',
    valueKey: 'httpsWebsites',
    icon: Globe,
    color: '#32ADE6',
    trend: true,
    trendValue: 15,
    subtitle: '87% secured',
  },
]

function RecentScanRow({ scan, index }) {
  const navigate = useNavigate()
  const score = scan.score || 0
  const color = getScoreColor(score)
  const label = getScoreLabel(score)

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="table-row-hover cursor-pointer"
      onClick={() => navigate(`/scan/${scan.id}`)}
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={`https://www.google.com/s2/favicons?domain=${scan.domain}&sz=32`}
            alt=""
            className="w-6 h-6 rounded flex-shrink-0"
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <div>
            <div className="text-xs font-semibold text-white truncate max-w-[200px]">{scan.domain}</div>
            <div className="text-[10px] text-gray-500">{timeAgo(scan.scannedAt)}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-xs text-gray-400">{scan.responseTime}ms</span>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <Badge variant={scan.isHttps ? 'safe' : 'danger'} size="xs">
          {scan.isHttps ? 'HTTPS' : 'HTTP'}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold" style={{ color }}>{score}</div>
          <Badge variant={score >= 70 ? 'safe' : score >= 50 ? 'warning' : 'danger'} size="xs">
            {label}
          </Badge>
        </div>
      </td>
      <td className="px-4 py-3">
        <button className="text-gray-500 hover:text-blue-400 transition-colors cursor-pointer">
          <ExternalLink size={12} />
        </button>
      </td>
    </motion.tr>
  )
}

function QuickScanWidget() {
  const [url, setUrl] = useState('')
  const navigate = useNavigate()

  const handleScan = (e) => {
    e.preventDefault()
    if (!url.trim()) return
    const normalized = url.startsWith('http') ? url : `https://${url}`
    navigate(`/scanner?url=${encodeURIComponent(normalized)}`)
  }

  return (
    <div className="p-6 rounded-2xl glass">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={16} style={{ color: '#0A84FF' }} />
        <h3 className="text-sm font-semibold text-white">Quick Scan</h3>
      </div>
      <form onSubmit={handleScan} className="space-y-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste URL to execute scan... (e.g. apple.com)"
          className="input-dark text-xs"
          aria-label="URL to scan"
        />
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)' }}
        >
          <span className="flex items-center justify-center gap-2">
            <Shield size={14} /> Scan Now
          </span>
        </button>
      </form>
    </div>
  )
}

function RiskAnalyticsWidget({ stats }) {
  const total = stats.totalScans || 1
  const dangerRate = Math.round((stats.unsafeUrls / total) * 100)
  const safeRate = Math.round((stats.safeUrls / total) * 100)

  return (
    <div className="p-6 rounded-2xl glass">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert size={16} className="text-red-400" />
        <h3 className="text-sm font-semibold text-white">Threat Level Analytics</h3>
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-gray-400">Malicious Threat Vector</span>
            <span className="text-red-400">{dangerRate}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill bg-red-500" style={{ width: `${dangerRate}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-gray-400">Verified Secure Hosts</span>
            <span className="text-emerald-400">{safeRate}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill bg-emerald-500" style={{ width: `${safeRate}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ActivityTimelineWidget() {
  const events = [
    { id: 1, type: 'block', desc: 'SSRF Attack pattern blocked on domain-x.com', time: '10m ago' },
    { id: 2, type: 'cert', desc: 'Active TLS validation scan ran on checkout.stripe.com', time: '1h ago' },
    { id: 3, type: 'auth', desc: 'New API Key generated successfully', time: '3h ago' },
  ]

  return (
    <div className="p-6 rounded-2xl glass">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={16} className="text-blue-400" />
        <h3 className="text-sm font-semibold text-white">Security Activity Log</h3>
      </div>
      <div className="relative border-l border-white/[0.06] ml-2 pl-4 space-y-4">
        {events.map((ev) => (
          <div key={ev.id} className="relative">
            <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-blue-500 border border-black" />
            <div className="text-xs text-gray-300 font-medium">{ev.desc}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{ev.time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  
  const { data: dashboardData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  })

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['recentHistory'],
    queryFn: () => getScanHistory({ limit: 8 }),
  })

  if (statsLoading || historyLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const stats = dashboardData?.stats || {
    totalScans: 0,
    safeUrls: 0,
    unsafeUrls: 0,
    httpsWebsites: 0,
    avgResponseTime: 0,
    threatsBlocked: 0,
  }
  const chartData = dashboardData?.chartData || []
  const securityScoreData = dashboardData?.securityScoreData || []
  const recentScans = historyData?.data || []

  return (
    <>
      <Helmet>
        <title>Dashboard – SafeLink AI</title>
        <meta name="description" content="SafeLink AI dashboard with scan statistics, charts, and recent scan history." />
      </Helmet>

      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h2>
        <p className="text-gray-400 text-xs mt-1">Here's your real-time security dashboard feed.</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {STAT_CARDS.map((card, i) => {
          const rawVal = stats[card.valueKey] || 0
          return (
            <StatCard
              key={card.title}
              title={card.title}
              value={<AnimatedCounter target={rawVal} suffix={card.suffix || ''} />}
              subtitle={card.subtitle}
              icon={card.icon}
              color={card.color}
              trend={card.trend}
              trendValue={card.trendValue}
              index={i}
            />
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <ScanAreaChart data={chartData} />
        </div>
        <SecurityPieChart data={securityScoreData} />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent scans table */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden glass">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-white">Recent Scans</h3>
            <Link to="/history" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {['URL', 'Response', 'Protocol', 'Score', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 first:table-cell">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentScans.map((scan, i) => (
                  <RecentScanRow key={scan.id} scan={scan} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <QuickScanWidget />
          <RiskAnalyticsWidget stats={stats} />
          <ActivityTimelineWidget />
          <ScanBarChart data={chartData} />
        </div>
      </div>
    </>
  )
}
