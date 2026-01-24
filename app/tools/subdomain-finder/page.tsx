'use client'

import { useState } from 'react'
import axios from 'axios'

interface SubdomainResult {
  subdomain: string
  ip: string
  status: number
}

export default function SubdomainFinder() {
  const [domain, setDomain] = useState('')
  const [results, setResults] = useState<SubdomainResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFind = async () => {
    if (!domain) {
      setError('Please enter a domain name')
      return
    }

    setLoading(true)
    setError('')
    setResults([])

    try {
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0]

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/subdomain-find`, {
        domain: cleanDomain,
      })

      setResults(response.data.subdomains)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to find subdomains')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyber-primary to-cyber-secondary bg-clip-text text-transparent">
            Subdomain Finder
          </h1>
          <p className="text-gray-400">Discover subdomains for any domain name</p>
        </div>

        <div className="bg-gradient-to-br from-cyber-dark to-cyber-dark/50 border border-cyber-primary/30 rounded-xl p-6 mb-6 glow-hover">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cyber-primary mb-2">
                Domain Name
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="w-full px-4 py-3 bg-cyber-dark border border-cyber-primary/30 rounded-lg text-white focus:outline-none focus:border-cyber-primary"
              />
            </div>

            <button
              onClick={handleFind}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? 'Finding Subdomains...' : 'Find Subdomains'}
            </button>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                {error}
              </div>
            )}
          </div>
        </div>

        {results.length > 0 && (
          <div className="bg-gradient-to-br from-cyber-dark to-cyber-dark/50 border border-cyber-primary/30 rounded-xl p-6 glow-hover">
            <h2 className="text-2xl font-semibold text-cyber-primary mb-4">
              Found Subdomains ({results.length})
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-cyber-primary/30 bg-cyber-dark/50"
                >
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-cyber-primary font-mono text-sm break-all">{result.subdomain}</div>
                      <div className="text-xs text-gray-400 mt-1">IP: {result.ip}</div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        result.status === 200
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {result.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
