import apiClient from '@/lib/axios'

// Scan a URL
export async function scanUrl(url) {
  try {
    const response = await apiClient.post('/scan', { url })
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to analyze URL')
  }
}

// Get scan by ID
export async function getScanById(id) {
  try {
    const response = await apiClient.get(`/scan/${id}`)
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Scan report not found')
  }
}

// Get scan history with filters
export async function getScanHistory(params = {}) {
  try {
    const response = await apiClient.get('/scan/history', { params })
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to load history')
  }
}

// Delete a scan from history
export async function deleteScan(id) {
  try {
    const response = await apiClient.delete(`/scan/${id}`)
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to delete scan report')
  }
}

// Clear all scan history for the user
export async function clearScanHistory() {
  try {
    const response = await apiClient.delete('/scan/clear')
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to clear scan history')
  }
}

// Fetch dashboard statistics
export async function getDashboardStats() {
  try {
    const response = await apiClient.get('/stats')
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to load dashboard metrics')
  }
}

// Send a message to the AI Chatbot Assistant
export async function sendChatMessage(message, scanId = null, conversationId = null) {
  try {
    const response = await apiClient.post('/ai/chat', { message, scanId, conversationId, stream: false })
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to communicate with AI Assistant')
  }
}

// Get all conversations
export async function getConversations() {
  try {
    const response = await apiClient.get('/ai/conversations')
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to load conversations')
  }
}

// Create new conversation
export async function createConversation(title, scanId = null) {
  try {
    const response = await apiClient.post('/ai/conversations', { title, scanId })
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to create conversation')
  }
}

// Update conversation
export async function updateConversation(id, data) {
  try {
    const response = await apiClient.patch(`/ai/conversations/${id}`, data)
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to update conversation')
  }
}

// Delete conversation
export async function deleteConversation(id) {
  try {
    const response = await apiClient.delete(`/ai/conversations/${id}`)
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to delete conversation')
  }
}

// Change account password
export async function changePassword(currentPassword, newPassword) {
  try {
    const response = await apiClient.put('/auth/change-password', { currentPassword, newPassword })
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to change password')
  }
}
