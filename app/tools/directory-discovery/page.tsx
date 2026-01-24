'use client'

import { useState } from 'react'
import axios from 'axios'

interface DirectoryResult {
  path: string
  status: number
  size?: number
}

export default function DirectoryDiscovery() {
  const [url, setUrl] = useState('')
  const [wordlist, setWordlist] = useState('admin\napi\nbackup\ndatabase\ndownload\nfiles\nimages\nlogin\nprivate\nsecret\ntest\nuploads\nwww')
  const [results, setResults] = useState<DirectoryResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDiscover = async () => {
    if (!url) {
      setError('Please enter a URL')
      return
    }

    setLoading(true)
    setError('')
    setResults([])

    try {
      let checkUrl = url
      if (!checkUrl.startsWith('http://') && !checkUrl.startsWith('https://')) {
        checkUrl = 'https://' + checkUrl
      }

      const paths = wordlist.split('\n').filter(p => p.trim())

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/directory-discovery`, {
        url: checkUrl,
        wordlist: paths,
      })

      setResults(response.data.results)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to discover directories')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyber-primary to-cyber-secondary bg-clip-text text-transparent">
            Directory Discovery Tool
          </h1>
          <p className="text-gray-400">Discover hidden directories and paths on web servers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-cyber-dark to-cyber-dark/50 border border-cyber-primary/30 rounded-xl p-6 glow-hover">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cyber-primary mb-2">
                  Target URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="example.com"
                  className="w-full px-4 py-3 bg-cyber-dark border border-cyber-primary/30 rounded-lg text-white focus:outline-none focus:border-cyber-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cyber-primary mb-2">
                  Wordlist (one per line)
                </label>
                <textarea
                  value={wordlist}
                  onChange={(e) => setWordlist(e.target.value)}
                  placeholder="admin&#10;api&#10;backup"
                  className="w-full h-64 px-4 py-3 bg-cyber-dark border border-cyber-primary/30 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-cyber-primary resize-none"
                />
              </div>

              <button
                onClick={handleDiscover}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? 'Discovering...' : 'Start Discovery'}
              </button>

              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyber-dark to-cyber-dark/50 border border-cyber-primary/30 rounded-xl p-6 glow-hover">
            <h2 className="text-xl font-semibold text-cyber-primary mb-4">
              Discovered Directories ({results.length})
            </h2>
            {results.length > 0 ? (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.status === 200
                        ? 'bg-green-500/10 border-green-500/50'
                        : result.status === 403
                        ? 'bg-yellow-500/10 border-yellow-500/50'
                        : 'bg-gray-500/10 border-gray-500/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="text-cyber-primary font-mono text-sm break-all">{result.path}</div>
                        {result.size !== undefined && (
                          <div className="text-xs text-gray-400 mt-1">Size: {result.size} bytes</div>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ml-2 ${
                          result.status === 200
                            ? 'bg-green-500/20 text-green-400'
                            : result.status === 403
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {result.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                {loading ? 'Scanning...' : 'No results yet. Start a discovery scan.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
