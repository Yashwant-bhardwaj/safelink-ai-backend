import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { User, Mail, Calendar, Edit3, Save, Key, BarChart2, Zap, Crown, Laptop, Smartphone, RefreshCw, Upload } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import toast from 'react-hot-toast'
import { formatDate } from '@/utils/helpers'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
})

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [apiKey, setApiKey] = useState(user?.apiKey || 'sk_live_51Pz8A9W2E0Q4r7J1K...')
  const [regeneratingKey, setRegeneratingKey] = useState(false)
  
  // Avatar upload simulation state
  const [avatarUrl, setAvatarUrl] = useState(null)

  // Sessions mockup
  const [sessions, setSessions] = useState([
    { id: 1, device: 'Chrome on Windows 11', location: 'San Francisco, USA', active: true },
    { id: 2, device: 'Safari on macOS Sequoia', location: 'London, UK', active: false },
    { id: 3, device: 'SafeLink App on iPhone 15', location: 'Tokyo, Japan', active: false },
  ])

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name, email: user?.email },
  })

  const onSave = async (data) => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    updateUser({ name: data.name, email: data.email })
    setEditing(false)
    setSaving(false)
    toast.success('Profile details saved successfully')
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setAvatarUrl(reader.result)
        toast.success('Avatar uploaded successfully 📸')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRegenerateKey = async () => {
    setRegeneratingKey(true)
    await new Promise(r => setTimeout(r, 1200))
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let newKey = 'sk_live_'
    for (let i = 0; i < 24; i++) {
      newKey += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setApiKey(newKey)
    setRegeneratingKey(false)
    toast.success('Generated a new API key 🔑')
  }

  const handleRevokeSession = (id) => {
    setSessions(p => p.filter(s => s.id !== id))
    toast.success('Session terminated')
  }

  const usagePercent = Math.min(100, ((user?.scansUsed || 0) / (user?.scansLimit || 1)) * 100)

  return (
    <>
      <Helmet>
        <title>Profile – SafeLink AI</title>
        <meta name="description" content="Manage your SafeLink AI profile, API usage, and subscription." />
      </Helmet>

      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold text-white mb-6">Profile Details</h2>

        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl mb-6 glass"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-5">
              
              {/* Profile Avatar Simulator */}
              <div className="relative group cursor-pointer">
                <input
                  type="file"
                  id="avatarInput"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <label htmlFor="avatarInput" className="cursor-pointer relative block">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover border border-white/10" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white"
                      style={{ background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)' }}>
                      {user?.name?.charAt(0) || 'A'}
                    </div>
                  )}
                  {/* Overlay camera */}
                  <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <Upload size={18} className="text-white" />
                  </div>
                </label>
                <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #FF9F0A, #FF453A)' }}>
                  {user?.role}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white leading-tight">{user?.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                <div className="flex items-center gap-1.5 mt-2 text-yellow-400">
                  <Crown size={12} />
                  <span className="text-xs font-semibold">{user?.plan} Membership</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => { setEditing(p => !p); if (editing) reset({ name: user?.name, email: user?.email }) }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              <Edit3 size={12} /> {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit(onSave)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  icon={User}
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" size="sm" onClick={() => { setEditing(false); reset() }}>Cancel</Button>
                <Button type="submit" size="sm" icon={Save} isLoading={saving}>Save Changes</Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: User, label: 'Full Name', value: user?.name },
                { icon: Mail, label: 'Email', value: user?.email },
                { icon: Calendar, label: 'Joined SafeLink', value: formatDate(user?.joinedAt) },
                { icon: Zap, label: 'Account tier', value: `${user?.plan} Plan` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                  <Icon size={16} className="text-gray-500 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] text-gray-500">{label}</div>
                    <div className="text-xs font-semibold text-white mt-0.5">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* API Usage progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl mb-6 glass"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={16} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-white">API Scan Usage (Monthly)</h3>
          </div>

          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-400">{user?.scansUsed?.toLocaleString()} queries executed</span>
            <span className="text-gray-400">{user?.scansLimit?.toLocaleString()} allocation limit</span>
          </div>
          <div className="progress-bar mb-3" style={{ height: '6px' }}>
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${usagePercent}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              style={{
                background: usagePercent > 80
                  ? 'linear-gradient(90deg, #FF9F0A, #FF453A)'
                  : 'linear-gradient(90deg, #0A84FF, #5E5CE6)',
              }}
            />
          </div>
          <div className="text-[10px] text-gray-500 font-semibold">{usagePercent.toFixed(1)}% of scanner limits depleted</div>
        </motion.div>

        {/* API Key management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl mb-6 glass"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Key size={16} className="text-yellow-400" />
              <h3 className="text-sm font-semibold text-white">Developer API Key</h3>
            </div>
            <button
              onClick={handleRegenerateKey}
              disabled={regeneratingKey}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 cursor-pointer disabled:opacity-40"
            >
              <RefreshCw size={12} className={regeneratingKey ? 'animate-spin' : ''} />
              Regenerate
            </button>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
            <code className="flex-1 text-xs font-mono text-gray-300 truncate">{apiKey}</code>
            <button
              onClick={() => { navigator.clipboard?.writeText(apiKey); toast.success('API key copied!') }}
              className="text-xs px-3 py-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 border border-blue-500/20 cursor-pointer transition-all"
            >
              Copy
            </button>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 font-semibold">Do not expose developer keys inside public repository check-ins.</p>
        </motion.div>

        {/* Devices & Active Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-6 rounded-2xl mb-6 glass"
        >
          <div className="flex items-center gap-2 mb-4">
            <Laptop size={16} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Active Login Sessions</h3>
          </div>
          <div className="space-y-3">
            {sessions.map((sess) => (
              <div key={sess.id} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                <div className="flex items-center gap-3">
                  {sess.device.includes('iPhone') ? <Smartphone size={16} className="text-gray-400" /> : <Laptop size={16} className="text-gray-400" />}
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-2">
                      {sess.device}
                      {sess.active && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">Current</span>}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{sess.location}</div>
                  </div>
                </div>
                {!sess.active && (
                  <button
                    onClick={() => handleRevokeSession(sess.id)}
                    className="text-xs text-red-400 hover:text-red-300 font-bold cursor-pointer"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upgrade Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl relative overflow-hidden glass"
          style={{ borderColor: 'rgba(255,159,10,0.3)', boxShadow: '0 0 30px rgba(255,159,10,0.05)' }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown size={18} className="text-yellow-400" />
                <h3 className="text-base font-bold text-white">Upgrade to Enterprise</h3>
              </div>
              <p className="text-xs text-gray-400 max-w-sm">
                Unlock high-capacity concurrent endpoint audits, custom classifier weights, and live webhooks.
              </p>
            </div>
            <button
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #FF9F0A, #FF453A)' }}
            >
              Request Upgrade
            </button>
          </div>
        </motion.div>
      </div>
    </>
  )
}
