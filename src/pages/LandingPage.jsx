import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  Shield, Zap, Brain, Globe, Lock, ChevronRight, CheckCircle,
  Star, ArrowRight, BarChart2, Clock, Server, Eye, Search,
  Cpu, Database, Code, Award, Sparkles, Send, Activity, HelpCircle, Layers
} from 'lucide-react'
import { normalizeUrl, isValidUrl } from '@/utils/helpers'

// ── Typing Animation Component ──
function TypingText() {
  const words = ["URL Safety", "Threat Intelligence", "Website Audits", "Phishing Shield"]
  const [index, setIndex] = useState(0)
  const [subIndex, setSubIndex] = useState(0)
  const [reverse, setReverse] = useState(false)
  const [blink, setBlink] = useState(true)

  // Blinking cursor
  useEffect(() => {
    const timer = setInterval(() => setBlink(b => !b), 500)
    return () => clearInterval(timer)
  }, [])

  // Typing logic
  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => setReverse(true), 2000)
      return () => clearTimeout(timeout)
    }
    if (subIndex === 0 && reverse) {
      setReverse(false)
      setIndex((prev) => (prev + 1) % words.length)
      return
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1))
    }, reverse ? 75 : 150)

    return () => clearTimeout(timeout)
  }, [subIndex, reverse, index])

  return (
    <span className="gradient-text whitespace-nowrap font-extrabold">
      {words[index].substring(0, subIndex)}
      <span className={blink ? 'opacity-100' : 'opacity-0'} style={{ color: '#3B82F6' }}>|</span>
    </span>
  )
}

// ── Animated Counter ──────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    const step = target / 60
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ── Section Wrapper ────────────────────────────────────────
function Section({ children, className = '', id, style }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  )
}

const FEATURES = [
  {
    icon: Brain, color: '#3B82F6',
    title: 'AI-Powered Analysis',
    description: 'Advanced machine learning models analyze URLs in real-time to detect phishing, malware, and suspicious patterns with 99.7% accuracy.',
  },
  {
    icon: Zap, color: '#06B6D4',
    title: 'Instant Results',
    description: 'Get comprehensive security reports in under 2 seconds. Our distributed scanning infrastructure ensures lightning-fast response times.',
  },
  {
    icon: Globe, color: '#22C55E',
    title: 'Deep Web Intelligence',
    description: 'Extract metadata, headers, technologies, open graph data, and security configurations from any website automatically.',
  },
  {
    icon: Lock, color: '#F59E0B',
    title: 'SSL & Security Headers',
    description: 'Verify HTTPS certificates, HSTS policies, CSP headers, and all security configurations that protect users.',
  },
  {
    icon: BarChart2, color: '#8B5CF6',
    title: 'Analytics Dashboard',
    description: 'Track your scan history, monitor threat trends, and gain insights into your organization\'s URL security posture.',
  },
  {
    icon: Code, color: '#EF4444',
    title: 'Developer API',
    description: 'Integrate URL scanning directly into your applications with our REST API. SDKs available for Python, Node.js, and more.',
  },
]

const STATS = [
  { value: 50, suffix: 'M+', label: 'URLs Scanned' },
  { value: 2100000, suffix: '+', label: 'Threats Detected' },
  { value: 99.7, suffix: '%', label: 'Detection Accuracy' },
  { value: 500, suffix: '+', label: 'Enterprise Customers' },
]

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Security Engineer @ Stripe',
    content: 'SafeLink AI has become an essential tool in our security stack. The accuracy is impressive and the API integration was seamless.',
    rating: 5,
    avatar: 'SC',
  },
  {
    name: 'Marcus Rodriguez',
    role: 'CTO @ TechVenture',
    content: 'We integrated SafeLink into our phishing detection workflow and reduced false positives by 60%. Incredible product.',
    rating: 5,
    avatar: 'MR',
  },
  {
    name: 'Emily Watson',
    role: 'Head of Security @ Finova',
    content: 'The real-time threat detection and detailed metadata extraction saves our team hours every week. Highly recommend.',
    rating: 5,
    avatar: 'EW',
  },
]

const PLANS = [
  {
    name: 'Starter',
    price: 0,
    period: 'forever',
    description: 'Perfect for individuals and small projects',
    features: ['500 scans/month', 'Basic metadata', 'Security score', 'API access (limited)', '7-day history'],
    cta: 'Start Free',
    to: '/register',
    highlight: false,
  },
  {
    name: 'Professional',
    price: 29,
    period: '/month',
    description: 'For teams and growing businesses',
    features: ['5,000 scans/month', 'Full metadata extraction', 'Advanced AI analysis', 'Priority API access', '90-day history', 'Webhook support', 'Email alerts'],
    cta: 'Start Trial',
    to: '/register',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 99,
    period: '/month',
    description: 'For large organizations with custom needs',
    features: ['Unlimited scans', 'Custom AI models', 'Dedicated infrastructure', 'SLA guarantee', 'Unlimited history', 'Custom integrations', 'Priority support'],
    cta: 'Contact Sales',
    to: '/register',
    highlight: false,
  },
]

