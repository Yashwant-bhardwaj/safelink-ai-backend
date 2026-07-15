import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  Brain, X, Send, Sparkles, MessageSquare, Plus, Trash2,
  Pin, PinOff, Search, Download, Volume2, VolumeX, Mic, MicOff,
  Copy, RefreshCw, StopCircle, ChevronLeft, ChevronRight,
  Shield, Lock, Code, Globe, FileText, Zap, CheckCircle,
  Edit3, Check, ExternalLink, Layers,
} from 'lucide-react'
import { sendChatStream, getConversations, createConversation, updateConversation, deleteConversation } from '@/services/scannerService'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

// ── Quick action presets ───────────────────────────────────────────────────────

const CYBER_PRESETS = [
  { icon: Lock,     label: 'Nginx HSTS',    prompt: 'Generate Nginx config for HSTS and security headers' },
  { icon: Shield,   label: 'Helmet.js',     prompt: 'Generate Express Helmet.js security middleware config' },
  { icon: Code,     label: 'Apache Rules',  prompt: 'Generate Apache .htaccess security header rules' },
  { icon: Globe,    label: 'Cloudflare',    prompt: 'Give me Cloudflare WAF and security recommendations' },
  { icon: FileText, label: 'CSP Policy',    prompt: 'Generate a strict Content-Security-Policy header' },
  { icon: Zap,      label: 'Fix Headers',   prompt: 'What security headers am I missing and how do I add them?' },
]

const SCAN_PROMPTS = [
  'Why is the security score low?',
  'How do I fix the CSP issue?',
  'Explain the SSL certificate findings',
  'What are the clickjacking risks?',
  'Generate a security report for this scan',
]

const GENERAL_PROMPTS = [
  'What is HSTS and why does it matter?',
  'Explain Content-Security-Policy',
  'How do I prevent XSS attacks?',
  'What is SSRF and how to prevent it?',
]

// ── Markdown code block renderer ──────────────────────────────────────────────

const CodeBlock = memo(({ language, children }) => {
  const [copied, setCopied] = useState(false)
  const code = String(children).replace(/\n$/, '')

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-2">
      <div className="flex items-center justify-between px-3 py-1.5 rounded-t-lg"
        style={{ background: '#1e1e2e', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-[10px] text-gray-500 font-mono uppercase">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
        >
          {copied ? <><CheckCircle size={10} className="text-green-400" /> Copied!</> : <><Copy size={10} /> Copy</>}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'bash'}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: '0 0 8px 8px',
          fontSize: '11px',
          padding: '12px',
          background: '#161622',
        }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
})

// ── Message bubble ─────────────────────────────────────────────────────────────

