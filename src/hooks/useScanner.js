import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateMockScan } from '@/utils/mockData'
import { normalizeUrl, isValidUrl } from '@/utils/helpers'

export function useScanner() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const scan = async (rawUrl) => {
    const url = normalizeUrl(rawUrl.trim())
    if (!isValidUrl(url)) {
      setError('Please enter a valid URL')
      return
    }
    setScanning(true)
    setResult(null)
    setError(null)
    try {
      await new Promise(r => setTimeout(r, 3000))
      const scanResult = generateMockScan(url)
      setResult(scanResult)
      return scanResult
    } catch (err) {
      setError('Scan failed. Please try again.')
      return null
    } finally {
      setScanning(false)
    }
  }

  const reset = () => {
    setResult(null)
    setError(null)
    setScanning(false)
  }

  return { scan, scanning, result, error, reset }
}