const FAQS = [
  {
    q: 'How accurate is the URL safety detection?',
    a: 'Our AI model achieves 99.7% accuracy on our benchmark dataset, combining machine learning with real-time threat intelligence feeds from multiple sources.',
  },
  {
    q: 'How fast are the scan results?',
    a: 'Most scans complete in under 2 seconds. Complex websites with multiple redirects may take up to 5 seconds for a comprehensive analysis.',
  },
  {
    q: 'Can I integrate SafeLink into my application?',
    a: 'Yes! We provide a REST API with SDKs for Python, Node.js, Go, and PHP. Our API documentation is comprehensive and includes code examples.',
  },
  {
    q: 'What data do you collect about scanned URLs?',
    a: 'We store scan results for your history and analytics. URLs are analyzed but never shared with third parties. See our Privacy Policy for full details.',
  },
  {
    q: 'Is there a free tier available?',
    a: 'Yes, our Starter plan is free forever with 500 scans per month — no credit card required.',
  },
]

function FAQItem({ question, answer, index }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
      className="rounded-2xl overflow-hidden glass"
    >
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.02] transition-all cursor-pointer"
        aria-expanded={open}
      >
        <span className="font-medium text-white pr-4">{question}</span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-gray-400"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          +
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        <p className="px-6 pb-5 text-sm text-gray-400 leading-relaxed">{answer}</p>
      </motion.div>
    </motion.div>
  )
}

