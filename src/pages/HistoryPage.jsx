import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  Search, Trash2, ChevronLeft, ChevronRight, Download, SortAsc, SortDesc
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getScanHistory, deleteScan, clearScanHistory } from '@/services/scannerService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getScoreColor, getScoreLabel, timeAgo } from '@/utils/helpers'
import Badge from '@/components/common/Badge'
import Dialog from '@/components/ui/Dialog'
import EmptyState from '@/components/ui/EmptyState'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10

export default function HistoryPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState(null)
  const [deleteAllDialog, setDeleteAllDialog] = useState(false)
  const [selected, setSelected] = useState(new Set())

  // Fetch history using React Query
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['history', search, filterStatus, sortBy, sortDir, page],
    queryFn: () => getScanHistory({
      search,
      status: filterStatus,
      sortBy,
      sortDir,
      page,
      limit: PAGE_SIZE,
    }),
  })

  const paginated = data?.data || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || 0

  const handleDelete = async (id) => {
    try {
      await deleteScan(id)
      setDeleteId(null)
      refetch()
      toast.success('Scan removed from history')
    } catch (e) {
      toast.error('Failed to remove scan report')
    }
  }

  const handleDeleteAll = async () => {
    try {
      await clearScanHistory()
      setDeleteAllDialog(false)
      refetch()
      toast.success('History cleared successfully')
    } catch (e) {
      toast.error('Failed to clear history')
    }
  }

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(Array.from(selected).map(id => deleteScan(id)))
      setSelected(new Set())
      refetch()
      toast.success(`${selected.size} scans removed`)
    } catch (e) {
      toast.error('Failed to delete selected scans')
    }
  }

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('desc') }
    setPage(1)
  }

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <SortAsc size={12} className="text-gray-600" />
    return sortDir === 'asc' ? <SortAsc size={12} className="text-blue-400" /> : <SortDesc size={12} className="text-blue-400" />
  }

  const handleExportCSV = () => {
    if (paginated.length === 0) return
    const headers = ['URL', 'Domain', 'Response Time (ms)', 'Protocol', 'Score', 'Status', 'Date']
    const rows = paginated.map(scan => [
      scan.url,
      scan.domain,
      scan.responseTime,
      scan.isHttps ? 'HTTPS' : 'HTTP',
      scan.score,
      scan.httpStatus,
      scan.scannedAt
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `safelink_history_export_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('CSV Export downloaded!')
  }

  return (
    <>
      <Helmet>
        <title>Scan History – SafeLink AI</title>
        <meta name="description" content="View your complete URL scan history with filtering, sorting, and search." />
      </Helmet>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Scan History</h2>
        <p className="text-gray-400 text-xs">{total} total scans logged</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search URLs or domains..."
            className="input-dark pl-9 text-xs"
            aria-label="Search scan history"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {['all', 'safe', 'warning', 'danger'].map((f) => (
            <button
              key={f}
              onClick={() => { setFilterStatus(f); setPage(1) }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${filterStatus === f ? 'text-white' : 'text-gray-400 hover:text-white'}`}
              style={{
                background: filterStatus === f
                  ? f === 'safe' ? 'rgba(48,209,88,0.2)' : f === 'danger' ? 'rgba(255,69,58,0.2)' : f === 'warning' ? 'rgba(255,159,10,0.2)' : 'rgba(10,132,255,0.2)'
                  : 'rgba(255,255,255,0.05)',
                border: `0.5px solid ${filterStatus === f
                  ? f === 'safe' ? 'rgba(48,209,88,0.4)' : f === 'danger' ? 'rgba(255,69,58,0.4)' : f === 'warning' ? 'rgba(255,159,10,0.4)' : 'rgba(10,132,255,0.4)'
                  : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {selected.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 border border-red-500/30 transition-all cursor-pointer"
            >
              <Trash2 size={13} /> Delete ({selected.size})
            </button>
          )}
          {total > 0 && (
            <>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                <Download size={13} /> Export CSV
              </button>
              <button
                onClick={() => setDeleteAllDialog(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                <Trash2 size={13} /> Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden glass">
        {isLoading ? (
          <div className="h-[40vh] flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : paginated.length === 0 ? (
          <EmptyState
            type={search || filterStatus !== 'all' ? 'no-results' : 'no-history'}
            action={search ? () => { setSearch(''); setFilterStatus('all') } : undefined}
            actionLabel="Clear filters"
          />
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-gray-500 border-b border-white/[0.06]">
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  className="accent-blue-500 cursor-pointer"
                  checked={selected.size === paginated.length && paginated.length > 0}
                  onChange={() => {
                    if (selected.size === paginated.length) setSelected(new Set())
                    else setSelected(new Set(paginated.map(s => s.id)))
                  }}
                  aria-label="Select all"
                />
              </div>
              <button
                className="col-span-5 flex items-center gap-1 text-left hover:text-gray-300 transition-colors cursor-pointer"
                onClick={() => toggleSort('domain')}
              >
                URL <SortIcon field="domain" />
              </button>
              <button
                className="col-span-2 hidden md:flex items-center gap-1 hover:text-gray-300 transition-colors cursor-pointer"
                onClick={() => toggleSort('date')}
              >
                Scanned <SortIcon field="date" />
              </button>
              <div className="col-span-2 hidden sm:flex items-center">Protocol</div>
              <button
                className="col-span-1 flex items-center gap-1 hover:text-gray-300 transition-colors cursor-pointer"
                onClick={() => toggleSort('score')}
              >
                Score <SortIcon field="score" />
              </button>
              <div className="col-span-1" />
            </div>

            {/* Table rows */}
            <div className="divide-y divide-white/[0.04]">
              <AnimatePresence>
                {paginated.map((scan, i) => {
                  const color = getScoreColor(scan.score)
                  return (
                    <motion.div
                      key={scan.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="grid grid-cols-12 gap-4 px-4 py-3.5 hover:bg-white/[0.02] cursor-pointer items-center transition-all"
                      onClick={() => navigate(`/scan/${scan.id}`, { state: { scan } })}
                    >
                      <div className="col-span-1" onClick={(e) => { e.stopPropagation(); toggleSelect(scan.id) }}>
                        <input
                          type="checkbox"
                          className="accent-blue-500 cursor-pointer"
                          checked={selected.has(scan.id)}
                          onChange={() => {}}
                          aria-label={`Select ${scan.domain}`}
                        />
                      </div>
                      <div className="col-span-5 flex items-center gap-3 min-w-0">
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${scan.domain}&sz=32`}
                          alt=""
                          className="w-6 h-6 rounded flex-shrink-0"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate">{scan.domain}</div>
                          <div className="text-[10px] text-gray-500 truncate">{scan.url}</div>
                        </div>
                      </div>
                      <div className="col-span-2 hidden md:block text-[10px] text-gray-500">{timeAgo(scan.scannedAt)}</div>
                      <div className="col-span-2 hidden sm:flex">
                        <Badge variant={scan.isHttps ? 'safe' : 'danger'} size="xs">
                          {scan.isHttps ? 'HTTPS' : 'HTTP'}
                        </Badge>
                      </div>
                      <div className="col-span-1">
                        <div className="text-xs font-bold" style={{ color }}>{scan.score}</div>
                      </div>
                      <div className="col-span-1 flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setDeleteId(scan.id)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                          aria-label="Delete scan"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06] bg-white/[0.01]">
                <span className="text-[10px] text-gray-500 font-semibold uppercase">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = i + 1
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer ${page === p ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        style={page === p ? { background: 'rgba(10,132,255,0.2)', border: '0.5px solid rgba(10,132,255,0.4)' } : {}}
                      >
                        {p}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete single dialog */}
      <Dialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Scan">
        <p className="text-gray-400 text-xs mb-6">Are you sure you want to remove this scan from your history? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            Cancel
          </button>
          <button
            onClick={() => handleDelete(deleteId)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #FF453A, #FF3B30)' }}
          >
            Delete
          </button>
        </div>
      </Dialog>

      {/* Delete all dialog */}
      <Dialog isOpen={deleteAllDialog} onClose={() => setDeleteAllDialog(false)} title="Clear All History">
        <p className="text-gray-400 text-xs mb-6">This will permanently delete all {total} scans from your history. This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteAllDialog(false)} className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            Cancel
          </button>
          <button
            onClick={handleDeleteAll}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #FF453A, #FF3B30)' }}
          >
            Clear All History
          </button>
        </div>
      </Dialog>
    </>
  )
}