const MessageBubble = memo(({ msg, onCopy, onRegenerate, isLast, isAssistant }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    onCopy(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex items-start gap-2.5 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold text-white ${
        isAssistant ? 'bg-gradient-to-br from-blue-600 to-violet-600' : 'bg-gradient-to-br from-cyan-500 to-blue-500'
      }`}>
        {isAssistant ? <Brain size={13} /> : <span>U</span>}
      </div>

      {/* Content */}
      <div className={`relative group max-w-[85%] min-w-0 ${isAssistant ? '' : 'items-end flex flex-col'}`}>
        <div className={`px-3 py-2.5 rounded-2xl text-[11.5px] leading-relaxed break-words overflow-hidden ${
          isAssistant
            ? 'text-gray-200 bg-white/[0.04] border border-white/[0.07] rounded-tl-none'
            : 'text-white bg-blue-500/90 rounded-tr-none'
        }`}>
          {isAssistant ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline ? (
                    <CodeBlock language={match?.[1]}>{children}</CodeBlock>
                  ) : (
                    <code className="px-1 py-0.5 rounded text-cyan-300 bg-black/30 font-mono text-[10px]" {...props}>
                      {children}
                    </code>
                  )
                },
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                h1: ({ children }) => <h1 className="text-base font-bold text-white mb-2 mt-3 first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-bold text-white mb-2 mt-3 first:mt-0">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xs font-bold text-white/90 mb-1.5 mt-2.5 first:mt-0">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 mb-2 text-gray-300">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 mb-2 text-gray-300">{children}</ol>,
                li: ({ children }) => <li className="text-[11px]">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-blue-500/50 pl-3 italic text-gray-400 my-2">{children}</blockquote>
                ),
                strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                    {children}
                  </a>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2">
                    <table className="text-[10px] w-full border-collapse">{children}</table>
                  </div>
                ),
                th: ({ children }) => <th className="px-2 py-1 text-left text-gray-400 border border-white/10 bg-white/5">{children}</th>,
                td: ({ children }) => <td className="px-2 py-1 border border-white/10">{children}</td>,
              }}
            >
              {msg.content}
            </ReactMarkdown>
          ) : (
            <span>{msg.content}</span>
          )}
        </div>

        {/* Timestamp + Actions */}
        <div className={`flex items-center gap-1.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isAssistant ? '' : 'flex-row-reverse'}`}>
          <span className="text-[9px] text-gray-600">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={handleCopy}
            className="p-0.5 rounded text-gray-600 hover:text-gray-300 transition-colors cursor-pointer"
            title="Copy"
          >
            {copied ? <CheckCircle size={10} className="text-green-400" /> : <Copy size={10} />}
          </button>
          {isAssistant && isLast && onRegenerate && (
            <button
              onClick={onRegenerate}
              className="p-0.5 rounded text-gray-600 hover:text-gray-300 transition-colors cursor-pointer"
              title="Regenerate"
            >
              <RefreshCw size={10} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

// ── Typing indicator ───────────────────────────────────────────────────────────

const TypingIndicator = memo(({ streamingContent }) => (
  <div className="flex items-start gap-2.5">
    <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-600 to-violet-600">
      <Brain size={13} className="text-white" />
    </div>
    <div className="px-3 py-2.5 rounded-2xl rounded-tl-none bg-white/[0.04] border border-white/[0.07] max-w-[85%] min-w-[60px]">
      {streamingContent ? (
        <div className="text-[11.5px] text-gray-200 leading-relaxed break-words">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {streamingContent}
          </ReactMarkdown>
          <span className="inline-block w-1.5 h-3.5 bg-blue-400 ml-0.5 animate-pulse rounded-sm" />
        </div>
      ) : (
        <div className="flex items-center gap-1.5 py-1">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}
    </div>
  </div>
))

// ── Conversation sidebar item ──────────────────────────────────────────────────

const ConvoItem = memo(({ convo, isActive, onSelect, onRename, onPin, onDelete }) => {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(convo.title)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const handleRename = () => {
    if (title.trim() && title !== convo.title) {
      onRename(convo.id, title.trim())
    }
    setEditing(false)
  }

  return (
    <div
      className={`group flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-all ${
        isActive ? 'bg-blue-500/15 border border-blue-500/20' : 'hover:bg-white/[0.04] border border-transparent'
      }`}
      onClick={() => !editing && onSelect(convo)}
    >
      {convo.isPinned && <Pin size={9} className="text-yellow-400 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditing(false) }}
            className="w-full bg-transparent text-xs text-white outline-none border-b border-blue-500/50"
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <p className="text-[11px] text-gray-300 truncate">{convo.title}</p>
        )}
        <p className="text-[9px] text-gray-600">
          {new Date(convo.updatedAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={e => { e.stopPropagation(); setEditing(true) }}
          className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors cursor-pointer">
          <Edit3 size={9} />
        </button>
        <button onClick={e => { e.stopPropagation(); onPin(convo.id, !convo.isPinned) }}
          className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors cursor-pointer">
          {convo.isPinned ? <PinOff size={9} /> : <Pin size={9} />}
        </button>
        <button onClick={e => { e.stopPropagation(); onDelete(convo.id) }}
          className="p-1 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors cursor-pointer">
          <Trash2 size={9} />
        </button>
      </div>
    </div>
  )
})

// ══════════════════════════════════════════════════════════════════════════════
// ── MAIN CHAT WIDGET ──────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

export default function ChatWidget() {
  const { user } = useAuth()
  const location = useLocation()
  const { id: routeScanId } = useParams()

  const isScanPage = location.pathname.startsWith('/scan/') && routeScanId
  const activeScanId = isScanPage ? routeScanId : null

  // ── State ─────────────────────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: user
        ? `Hello **${user.name?.split(' ')[0]}**! 👋 I'm your **SafeLink AI Security Copilot**.\n\nI can help you:\n- 🔍 Analyze scan results\n- 🛡️ Fix security headers\n- 📋 Generate config files\n- 🚨 Explain vulnerabilities\n\nWhat would you like to investigate?`
        : `Hello! I'm the **SafeLink AI Security Assistant**.\n\nAsk me anything about web security, SSL certificates, DNS, or security headers!\n\n*Sign in to run scans and get personalized analysis.*`,
      timestamp: new Date().toISOString(),
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [conversations, setConversations] = useState([])
  const [activeConvoId, setActiveConvoId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [speakOutput, setSpeakOutput] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showPrompts, setShowPrompts] = useState(true)

  const chatEndRef = useRef(null)
  const inputRef = useRef(null)
  const abortStreamRef = useRef(null)
  const recognitionRef = useRef(null)

  // ── Auto scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent, isOpen])

  // ── Load conversations when opened ────────────────────────────────────────
  useEffect(() => {
    if (isOpen && user) {
      loadConversations()
    }
  }, [isOpen, user])

  const loadConversations = async () => {
    try {
      const convos = await getConversations()
      setConversations(convos)
    } catch {
      // Silently fail
    }
  }

  // ── Voice Input (Web Speech API) ──────────────────────────────────────────
  const toggleVoiceInput = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('')
      setInputValue(transcript)
    }
    recognition.onend = () => {
      setIsListening(false)
      inputRef.current?.focus()
    }
    recognition.onerror = () => {
      setIsListening(false)
      toast.error('Voice recognition failed')
    }

    recognition.start()
  }, [isListening])

  // ── Text to Speech ────────────────────────────────────────────────────────
  const speakText = useCallback((text) => {
    if (!speakOutput) return
    window.speechSynthesis?.cancel()
    const clean = text.replace(/[#*`_~\[\]()]/g, '').replace(/```[\s\S]*?```/g, 'code block').trim()
    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.rate = 0.95
    window.speechSynthesis?.speak(utterance)
  }, [speakOutput])

  // ── Stop generation ───────────────────────────────────────────────────────
  const handleStop = useCallback(() => {
    abortStreamRef.current?.()
    abortStreamRef.current = null
    if (streamingContent) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: streamingContent + '\n\n*[Response stopped]*',
        timestamp: new Date().toISOString(),
      }])
    }
    setStreamingContent('')
    setIsStreaming(false)
    window.speechSynthesis?.cancel()
  }, [streamingContent])

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(async (e, overrideMessage) => {
    e?.preventDefault()
    const text = (overrideMessage || inputValue).trim()
    if (!text || isStreaming) return

    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsStreaming(true)
    setStreamingContent('')
    setShowPrompts(false)

    let accumulated = ''
    let convoId = activeConvoId

    const abort = sendChatStream(text, {
      scanId: activeScanId,
      conversationId: convoId,
      onConversationId: (id) => {
        convoId = id
        setActiveConvoId(id)
      },
      onChunk: (chunk) => {
        accumulated += chunk
        setStreamingContent(accumulated)
      },
      onDone: () => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: accumulated || 'I apologize, I could not generate a response. Please check the Gemini API key in your server .env file.',
          timestamp: new Date().toISOString(),
        }])
        setStreamingContent('')
        setIsStreaming(false)
        abortStreamRef.current = null
        speakText(accumulated)
        if (user) loadConversations()
      },
      onError: (err) => {
        const errorMsg = err?.includes('API key') || err?.includes('quota')
          ? 'AI service unavailable. Please add a valid GEMINI_API_KEY to server/.env'
          : err || 'Connection failed. Is the server running?'
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `⚠️ **Error:** ${errorMsg}\n\nFor setup help:\n1. Get a key at [aistudio.google.com](https://aistudio.google.com/app/apikey)\n2. Add \`GEMINI_API_KEY=your_key\` to \`server/.env\`\n3. Restart the server`,
          timestamp: new Date().toISOString(),
        }])
        setStreamingContent('')
        setIsStreaming(false)
        abortStreamRef.current = null
      },
    })

    abortStreamRef.current = abort
  }, [inputValue, isStreaming, activeScanId, activeConvoId, user, speakText])

  // ── Regenerate last response ──────────────────────────────────────────────
  const handleRegenerate = useCallback(() => {
    const userMsgs = messages.filter(m => m.role === 'user')
    const lastUserMsg = userMsgs[userMsgs.length - 1]
    if (!lastUserMsg) return
    setMessages(prev => prev.slice(0, -1)) // Remove last assistant msg
    handleSend(null, lastUserMsg.content)
  }, [messages, handleSend])

  // ── Copy ──────────────────────────────────────────────────────────────────
  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }, [])

  // ── Export chat ───────────────────────────────────────────────────────────
  const handleExport = useCallback((format = 'txt') => {
    let content = ''
    const filename = `safelink_chat_${Date.now()}`

    if (format === 'json') {
      content = JSON.stringify({ messages, exportedAt: new Date().toISOString() }, null, 2)
    } else if (format === 'md') {
      content = `# SafeLink AI Chat Export\n\n*${new Date().toLocaleString()}*\n\n---\n\n`
      content += messages.map(m => `**${m.role === 'user' ? 'You' : 'SafeLink AI'}:**\n\n${m.content}`).join('\n\n---\n\n')
    } else {
      content = messages.map(m => `[${m.role.toUpperCase()}] ${m.content}`).join('\n\n')
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${filename}.${format}`
    a.click()
    toast.success(`Chat exported as .${format}`)
  }, [messages])

  // ── New conversation ──────────────────────────────────────────────────────
  const handleNewConvo = useCallback(async () => {
    setActiveConvoId(null)
    setMessages([{
      role: 'assistant',
      content: `New conversation started! How can I assist with your security needs today?`,
      timestamp: new Date().toISOString(),
    }])
    setShowPrompts(true)
    setSearchQuery('')
  }, [])

  // ── Select conversation ───────────────────────────────────────────────────
  const handleSelectConvo = useCallback((convo) => {
    setActiveConvoId(convo.id)
    const msgs = convo.messages.length > 0 ? convo.messages : [{
      role: 'assistant',
      content: 'Conversation loaded. How can I help?',
      timestamp: convo.createdAt,
    }]
    setMessages(msgs)
    setShowSidebar(false)
    setShowPrompts(false)
  }, [])

  // ── Rename ────────────────────────────────────────────────────────────────
  const handleRename = useCallback(async (id, title) => {
    try {
      await updateConversation(id, { title })
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title } : c))
    } catch { toast.error('Failed to rename') }
  }, [])

  // ── Pin ───────────────────────────────────────────────────────────────────
  const handlePin = useCallback(async (id, isPinned) => {
    try {
      await updateConversation(id, { isPinned })
      setConversations(prev => prev.map(c => c.id === id ? { ...c, isPinned } : c))
    } catch { toast.error('Failed to update pin') }
  }, [])

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteConvo = useCallback(async (id) => {
    try {
      await deleteConversation(id)
      setConversations(prev => prev.filter(c => c.id !== id))
      if (activeConvoId === id) handleNewConvo()
    } catch { toast.error('Failed to delete') }
  }, [activeConvoId, handleNewConvo])

  // ── Filtered conversations ─────────────────────────────────────────────────
  const filteredConvos = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const pinnedConvos = filteredConvos.filter(c => c.isPinned)
  const unpinnedConvos = filteredConvos.filter(c => !c.isPinned)

  // ── Keyboard shortcut ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(p => !p)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const quickPrompts = activeScanId ? SCAN_PROMPTS : GENERAL_PROMPTS

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="mb-4 flex rounded-2xl overflow-hidden shadow-2xl"
            style={{
              width: showSidebar ? '680px' : '380px',
              height: '580px',
              maxWidth: 'calc(100vw - 24px)',
              background: 'rgba(10, 12, 24, 0.95)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '0.5px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 60px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.05)',
            }}
          >
            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <AnimatePresence>
              {showSidebar && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col border-r flex-shrink-0 overflow-hidden"
                  style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
                >
                  {/* Sidebar Header */}
                  <div className="px-3 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <button
                      onClick={handleNewConvo}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold text-white cursor-pointer transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)' }}
                    >
                      <Plus size={12} /> New Chat
                    </button>
                  </div>

                  {/* Search */}
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <Search size={10} className="text-gray-500 flex-shrink-0" />
                      <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search chats..."
                        className="flex-1 bg-transparent text-[10px] text-gray-300 outline-none placeholder-gray-600"
                      />
                    </div>
                  </div>

                  {/* Conversations */}
                  <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
                    {pinnedConvos.length > 0 && (
                      <>
                        <p className="text-[9px] text-gray-600 font-semibold uppercase px-2 py-1">Pinned</p>
                        {pinnedConvos.map(c => (
                          <ConvoItem key={c.id} convo={c} isActive={activeConvoId === c.id}
                            onSelect={handleSelectConvo} onRename={handleRename}
                            onPin={handlePin} onDelete={handleDeleteConvo} />
                        ))}
                      </>
                    )}
                    {unpinnedConvos.length > 0 && (
                      <>
                        {pinnedConvos.length > 0 && <p className="text-[9px] text-gray-600 font-semibold uppercase px-2 py-1 mt-1">Recent</p>}
                        {unpinnedConvos.map(c => (
                          <ConvoItem key={c.id} convo={c} isActive={activeConvoId === c.id}
                            onSelect={handleSelectConvo} onRename={handleRename}
                            onPin={handlePin} onDelete={handleDeleteConvo} />
                        ))}
                      </>
                    )}
                    {filteredConvos.length === 0 && (
                      <div className="text-center py-8">
                        <MessageSquare size={20} className="text-gray-700 mx-auto mb-2" />
                        <p className="text-[10px] text-gray-600">No conversations yet</p>
                      </div>
                    )}
                  </div>

                  {/* Export buttons */}
                  <div className="px-3 py-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <p className="text-[9px] text-gray-600 uppercase font-semibold mb-1.5">Export Chat</p>
                    <div className="flex gap-1">
                      {['txt', 'md', 'json'].map(fmt => (
                        <button key={fmt} onClick={() => handleExport(fmt)}
                          className="flex-1 py-1 text-[9px] font-bold rounded-lg text-gray-400 hover:text-white cursor-pointer transition-all"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          .{fmt}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Main Chat Area ───────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
                style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.01)' }}>
                <div className="flex items-center gap-2.5">
                  {/* Sidebar Toggle */}
                  {user && (
                    <button
                      onClick={() => setShowSidebar(p => !p)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                      title="Chat History"
                    >
                      {showSidebar ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                    </button>
                  )}
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(10,132,255,0.2), rgba(94,92,230,0.2))', border: '1px solid rgba(10,132,255,0.3)' }}>
                    <Brain size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-white flex items-center gap-1.5">
                      Security AI Copilot
                      <Sparkles size={10} className="text-cyan-400 animate-pulse" />
                    </h4>
                    <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">
                      {activeScanId ? '● Scan Context Active' : isStreaming ? '● Thinking...' : '● Ready'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {/* Voice Output */}
                  <button
                    onClick={() => {
                      const next = !speakOutput
                      setSpeakOutput(next)
                      if (!next) window.speechSynthesis?.cancel()
                      toast.success(next ? 'Voice enabled 🔊' : 'Voice muted 🔇')
                    }}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${speakOutput ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    title="Toggle voice output"
                  >
                    {speakOutput ? <Volume2 size={13} /> : <VolumeX size={13} />}
                  </button>
                  {/* New chat */}
                  <button
                    onClick={handleNewConvo}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                    title="New chat"
                  >
                    <Plus size={13} />
                  </button>
                  {/* Close */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                    title="Close (Ctrl+K)"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
                style={{ background: 'rgba(0,0,0,0.15)' }}>
                {messages.map((msg, i) => (
                  <MessageBubble
                    key={i}
                    msg={msg}
                    isAssistant={msg.role === 'assistant'}
                    isLast={i === messages.length - 1}
                    onCopy={handleCopy}
                    onRegenerate={i === messages.length - 1 && msg.role === 'assistant' ? handleRegenerate : null}
                  />
                ))}

                {isStreaming && <TypingIndicator streamingContent={streamingContent} />}

                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompts */}
              <AnimatePresence>
                {showPrompts && messages.length <= 1 && !isStreaming && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-3 py-2 border-t overflow-x-auto"
                    style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}
                  >
                    <div className="flex gap-1.5 min-w-max">
                      {quickPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => { setInputValue(prompt); inputRef.current?.focus() }}
                          className="text-[9px] px-2.5 py-1.5 rounded-full text-gray-400 hover:text-white whitespace-nowrap transition-all cursor-pointer flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cyber preset buttons */}
              <div className="px-3 py-2 border-t flex flex-wrap gap-1.5 flex-shrink-0"
                style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                {CYBER_PRESETS.map((preset) => {
                  const Icon = preset.icon
                  return (
                    <button
                      key={preset.label}
                      onClick={() => handleSend(null, preset.prompt)}
                      disabled={isStreaming}
                      className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-lg text-blue-400 hover:text-white transition-all cursor-pointer disabled:opacity-40"
                      style={{ background: 'rgba(10,132,255,0.06)', border: '1px solid rgba(10,132,255,0.15)' }}
                      title={preset.prompt}
                    >
                      <Icon size={8} />
                      {preset.label}
                    </button>
                  )
                })}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="px-3 pb-3 pt-2 flex gap-2 flex-shrink-0"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex-1 flex items-end gap-1.5 rounded-xl px-3 py-2"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend(e)
                      }
                    }}
                    placeholder={activeScanId ? 'Ask about this scan...' : 'Ask a security question...'}
                    rows={1}
                    className="flex-1 bg-transparent text-[12px] text-white placeholder-gray-600 outline-none resize-none"
                    style={{ maxHeight: '80px' }}
                    disabled={isStreaming}
                    aria-label="Chat message input"
                  />
                  {/* Voice input */}
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`p-1 rounded-lg transition-all cursor-pointer flex-shrink-0 ${isListening ? 'text-red-400 animate-pulse' : 'text-gray-600 hover:text-gray-300'}`}
                    title="Voice input"
                  >
                    {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                  </button>
                </div>

                {/* Send / Stop button */}
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={handleStop}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 cursor-pointer transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
                    title="Stop generation"
                  >
                    <StopCircle size={15} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-all hover:scale-105 flex-shrink-0 cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)' }}
                    title="Send (Enter)"
                  >
                    <Send size={14} />
                  </button>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Toggle Button ───────────────────────────────────────── */}
      <motion.button
        onClick={() => setIsOpen(p => !p)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="w-16 h-16 rounded-full flex items-center justify-center text-white relative cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)',
          boxShadow: '0 0 30px rgba(10,132,255,0.4), 0 4px 20px rgba(0,0,0,0.5)',
          border: '0.5px solid rgba(255,255,255,0.2)',
        }}
        aria-label="Toggle Security AI Chat (Ctrl+K)"
        title="Security AI Chat (Ctrl+K)"
      >
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ background: 'radial-gradient(circle, #0A84FF, transparent)' }} />

        {isOpen ? (
          <X size={22} />
        ) : (
          <Brain size={24} className="animate-pulse" style={{ animationDuration: '3s' }} />
        )}

        {/* AI badge */}
        <div className="absolute -top-1.5 -right-1.5 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg animate-bounce"
          style={{ background: 'linear-gradient(135deg, #30D158, #0A84FF)', animationDuration: '2s' }}>
          AI
        </div>
      </motion.button>
    </div>
  )
}