// ── Brand Logos Marquee ──
function BrandMarquee() {
  const brands = ["Stripe", "Vercel", "Linear", "Microsoft", "AWS", "Google Cloud", "Cloudflare", "GitHub", "CrowdStrike"]
  return (
    <div className="w-full overflow-hidden relative py-8 border-y border-white/[0.04] bg-white/[0.01]">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
      <div className="flex w-[200%] animate-marquee gap-16 items-center whitespace-nowrap">
        {/* Double array for endless scrolling loop */}
        {[...brands, ...brands].map((brand, i) => (
          <div key={i} className="text-gray-600 dark:text-gray-500 hover:text-blue-400 transition-colors font-bold text-lg tracking-wider flex items-center gap-2">
            <Sparkles size={14} className="text-blue-500/50" />
            {brand.toUpperCase()}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  )
}

// ── Interactive Timeline (How it works) ──
function HowItWorks() {
  const steps = [
    {
      title: "URL Submission",
      desc: "User submits a target domain or endpoint to scan safely.",
      icon: Search,
      color: "#0A84FF"
    },
    {
      title: "SSRF & DNS Validation",
      desc: "SafeLink DNS guard validates routing limits, preventing local SSRF attack vectors.",
      icon: Lock,
      color: "#5E5CE6"
    },
    {
      title: "Deep Security Audit",
      desc: "Distributed server-crawlers inspect active SSL certificate, WHOIS details, headers, and redirects.",
      icon: Layers,
      color: "#30D158"
    },
    {
      title: "AI Threat Decision",
      desc: "Our machine learning parser scores the payload and creates remediation recommendations.",
      icon: Brain,
      color: "#FF9F0A"
    }
  ]

  return (
    <div className="relative py-8">
      <div className="absolute left-[33px] md:left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-emerald-500" />
      <div className="space-y-12">
        {steps.map((step, i) => {
          const isEven = i % 2 === 0
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: isEven ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col md:flex-row items-start md:items-center ${isEven ? 'md:flex-row-reverse' : ''}`}
            >
              <div className="w-full md:w-1/2 px-8 flex justify-start md:justify-end">
                <div className="w-full max-w-sm p-6 rounded-2xl glass hover:scale-[1.02] transition-transform">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${step.color}15` }}>
                    <step.icon size={20} style={{ color: step.color }} />
                  </div>
                  <h4 className="font-semibold text-white text-base mb-1">{step.title}</h4>
                  <p className="text-sm text-gray-400">{step.desc}</p>
                </div>
              </div>
              <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full bg-black border-2 flex items-center justify-center" style={{ borderColor: step.color }}>
                <span className="text-[10px] font-bold text-white">{i + 1}</span>
              </div>
              <div className="w-full md:w-1/2 hidden md:block" />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ── Interactive Architecture Diagram ──
function ArchitectureDiagram() {
  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl p-8 glass overflow-hidden border border-white/[0.08]">
      <h3 className="text-center font-bold text-white text-lg mb-8 flex items-center justify-center gap-2">
        <Layers size={18} className="text-blue-400" /> Multi-Tiered AI Security Infrastructure
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
        {[
          { title: "Safelink Gateway", host: "API Router", detail: "Edge WAF Filtering" },
          { title: "SSRF DNS Guard", host: "Sandboxed Resolver", detail: "Loopback Range Protection" },
          { title: "Metadata Crawler", host: "Headless Crawlers", detail: "SSL/Headers Checker" },
          { title: "AI Decision Engine", host: "LLM Parser Node", detail: "Threat Classification" }
        ].map((node, i) => (
          <div key={i} className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center hover:bg-white/[0.04] transition-all relative">
            {i < 3 && (
              <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-500/60 to-purple-500/60 z-0 animate-pulse" />
            )}
            <div className="text-xs font-semibold text-blue-400 mb-1">{node.host}</div>
            <div className="font-bold text-white text-sm mb-2">{node.title}</div>
            <div className="text-[11px] text-gray-500">{node.detail}</div>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
    </div>
  )
}

// ── MAIN COMPONENT ─────────────────────────────────────────
export default function LandingPage() {
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [emailSub, setEmailSub] = useState('')
  const [isSubbed, setIsSubbed] = useState(false)
  const navigate = useNavigate()

  const handleScan = (e) => {
    e.preventDefault()
    if (!url.trim()) { setUrlError('Please enter a URL to scan'); return }
    const normalized = normalizeUrl(url.trim())
    if (!isValidUrl(normalized)) { setUrlError('Please enter a valid URL'); return }
    setUrlError('')
    navigate(`/scanner?url=${encodeURIComponent(normalized)}`)
  }

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!emailSub.trim() || !emailSub.includes('@')) return
    setIsSubbed(true)
    setEmailSub('')
  }

  return (
    <>
      <Helmet>
        <title>SafeLink AI – AI-Powered URL Safety & Website Intelligence</title>
        <meta name="description" content="SafeLink AI analyzes any URL for malware, phishing, and security vulnerabilities. Get instant security scores, metadata, and threat intelligence." />
      </Helmet>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 glass"
            style={{
              borderColor: 'rgba(10,132,255,0.3)',
              color: '#0A84FF',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            Empowering modern cybersecurity with <Sparkles size={12} className="inline ml-1" /> AI
            <ChevronRight size={14} />
          </motion.div>

          {/* 3D Floating SVG Shield Container */}
          <motion.div
            animate={{ y: [0, -12, 0], rotateY: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="mb-8 cursor-pointer relative"
          >
            <svg width="100" height="110" viewBox="0 0 100 110" fill="none" className="drop-shadow-[0_0_30px_rgba(10,132,255,0.4)]">
              <path d="M50 5L15 20V50C15 75 50 100 50 100C50 100 85 75 85 50V20L50 5Z" fill="url(#shieldGlow)" stroke="#0A84FF" strokeWidth="2" />
              <path d="M50 15L25 25V48C25 68 50 86 50 86C50 86 75 68 75 48V25L50 15Z" stroke="#30D158" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M42 55L48 61L58 45" stroke="#30D158" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="shieldGlow" x1="0" y1="0" x2="100" y2="110">
                  <stop offset="0%" stopColor="rgba(10,132,255,0.2)" />
                  <stop offset="100%" stopColor="rgba(94,92,230,0.05)" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Dynamic Headline with Typing Text */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6"
          >
            Next-Gen <TypingText />
            <br />& Intelligence Core
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Instantly audit any link against SSRF exploits, phishing vectors, and TLS flaws. 
            Receive structural suggestions powered by real-time intelligence nodes.
          </motion.p>

          {/* URL Input */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleScan}
            className="relative w-full max-w-2xl mx-auto mb-6"
          >
            <div className="flex gap-3 p-2 rounded-2xl glass">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Search size={18} className="text-gray-500 flex-shrink-0" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setUrlError('') }}
                  placeholder="Paste URL to execute security scan... (e.g. google.com)"
                  className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm outline-none"
                  aria-label="URL to scan"
                  aria-invalid={!!urlError}
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white whitespace-nowrap cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)' }}
              >
                <Shield size={16} />
                Scan Now
              </motion.button>
            </div>
            {urlError && (
              <p className="mt-2 text-sm text-red-400 text-left px-2">⚠ {urlError}</p>
            )}
          </motion.form>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500"
          >
            {['Public Guest Scanning', 'SSRF Validation Active', '99.9% Cloud Uptime', 'Zero Logs Stored'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400" />
                {item}
              </div>
            ))}
          </motion.div>

          {/* Hero mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 relative w-full"
          >
            <div className="relative mx-auto max-w-3xl rounded-2xl overflow-hidden glass">
              {/* Mock browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 flex items-center gap-2 ml-4 px-3 py-1 rounded-lg text-[11px] text-gray-500 max-w-md bg-black/30">
                  <Lock size={10} className="text-emerald-400" />
                  safelink.ai/dashboard
                </div>
              </div>

              {/* Mock scan results inside browser frame */}
              <div className="p-6 space-y-4 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10">
                      <Shield size={20} className="text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">https://github.com</div>
                      <div className="text-xs text-emerald-400">Security Audit Completed • Safe</div>
                    </div>
                  </div>
                  <div className="text-right mt-2 sm:mt-0">
                    <div className="text-2xl font-bold text-emerald-400">96 / 100</div>
                    <div className="text-[10px] text-gray-500">Security Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'TLS Validation', value: 'ECC 256-bit', color: '#30D158' },
                    { label: 'DNS Health', value: 'SECURE', color: '#0A84FF' },
                    { label: 'CSP Policy', value: 'Strict Header', color: '#30D158' },
                    { label: 'SSRF Status', value: 'GUARDED', color: '#FF9F0A' },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl text-center bg-white/[0.01] border border-white/[0.04]">
                      <div className="text-xs font-semibold" style={{ color: item.color }}>{item.value}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── BRAND LOGOS MARQUEE ── */}
      <BrandMarquee />

      {/* ── STATS ── */}
      <Section className="py-20 border-y border-white/[0.04] bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl font-extrabold gradient-text-blue mb-2">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── ARCHITECTURE SECTION ── */}
      <Section className="py-24 px-4 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4 glass text-blue-400">
              <Layers size={12} /> System Design
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">How SafeLink AI Works</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Our framework is built to parse and evaluate endpoints in split-seconds, maintaining safety boundaries.
            </p>
          </div>
          <ArchitectureDiagram />
          <div className="mt-16">
            <HowItWorks />
          </div>
        </div>
      </Section>

      {/* ── FEATURES ── */}
      <Section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4 glass text-blue-400">
              <Cpu size={12} /> Features
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Next-Gen <span className="gradient-text">Core Guard</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Deep link profiling, cookie audits, SSL strength testing, and custom headers security reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl group cursor-default glass"
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `${feature.color}30`
                  e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px ${feature.color}15`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = ''
                  e.currentTarget.style.boxShadow = ''
                }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}25` }}>
                  <feature.icon size={20} style={{ color: feature.color }} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── TESTIMONIALS ── */}
      <Section className="py-24 px-4 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4 glass text-emerald-400">
              <Award size={12} /> Testimonials
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Trusted globally by elite teams</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl glass"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-6">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)' }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── PRICING ── */}
      <Section id="pricing" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4 glass text-purple-400">
              <Database size={12} /> Pricing Plans
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Simple, predictable pricing</h2>
            <p className="text-gray-400">Scale scanning capacity seamlessly as query sizes expand.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative p-6 rounded-2xl glass"
                style={plan.highlight ? {
                  borderColor: 'rgba(10,132,255,0.4)',
                  boxShadow: '0 0 30px rgba(10,132,255,0.1)',
                } : {}}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)' }}>
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-gray-500 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white">${plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                      <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.to}
                  className="block text-center py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] cursor-pointer"
                  style={plan.highlight
                    ? { background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)', color: 'white' }
                    : { background: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }
                  }
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── FAQ ── */}
      <Section id="faq" className="py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4 glass text-yellow-400">
              <HelpCircle size={12} /> Help Center
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400 font-medium">Clear insights into SafeLink scanner functionality.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} index={i} />
            ))}
          </div>
        </div>
      </Section>

      {/* ── CTA / NEWSLETTER SIGNUP ── */}
      <Section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl overflow-hidden glass">
            <div className="absolute inset-0 grid-pattern opacity-10" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Secure your user routes <span className="gradient-text">today</span>
              </h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
                Join threat responders utilizing SafeLink metrics. Sign up to receive intelligence reports and critical CVE alerts.
              </p>

              {/* Newsletter Sub Form */}
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8">
                <input
                  type="email"
                  value={emailSub}
                  onChange={(e) => setEmailSub(e.target.value)}
                  placeholder="Enter email to get security updates"
                  className="flex-1 input-dark text-xs"
                  required
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)' }}
                >
                  <Send size={12} /> {isSubbed ? 'Subscribed!' : 'Subscribe'}
                </button>
              </form>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)' }}
                >
                  Get Started Free
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/scanner"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold text-gray-300 transition-all hover:text-white hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Try Scanner
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
