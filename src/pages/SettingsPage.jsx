import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  User, Lock, Bell, Eye, Shield, Trash2, ChevronRight, AlertTriangle, Key
} from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import Dialog from '@/components/ui/Dialog'
import toast from 'react-hot-toast'
import { clearScanHistory, changePassword } from '@/services/scannerService'

function SettingRow({ title, description, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/[0.04] last:border-0">
      <div className="flex-1 mr-6">
        <div className="text-sm font-medium text-white">{title}</div>
        {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

function Toggle2({ enabled, onToggle, label }) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      className="relative w-11 h-6 rounded-full transition-all duration-300 cursor-pointer"
      style={{ background: enabled ? 'linear-gradient(135deg, #3B82F6, #06B6D4)' : 'rgba(255,255,255,0.1)' }}
    >
      <motion.div
        animate={{ x: enabled ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
      />
    </button>
  )
}

function SectionCard({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl mb-6"
      style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <h3 className="text-base font-semibold text-white mb-4">{title}</h3>
      {children}
    </motion.div>
  )
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('preferences') // 'preferences' | 'security'

  const [notifications, setNotifications] = useState({
    email: true,
    pushAlerts: false,
    weeklyReport: true,
    threatAlerts: true,
    productUpdates: false,
  })

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: true,
    apiLogs: true,
  })

  const [language, setLanguage] = useState('en')
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [changePasswordDialog, setChangePasswordDialog] = useState(false)
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handlePasswordChangeSubmit = async (e) => {
    e?.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All fields are required')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    try {
      await changePassword(currentPassword, newPassword)
      toast.success('Password changed successfully 🔐')
      setChangePasswordDialog(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err.message || 'Failed to change password')
    }
  }

  const toggleNotif = (key) => setNotifications(p => ({ ...p, [key]: !p[key] }))
  const toggleSecurity = (key) => {
    setSecurity(p => ({ ...p, [key]: !p[key] }))
    toast.success('Setting updated')
  }

  const handleDeleteAccount = () => {
    logout()
    navigate('/')
    toast.error('Account deleted')
  }

  const tabVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, x: 10, transition: { duration: 0.15 } }
  }

  return (
    <>
      <Helmet>
        <title>Settings – SafeLink AI</title>
        <meta name="description" content="Manage your SafeLink AI account settings, notifications, and security preferences." />
      </Helmet>

      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

        {/* Tab switch bar */}
        <div className="flex border-b border-white/[0.08] mb-6">
          {[
            { id: 'preferences', label: 'Preferences & Alerts', icon: Bell },
            { id: 'security', label: 'Security & Credentials', icon: Shield },
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

        <AnimatePresence mode="wait">
          {activeTab === 'preferences' && (
            <motion.div
              key="preferences"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
            >
              {/* Appearance */}
              <SectionCard title="Appearance">
                <SettingRow
                  title="Theme"
                  description="Choose between dark and light mode"
                >
                  <div className="flex items-center gap-2 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <button
                      onClick={toggleTheme}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${theme === 'dark' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      Dark
                    </button>
                    <button
                      onClick={toggleTheme}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${theme === 'light' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      Light
                    </button>
                  </div>
                </SettingRow>
                <SettingRow
                  title="Interface Language"
                  description="Choose preferred display language"
                >
                  <select
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value)
                      toast.success('Language changed')
                    }}
                    className="bg-white/5 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="en" className="bg-gray-900">English</option>
                    <option value="es" className="bg-gray-900">Español</option>
                    <option value="fr" className="bg-gray-900">Français</option>
                    <option value="de" className="bg-gray-900">Deutsch</option>
                  </select>
                </SettingRow>
              </SectionCard>

              {/* Notifications */}
              <SectionCard title="Notification Alerts">
                <SettingRow title="Email alerts" description="Receive warnings for verified scans on critical unsafe domains">
                  <Toggle2 enabled={notifications.email} onToggle={() => toggleNotif('email')} label="Toggle Email alerts" />
                </SettingRow>
                <SettingRow title="Weekly audit summaries" description="Get weekly scanner intelligence logs sent directly to your inbox">
                  <Toggle2 enabled={notifications.weeklyReport} onToggle={() => toggleNotif('weeklyReport')} label="Toggle Weekly summaries" />
                </SettingRow>
                <SettingRow title="High threat warnings" description="Get immediate pop-up warnings if malware triggers are detected">
                  <Toggle2 enabled={notifications.threatAlerts} onToggle={() => toggleNotif('threatAlerts')} label="Toggle threat warnings" />
                </SettingRow>
              </SectionCard>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
            >
              {/* Credentials */}
              <SectionCard title="Security & Credentials">
                <SettingRow title="Change password" description="Update your account password">
                  <button
                    onClick={() => setChangePasswordDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all border border-white/10 hover:border-white/20 cursor-pointer"
                  >
                    Change <ChevronRight size={14} />
                  </button>
                </SettingRow>
                <SettingRow title="Two-factor authentication" description="Add an extra layer of security using TOTP apps">
                  <Toggle2 enabled={security.twoFactor} onToggle={() => toggleSecurity('twoFactor')} label="Toggle 2FA" />
                </SettingRow>
                <SettingRow title="Automatic session timeout" description="Automatically sign out after 30 minutes of inactivity">
                  <Toggle2 enabled={security.sessionTimeout} onToggle={() => toggleSecurity('sessionTimeout')} label="Toggle Session timeout" />
                </SettingRow>
                <SettingRow title="API usage logging" description="Record network query payloads inside database access logs">
                  <Toggle2 enabled={security.apiLogs} onToggle={() => toggleSecurity('apiLogs')} label="Toggle API logging" />
                </SettingRow>
              </SectionCard>

              {/* Danger Zone */}
              <SectionCard title="Danger Zone">
                <SettingRow
                  title="Clear Scan History"
                  description="Delete all scan reports. This action cannot be undone."
                >
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to clear your entire scan history?')) {
                        try {
                          await clearScanHistory()
                          toast.success('Scan history cleared successfully')
                        } catch (err) {
                          toast.error(err.message || 'Failed to clear history')
                        }
                      }
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 transition-all border border-red-500/10 hover:bg-red-500/5 cursor-pointer"
                  >
                    Clear History
                  </button>
                </SettingRow>
                <SettingRow
                  title="Delete Account"
                  description="Permanently delete your SafeLink AI account and revoke active API keys"
                >
                  <button
                    onClick={() => setDeleteDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
                  >
                    <Trash2 size={14} /> Delete Account
                  </button>
                </SettingRow>
              </SectionCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete account dialog */}
      <Dialog isOpen={deleteDialog} onClose={() => setDeleteDialog(false)} title="Delete Account">
        <div className="flex items-start gap-3 mb-4 p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-300">
            This action is <strong className="text-red-400">permanent and irreversible</strong>.
            All your data, scan history, and API keys will be immediately deleted.
          </p>
        </div>
        <p className="text-sm text-gray-400 mb-6">Are you absolutely sure you want to delete your account?</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteDialog(false)} className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            Cancel
          </button>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
          >
            Yes, Delete My Account
          </button>
        </div>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog isOpen={changePasswordDialog} onClose={() => setChangePasswordDialog(false)} title="Change Password">
        <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button type="button" onClick={() => setChangePasswordDialog(false)} className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}
            >
              Update Password
            </button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
