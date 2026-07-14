import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Bell, ChevronDown, User, Settings, LogOut, Search, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import ThemeToggle from '@/components/common/ThemeToggle'
import { useAuth } from '@/context/AuthContext'
import { normalizeUrl, isValidUrl } from '@/utils/helpers'
import toast from 'react-hot-toast'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/scanner': 'URL Scanner',
  '/history': 'Scan History',
  '/profile': 'Profile',
  '/settings': 'Settings',
}

const MOCK_NOTIFS = [
  { id: 1, type: 'danger', title: 'Malicious threat blocked', desc: 'Blocked redirect chain pointing to phishing domain', time: '5m ago' },
  { id: 2, type: 'warning', title: 'Missing CSP header', desc: 'Scan target.com was completed with missing security headers', time: '2h ago' },
  { id: 3, type: 'success', title: 'TLS certificate valid', desc: 'SSL certificate checks succeeded on safe-site.org', time: '1d ago' },
]

export default function AppNavbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifMenuOpen, setNotifMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const pageTitle = PAGE_TITLES[location.pathname] || 'SafeLink AI'

  const handleLogout = () => {
    logout()
    navigate('/login')
    setUserMenuOpen(false)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    const normalized = normalizeUrl(searchQuery.trim())
    if (!isValidUrl(normalized)) {
      toast.error('Please enter a valid URL')
      return
    }
    navigate(`/scanner?url=${encodeURIComponent(normalized)}`)
    setSearchQuery('')
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 h-16 px-4 md:px-6 border-b glass">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div className="hidden md:block flex-shrink-0">
        <h1 className="text-sm font-semibold text-white leading-none">{pageTitle}</h1>
        <span className="text-[10px] text-gray-500 mt-1 block">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Global Navbar Scanner Search */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-sm ml-4 relative">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick Scan URL... (e.g. apple.com)"
            className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-blue-500 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-gray-500 outline-none transition-all"
          />
        </div>
      </form>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Notifications Icon and Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifMenuOpen(p => !p)
              setUserMenuOpen(false)
            }}
            className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
          </button>

          <AnimatePresence>
            {notifMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden z-50 glass"
                  style={{ border: '0.5px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                >
                  <div className="px-4 py-3 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.01]">
                    <span className="text-xs font-semibold text-white">Security Notifications</span>
                    <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full font-semibold">3 New</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-white/[0.04]">
                    {MOCK_NOTIFS.map((notif) => (
                      <div key={notif.id} className="p-4 hover:bg-white/[0.02] transition-all flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {notif.type === 'danger' && <AlertTriangle size={14} className="text-red-400" />}
                          {notif.type === 'warning' && <AlertTriangle size={14} className="text-yellow-400" />}
                          {notif.type === 'success' && <CheckCircle size={14} className="text-emerald-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-white truncate">{notif.title}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5 leading-normal">{notif.desc}</div>
                          <div className="text-[9px] text-gray-600 mt-1">{notif.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => {
              setUserMenuOpen(p => !p)
              setNotifMenuOpen(false)
            }}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
            aria-label="User menu"
            aria-expanded={userMenuOpen}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)' }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-medium text-white leading-tight">{user?.name}</div>
              <div className="text-[10px] leading-tight" style={{ color: '#0A84FF' }}>{user?.plan}</div>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 rounded-2xl overflow-hidden z-50 glass"
                  style={{ border: '0.5px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <div className="text-xs font-medium text-white">{user?.name}</div>
                    <div className="text-[10px] text-gray-500">{user?.email}</div>
                  </div>

                  {/* Menu items */}
                  <div className="p-2">
                    {[
                      { icon: User, label: 'Profile', to: '/profile' },
                      { icon: Settings, label: 'Settings', to: '/settings' },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <item.icon size={14} />
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <div className="p-2 border-t border-white/[0.06]">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
