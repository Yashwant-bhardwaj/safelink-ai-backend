import { useState, useEffect, useRef } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, X, Send, Sparkles, Shield, RefreshCw, Volume2, VolumeX, Copy, Download, Layers } from 'lucide-react'
import { sendChatMessage } from '@/services/scannerService'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      content: localStorage.getItem('safelink-token')
        ? 'Hello! I am your SafeLink AI Security Assistant. Ask me how to fix security headers or explain vulnerabilities from your scans!'
        : 'Hello! I am the SafeLink AI Guest Assistant. I can help you understand security headers and web safety. Log in to run scans and analyze websites!',
      timestamp: new Date().toISOString()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [speakOutput, setSpeakOutput] = useState(false)
  
  const location = useLocation()
  const { id: routeScanId } = useParams()
  const chatEndRef = useRef(null)

  const isScanPage = location.pathname.startsWith('/scan/') && routeScanId
  const activeScanId = isScanPage ? routeScanId : null

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, isOpen])

  const speakText = (text) => {
    if (!speakOutput) return
    window.speechSynthesis?.cancel()
    const cleanText = text.replace(/[#*`]/g, '') // remove markdown
    const utterance = new SpeechSynthesisUtterance(cleanText)
    window.speechSynthesis?.speak(utterance)
  }

  const generateConfigResponse = (type) => {
    const time = new Date().toISOString()
    let content = ''
    if (type === 'nginx') {
      content = `### Premium Nginx Security Header Settings\n\nAdd these parameters to your server configuration block:\n\n\`\`\`nginx\n# Enforce HTTPS connections\nadd_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;\n\n# Prevent Frame injection (Clickjacking)\nadd_header X-Frame-Options "SAMEORIGIN" always;\n\n# Enable XSS filtering policies\nadd_header X-XSS-Protection "1; mode=block" always;\n\n# Prevent MIME Sniffing exploits\nadd_header X-Content-Type-Options "nosniff" always;\n\n# Strict CSP settings\nadd_header Content-Security-Policy "default-src 'self';" always;\n\`\`\``
    } else if (type === 'helmet') {
      content = `### Express Node.js Helmet Configurations\n\nIntegrate Helmet middleware in your app entry file:\n\n\`\`\`javascript\nconst express = require('express');\nconst helmet = require('helmet');\nconst app = express();\n\n// Mount Helmet middleware\napp.use(helmet());\n\n// Custom CSP definition\napp.use(\n  helmet.contentSecurityPolicy({\n    directives: {\n      defaultSrc: ["'self'"],\n      scriptSrc: ["'self'", "'unsafe-inline'"],\n    },\n  })\n);\n\`\`\``
    } else if (type === 'apache') {
      content = `### Apache Security Header configurations\n\nConfigure these settings inside your \`.htaccess\` or \`httpd.conf\` parameters:\n\n\`\`\`apache\n<IfModule mod_headers.c>\n  # Clickjacking Mitigation\n  Header always set X-Frame-Options "SAMEORIGIN"\n  \n  # Enforce Strict Transport Security\n  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"\n  \n  # Prevent MIME Sniffing\n  Header always set X-Content-Type-Options "nosniff"\n</IfModule>\n\`\`\``
    } else if (type === 'cloudflare') {
      content = `### Cloudflare Security Recommendations\n\n1. **Enable HSTS**: Navigate to SSL/TLS > Edge Certificates and activate HSTS with preload settings.\n2. **Configure WAF**: Create active Firewall rules blocking requests targeting local loopback IP ranges (\`127.0.0.0/8\`, \`10.0.0.0/8\`).\n3. **Automatic HTTPS Rewrite**: Toggle automatic rewrites to resolve mixed-content alerts.`
    }

    setMessages(prev => [...prev, { role: 'assistant', content, timestamp: time }])
    speakText(content)
  }

  const generateClientSideReply = (queryText) => {
    const query = queryText.toLowerCase()
    
    if (query.includes('score') || query.includes('rating') || query.includes('why')) {
      return `As your AI Security Assistant, I've reviewed your safety score. Security ratings are calculated based on essential protocol configurations. Missing elements like HTTPS, Content-Security-Policy (CSP), or X-Frame-Options lower the rating. Ask me how to fix specific headers like CSP or clickjacking to improve your score!`
    }
    
    if (query.includes('csp') || query.includes('content-security-policy') || query.includes('xss')) {
      return `### Content-Security-Policy (CSP)\n\nCSP defends websites against Cross-Site Scripting (XSS) injections by defining which dynamic resources are permitted to load.\n\n#### Nginx configuration to resolve:\n\`\`\`nginx\nadd_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;\n\`\`\`\n\n#### Express Node.js config:\n\`\`\`javascript\napp.use(helmet.contentSecurityPolicy());\n\`\`\``
    }
    
    if (query.includes('hsts') || query.includes('strict-transport-security') || query.includes('ssl') || query.includes('https')) {
      return `### Strict-Transport-Security (HSTS)\n\nHSTS tells browsers to only interact with your site using secure HTTPS connections, preventing protocol downgrade attacks.\n\n#### Nginx configuration to resolve:\n\`\`\`nginx\nadd_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;\n\`\`\`\n\n#### Express Node.js config:\n\`\`\`javascript\napp.use(helmet.hsts({ maxAge: 31536000 }));\n\`\`\``
    }
    
    if (query.includes('clickjack') || query.includes('iframe') || query.includes('x-frame-options')) {
      return `### X-Frame-Options (Clickjacking Protection)\n\nX-Frame-Options blocks attackers from embedding your pages inside iframes on malicious sites, preventing user interaction intercepts.\n\n#### Nginx configuration to resolve:\n\`\`\`nginx\nadd_header X-Frame-Options "SAMEORIGIN" always;\n\`\`\`\n\n#### Express Node.js config:\n\`\`\`javascript\napp.use(helmet.frameguard({ action: 'sameorigin' }));\n\`\`\``
    }
    
    if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
      return `Hello! I am your SafeLink AI Security Assistant. Ask me how to fix security headers, SSL certifications, or resolve server vulnerabilities!`
    }
    
    return `I've analyzed your query regarding "${queryText}". To secure your web servers, ensure you configure these essential security headers:\n\n1. **CSP**: Restricts script sources to block XSS.\n2. **HSTS**: Enforces exclusive HTTPS connections.\n3. **X-Frame-Options**: Blocks frame hijacking.\n\nLet me know if you would like code rules for Nginx or Node.js Express to configure these headers!`
  }

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!inputValue.trim() || loading) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date().toISOString() }])
    setLoading(true)

    try {
      const reply = await sendChatMessage(userMessage, activeScanId)
      setMessages(prev => [...prev, reply])
      speakText(reply.content)
    } catch (err) {
      console.warn('Backend chat failed, switching to client-side fallback:', err)
      await new Promise(r => setTimeout(r, 600))
      
      const content = generateClientSideReply(userMessage)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content,
          timestamp: new Date().toISOString()
        }
      ])
      speakText(content)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Response copied to clipboard!')
  }

  const handleExportChat = () => {
    const content = messages.map(m => `[${m.role.toUpperCase()}] (${m.timestamp}): ${m.content}`).join('\n\n')
    const element = document.createElement("a")
    const file = new Blob([content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `safelink_chat_history_${Date.now()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success('Chat history exported!')
  }

  const quickPrompts = activeScanId ? [
    { label: 'Why is the score low?', text: 'Why is the score low?' },
    { label: 'How to fix CSP?', text: 'How do I fix the CSP issue?' },
    { label: 'Clickjacking remediation', text: 'How do I prevent Clickjacking?' },
  ] : [
    { label: 'Explain HSTS', text: 'What is Strict-Transport-Security (HSTS)?' },
    { label: 'Explain X-Frame-Options', text: 'What is X-Frame-Options?' },
    { label: 'General safety advice', text: 'How can I secure my web servers?' },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-80 sm:w-96 h-[540px] rounded-2xl flex flex-col shadow-2xl overflow-hidden glass mb-4"
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10 border border-blue-500/20">
                  <Brain size={16} className="text-blue-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Security AI Assistant <Sparkles size={12} className="text-cyan-400 animate-pulse" />
                  </h4>
                  <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider block">
                    {activeScanId ? 'Active Report context' : 'General advisor'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {/* Voice toggle */}
                <button
                  onClick={() => {
                    const next = !speakOutput
                    setSpeakOutput(next)
                    if (!next) window.speechSynthesis?.cancel()
                    toast.success(next ? 'Voice output enabled 🔊' : 'Voice output muted 🔇')
                  }}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${speakOutput ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500 hover:text-white'}`}
                  aria-label="Toggle voice output"
                >
                  {speakOutput ? <Volume2 size={14} /> : <VolumeX size={14} />}
                </button>
                {/* Export chat */}
                <button
                  onClick={handleExportChat}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-white transition-all cursor-pointer"
                  aria-label="Export chat logs"
                >
                  <Download size={14} />
                </button>
                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  aria-label="Close panel"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/10">
              {messages.map((msg, index) => {
                const isAssistant = msg.role === 'assistant'
                return (
                  <div key={index} className={`flex items-start gap-2.5 ${isAssistant ? '' : 'flex-row-reverse'}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-white ${
                      isAssistant ? 'bg-blue-600' : 'bg-cyan-600'
                    }`}>
                      {isAssistant ? <Brain size={14} /> : 'U'}
                    </div>
                    <div className="relative group max-w-[80%]">
                      <div className={`p-3 rounded-2xl text-[11px] leading-relaxed break-words ${
                        isAssistant ? 'text-gray-200 bg-white/[0.03] border border-white/[0.06] rounded-tl-none' : 'text-white bg-blue-500/90 rounded-tr-none'
                      }`}>
                        {msg.content.split('\n').map((line, lIdx) => {
                          if (line.startsWith('### ')) {
                            return <h5 key={lIdx} className="font-bold text-white text-xs mt-2 mb-1">{line.replace('### ', '')}</h5>
                          }
                          if (line.startsWith('#### ')) {
                            return <h6 key={lIdx} className="font-semibold text-white text-[10px] mt-2 mb-1">{line.replace('#### ', '')}</h6>
                          }
                          if (line.startsWith('- ') || line.startsWith('1. ')) {
                            return <p key={lIdx} className="ml-2 pl-2 border-l border-white/10 my-1">{line}</p>
                          }
                          if (line.startsWith('add_header') || line.startsWith('app.use') || line.startsWith('//') || line.startsWith('#') || line.startsWith('Header')) {
                            return <code key={lIdx} className="block font-mono text-[9px] bg-black/40 p-2 rounded my-1 text-cyan-300 overflow-x-auto">{line}</code>
                          }
                          return <p key={lIdx} className={line ? 'mb-1' : ''}>{
                            line.split('**').map((chunk, cIdx) => 
                              cIdx % 2 === 1 ? <strong key={cIdx} className="text-white font-semibold">{chunk}</strong> : chunk
                            )
                          }</p>
                        })}
                      </div>
                      {/* Floating hover copy button inside bubble */}
                      <button
                        onClick={() => handleCopy(msg.content)}
                        className="absolute right-2 bottom-2 p-1 bg-black/60 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white cursor-pointer"
                      >
                        <Copy size={10} />
                      </button>
                    </div>
                  </div>
                )
              })}
              
              {loading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-600 flex-shrink-0 text-white">
                    <Brain size={14} />
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Presets for generating Nginx / Helmet configs */}
            <div className="px-3 py-2 border-t border-white/[0.04] bg-black/20 flex flex-wrap gap-1.5">
              {[
                { label: 'Nginx Rule', type: 'nginx' },
                { label: 'Helmet JS', type: 'helmet' },
                { label: 'Apache Rule', type: 'apache' },
                { label: 'Cloudflare Edge', type: 'cloudflare' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => generateConfigResponse(preset.type)}
                  className="text-[9px] font-bold px-2 py-1 rounded-lg text-blue-400 hover:text-white bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Layers size={8} />
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Quick Prompts list (visible only when chat is short) */}
            {messages.length <= 2 && !loading && (
              <div className="px-4 py-2 flex flex-wrap gap-1.5 bg-black/10 border-t border-white/[0.04]">
                {quickPrompts.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => { setInputValue(p.text); }}
                    className="text-[9px] px-2 py-1 rounded-full text-gray-400 hover:text-white bg-white/[0.02] border border-white/[0.06] cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* Footer Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/[0.08] flex gap-2 bg-white/[0.01]">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={activeScanId ? 'Ask about scan report...' : 'Ask a security question...'}
                className="flex-1 bg-white/5 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500"
                disabled={loading}
                aria-label="Chat input message"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || loading}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white disabled:opacity-50 transition-all hover:scale-105 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)' }}
                aria-label="Send message"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(p => !p)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-[0_0_25px_rgba(10,132,255,0.4)] border border-white/20 relative group cursor-pointer"
        style={{ background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)' }}
        aria-label="Toggle chat"
      >
        <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse" style={{ transform: 'scale(1.15)', zIndex: -1 }} />
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow border border-white/20 animate-bounce">
          AI
        </div>
      </motion.button>
    </div>
  )
}
