import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

const CustomTooltipStyle = {
  background: '#1a2235',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  padding: '10px 14px',
  fontFamily: 'Inter, sans-serif',
  fontSize: '13px',
  color: '#F9FAFB',
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={CustomTooltipStyle}>
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-xs capitalize">{entry.name}:</span>
          <span className="text-xs font-semibold">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function ScanAreaChart({ data }) {
  return (
    <div className="p-6 rounded-2xl" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
      <h3 className="text-sm font-semibold text-gray-400 mb-6">Scan Activity (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <defs>
            <linearGradient id="gradSafe" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradUnsafe" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="safe" stroke="#22C55E" strokeWidth={2} fill="url(#gradSafe)" />
          <Area type="monotone" dataKey="unsafe" stroke="#EF4444" strokeWidth={2} fill="url(#gradUnsafe)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ScanBarChart({ data }) {
  return (
    <div className="p-6 rounded-2xl" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
      <h3 className="text-sm font-semibold text-gray-400 mb-6">Daily Scan Volume</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SecurityPieChart({ data }) {
  return (
    <div className="p-6 rounded-2xl" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
      <h3 className="text-sm font-semibold text-gray-400 mb-4">Security Breakdown</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value}%`, '']}
            contentStyle={CustomTooltipStyle}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
            <span className="text-xs text-gray-500 truncate">{item.name}</span>
            <span className="text-xs font-semibold text-white ml-auto">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
