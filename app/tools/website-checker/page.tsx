'use client'

import { useState } from 'react'
import axios from 'axios'

interface WebsiteStatus {
  url: string
  status: number
  statusText: string
  responseTime: number
  headers: Record<string, string>
  ssl?: {
    valid: boolean
    issuer?: string
    expiry?: string
  }
}

export default function WebsiteChecker() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<WebsiteStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheck = async () => {
    if (!url) {
      setError('Please enter a URL')
      return
    }

    setLoading(true)
    setError('')

    try {
      let checkUrl = url
      if (!checkUrl.startsWith('http://') && !checkUrl.startsWith('https://')) {
        checkUrl = 'https://' + checkUrl
      }

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/website-check`, {
        url: checkUrl,
      })

      setStatus(response.data.status)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to check website')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyber-primary to-cyber-secondary bg-clip-text text-transparent">
            Website Status Checker
          </h1>
          <p className="text-gray-400">Check website availability and response times</p>
        </div>

        <div className="bg-gradient-to-br from-cyber-dark to-cyber-dark/50 border border-cyber-primary/30 rounded-xl p-6 mb-6 glow-hover">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cyber-primary mb-2">
                Website URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="example.com or https://example.com"
                className="w-full px-4 py-3 bg-cyber-dark border border-cyber-primary/30 rounded-lg text-white focus:outline-none focus:border-cyber-primary"
              />
            </div>

            <button
              onClick={handleCheck}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? 'Checking...' : 'Check Website'}
            </button>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                {error}
              </div>
            )}
          </div>
        </div>

        {status && (
          <div className="bg-gradient-to-br from-cyber-dark to-cyber-dark/50 border border-cyber-primary/30 rounded-xl p-6 glow-hover">
            <h2 className="text-2xl font-semibold text-cyber-primary mb-4">Status Results</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-cyber-dark/50 p-4 rounded-lg border border-cyber-primary/20">
                  <div className="text-sm text-gray-400 mb-1">Status Code</div>
                  <div className={`text-2xl font-bold ${status.status === 200 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {status.status}
                  </div>
                </div>
                <div className="bg-cyber-dark/50 p-4 rounded-lg border border-cyber-primary/20">
                  <div className="text-sm text-gray-400 mb-1">Response Time</div>
                  <div className="text-2xl font-bold text-cyber-primary">{status.responseTime}ms</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-1">Status</div>
                <div className="text-lg text-gray-300">{status.statusText}</div>
              </div>

              {status.ssl && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">SSL Certificate</div>
                  <div className={`text-lg ${status.ssl.valid ? 'text-green-400' : 'text-red-400'}`}>
                    {status.ssl.valid ? '✓ Valid' : '✗ Invalid'}
                  </div>
                  {status.ssl.issuer && (
                    <div className="text-sm text-gray-400 mt-1">Issuer: {status.ssl.issuer}</div>
                  )}
                </div>
              )}

              <div>
                <div className="text-sm text-gray-400 mb-2">Response Headers</div>
                <div className="bg-cyber-dark/50 p-4 rounded-lg border border-cyber-primary/20 font-mono text-xs max-h-64 overflow-y-auto">
                  {Object.entries(status.headers).map(([key, value]) => (
                    <div key={key} className="mb-1">
                      <span className="text-cyber-primary">{key}:</span>{' '}
                      <span className="text-gray-300">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
