import apiClient from '@/lib/axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

// ── URL Scanning ───────────────────────────────────────────

export async function scanUrl(url) {
  try {
    const response = await apiClient.post('/scan', { url })
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to analyze URL')
  }
}

export async function getScanById(id) {
  try {
    const response = await apiClient.get(`/scan/${id}`)
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Scan report not found')
  }
}

export async function getScanHistory(params = {}) {
  try {
    const response = await apiClient.get('/scan/history', { params })
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to load history')
  }
}

export async function deleteScan(id) {
  try {
    const response = await apiClient.delete(`/scan/${id}`)
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to delete scan report')
  }
}

export async function clearScanHistory() {
  try {
    const response = await apiClient.delete('/scan/clear')
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to clear scan history')
  }
}

// ── Dashboard Stats ────────────────────────────────────────

export async function getDashboardStats() {
  try {
    const response = await apiClient.get('/stats')
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to load dashboard metrics')
  }
}

// ── AI Chat — Non-streaming (simple JSON) ─────────────────

export async function sendChatMessage(message, scanId = null, conversationId = null) {
  try {
    const response = await apiClient.post('/ai/chat', {
      message,
      scanId,
      conversationId,
      stream: false,
    })
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to communicate with AI Assistant')
  }
}

// ── AI Chat — Streaming (SSE via fetch) ───────────────────
/**
 * sendChatStream — Real-time streaming chat with SSE.
 * @param {string} message - User's message text
 * @param {object} options - { scanId, conversationId, onChunk, onDone, onError }
 * @param {Function} options.onChunk - Called with each streamed text chunk
 * @param {Function} options.onConversationId - Called once with conversationId from first event
 * @param {Function} options.onDone - Called when streaming completes
 * @param {Function} options.onError - Called on error
 * @returns {Function} abort - Call to cancel the stream
 */
export function sendChatStream(message, { scanId = null, conversationId = null, onChunk, onConversationId, onDone, onError } = {}) {
  const controller = new AbortController()

  const token = localStorage.getItem('safelink-token')

  const headers = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, scanId, conversationId, stream: true }),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()

          if (data === '[DONE]') {
            onDone?.()
            return
          }

          try {
            const parsed = JSON.parse(data)
            if (parsed.error) {
              onError?.(parsed.error)
              return
            }
            if (parsed.conversationId) {
              onConversationId?.(parsed.conversationId)
            }
            if (parsed.chunk) {
              onChunk?.(parsed.chunk)
            }
          } catch {
            // Ignore malformed SSE lines
          }
        }
      }

      onDone?.()
    })
    .catch((err) => {
      if (err.name === 'AbortError') return // User cancelled
      onError?.(err.message || 'Stream connection failed')
    })

  // Return abort function so caller can cancel
  return () => controller.abort()
}

// ── Conversations ──────────────────────────────────────────

export async function getConversations() {
  try {
    const response = await apiClient.get('/ai/conversations')
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to load conversations')
  }
}

export async function createConversation(title, scanId = null) {
  try {
    const response = await apiClient.post('/ai/conversations', { title, scanId })
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to create conversation')
  }
}

export async function updateConversation(id, data) {
  try {
    const response = await apiClient.patch(`/ai/conversations/${id}`, data)
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to update conversation')
  }
}

export async function deleteConversation(id) {
  try {
    const response = await apiClient.delete(`/ai/conversations/${id}`)
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to delete conversation')
  }
}

// ── Account ────────────────────────────────────────────────

export async function changePassword(currentPassword, newPassword) {
  try {
    const response = await apiClient.put('/auth/change-password', { currentPassword, newPassword })
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to change password')
  }
}
