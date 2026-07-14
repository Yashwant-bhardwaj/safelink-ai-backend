import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, LayoutDashboard, Search, History, User, Settings,
  ChevronLeft, ChevronRight, LogOut, Zap, Bell
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: Search, label: 'URL Scanner', to: '/scanner' },
  { icon: History, label: 'History', to: '/history' },
  { icon: User, label: 'Profile', to: '/profile' },
  { icon: Settings, label: 'Settings', to: '/settings' },
]

export default function Sidebar({ collapsed, mobileOpen, onMobileClose, onToggleCollapse }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn('flex items-center h-16 px-4 border-b', 'border-white/[0.06]',
        collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}>
              <Shield size={16} className="text-white" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="font-bold text-white text-sm">SafeLink</span>
              <span className="font-bold text-sm" style={{ color: '#3B82F6' }}>AI</span>
            </div>
          </motion.div>
        )}

        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <ChevronRight size={16} />
            : <ChevronLeft size={16} />
          }
        </button>
      </div>

      {/* Quick scan CTA */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-3 mt-4"
        >
          <NavLink
            to="/scanner"
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}
          >
            <Zap size={15} />
            Quick Scan
          </NavLink>
        </motion.div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item, i) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <NavLink
              to={item.to}
              className={({ isActive }) => cn(
                'sidebar-link',
                isActive && 'active',
                collapsed && 'justify-center px-0 py-3'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Usage indicator */}
      {!collapsed && user && (
        <div className="mx-3 mb-3 p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-400">API Usage</span>
            <span className="text-blue-400 font-medium">{user.scansUsed?.toLocaleString()} / {user.scansLimit?.toLocaleString()}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(100, (user.scansUsed / user.scansLimit) * 100)}%`,
                background: 'linear-gradient(90deg, #3B82F6, #06B6D4)',
              }}
            />
          </div>
        </div>
      )}

      {/* User section */}
      <div className={cn('px-3 pb-4 border-t border-white/[0.06] pt-3', collapsed && 'flex justify-center')}>
        {!collapsed ? (
          <div className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-all group">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user?.name}</div>
              <div className="text-xs text-gray-500 truncate">{user?.plan} Plan</div>
            </div>
            <button
              onClick={handleLogout}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-gray-500 hover:text-red-400 transition-all"
              aria-label="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/5 transition-all"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 overflow-hidden"
        style={{
          background: '#0e1829',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
        aria-label="Sidebar navigation"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col lg:hidden"
            style={{
              background: '#0e1829',
              borderRight: '1px solid rgba(255,255,255,0.06)',
            }}
            aria-label="Mobile sidebar navigation"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
