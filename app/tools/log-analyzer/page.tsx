'use client'

import { useState } from 'react'
import axios from 'axios'

interface LogAnalysis {
  totalLines: number
  parsedLines: number
  logFormat: string
  errors: number
  warnings: number
  info: number
  topIPs: Array<{ ip: string; count: number }>
  topPaths: Array<{ path: string; count: number }>
  statusCodes: Array<{ code: number; count: number }>
  bruteForce: Array<{ ip: string; attempts: number; timeWindow: string; risk: string }>
  suspicious: {
    sqlInjection: Array<any>
    xss: Array<any>
    pathTraversal: Array<any>
    suspiciousPaths: Array<any>
    repeated404: Array<{ path: string; count: number }>
  }
  geoMap: Array<{ ip: string; count: number; country: string; city: string; latitude: number; longitude: number }>
  timeGraph: Array<{ hour: number; count: number }>
}

export default function LogAnalyzer() {
  const [logContent, setLogContent] = useState('')
  const [logFormat, setLogFormat] = useState('auto')
  const [analysis, setAnalysis] = useState<LogAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const handleAnalyze = async () => {
    if (!logContent.trim()) {
      setError('Please paste log content')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/log-analyze`, {
        logContent,
        logFormat: logFormat === 'auto' ? undefined : logFormat,
      })

      setAnalysis(response.data.analysis)
      setActiveTab('overview')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze logs')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyber-primary to-cyber-secondary bg-clip-text text-transparent">
            Advanced Log Analyzer
          </h1>
          <p className="text-gray-400">Detect attacks, brute-force attempts, and security threats in your logs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-cyber-dark to-cyber-dark/50 border border-cyber-primary/30 rounded-xl p-6 glow-hover">
              <h2 className="text-xl font-semibold text-cyber-primary mb-4">Log Input</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cyber-primary mb-2">
                    Log Format
                  </label>
                  <select
                    value={logFormat}
                    onChange={(e) => setLogFormat(e.target.value)}
                    className="w-full px-4 py-2 bg-cyber-dark border border-cyber-primary/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyber-primary"
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="apache">Apache</option>
                    <option value="nginx">Nginx</option>
                    <option value="ssh">SSH</option>
                    <option value="generic">Generic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyber-primary mb-2">
                    Paste Log Content
                  </label>
                  <textarea
                    value={logContent}
                    onChange={(e) => setLogContent(e.target.value)}
                    placeholder="Paste your log file content here..."
                    className="w-full h-96 px-4 py-3 bg-cyber-dark border border-cyber-primary/30 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyber-primary resize-none"
                  />
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all duration-200"
                >
                  {loading ? 'Analyzing...' : 'Analyze Logs'}
                </button>
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {analysis && (
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-cyber-dark to-cyber-dark/50 border border-cyber-primary/30 rounded-xl p-6 glow-hover">
                <div className="flex space-x-2 mb-6 border-b border-cyber-primary/20">
                  {['overview', 'threats', 'geo', 'timeline'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                        activeTab === tab
                          ? 'bg-cyber-primary/20 text-cyber-primary border-b-2 border-cyber-primary'
                          : 'text-gray-400 hover:text-cyber-primary'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-cyber-dark/50 p-4 rounded-lg border border-cyber-primary/20">
                        <div className="text-2xl font-bold text-cyber-primary">{analysis.totalLines}</div>
                        <div className="text-sm text-gray-400">Total Lines</div>
                      </div>
                      <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/30">
                        <div className="text-2xl font-bold text-red-400">{analysis.errors}</div>
                        <div className="text-sm text-gray-400">Errors</div>
                      </div>
                      <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
                        <div className="text-2xl font-bold text-yellow-400">{analysis.warnings}</div>
                        <div className="text-sm text-gray-400">Warnings</div>
                      </div>
                      <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
                        <div className="text-2xl font-bold text-green-400">{analysis.info}</div>
                        <div className="text-sm text-gray-400">Info</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-cyber-primary mb-3">Detected Format: {analysis.logFormat.toUpperCase()}</h3>
                    </div>

                    {analysis.topIPs.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-cyber-primary mb-3">Top IP Addresses</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {analysis.topIPs.slice(0, 10).map((item, idx) => (
                            <div key={idx} className="flex justify-between p-2 bg-cyber-dark/50 rounded">
                              <span className="text-gray-300 font-mono text-sm">{item.ip}</span>
                              <span className="text-cyber-primary font-semibold">{item.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.topPaths.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-cyber-primary mb-3">Top Paths</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {analysis.topPaths.slice(0, 10).map((item, idx) => (
                            <div key={idx} className="flex justify-between p-2 bg-cyber-dark/50 rounded">
                              <span className="text-gray-300 text-sm truncate flex-1">{item.path}</span>
                              <span className="text-cyber-primary font-semibold ml-2">{item.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'threats' && (
                  <div className="space-y-6">
                    {analysis.bruteForce.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-red-400 mb-3">⚠️ Brute Force Attacks Detected</h3>
                        <div className="space-y-3">
                          {analysis.bruteForce.map((attack, idx) => (
                            <div key={idx} className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-semibold text-red-400">{attack.ip}</div>
                                  <div className="text-sm text-gray-400">
                                    {attack.attempts} attempts in {attack.timeWindow}
                                  </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  attack.risk === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                                  attack.risk === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {attack.risk}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.suspicious.sqlInjection.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-red-400 mb-3">🚨 SQL Injection Attempts</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {analysis.suspicious.sqlInjection.slice(0, 10).map((item, idx) => (
                            <div key={idx} className="p-3 bg-red-500/10 border border-red-500/30 rounded text-sm">
                              <span className="text-red-400 font-mono">Line {item.line}:</span>
                              <span className="text-gray-300 ml-2">{item.ip}</span>
                              <span className="text-gray-400 ml-2">{item.path}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.suspicious.xss.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-red-400 mb-3">🚨 XSS Attempts</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {analysis.suspicious.xss.slice(0, 10).map((item, idx) => (
                            <div key={idx} className="p-3 bg-red-500/10 border border-red-500/30 rounded text-sm">
                              <span className="text-red-400 font-mono">Line {item.line}:</span>
                              <span className="text-gray-300 ml-2">{item.ip}</span>
                              <span className="text-gray-400 ml-2">{item.path}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.suspicious.repeated404.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-400 mb-3">⚠️ Repeated 404 Errors (Possible Probing)</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {analysis.suspicious.repeated404.map((item, idx) => (
                            <div key={idx} className="flex justify-between p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                              <span className="text-gray-300 text-sm">{item.path}</span>
                              <span className="text-yellow-400 font-semibold">{item.count} times</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'geo' && analysis.geoMap.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-cyber-primary mb-4">Attack Source Geolocation</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {analysis.geoMap.map((item, idx) => (
                        <div key={idx} className="p-4 bg-cyber-dark/50 rounded-lg border border-cyber-primary/20">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-mono text-cyber-primary">{item.ip}</span>
                            <span className="text-gray-400">{item.count} requests</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            📍 {item.city}, {item.country}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'timeline' && analysis.timeGraph.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-cyber-primary mb-4">Time-based Activity Graph</h3>
                    <div className="space-y-2">
                      {analysis.timeGraph.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <span className="text-sm text-gray-400 w-12">{item.hour}:00</span>
                          <div className="flex-1 bg-cyber-dark/50 rounded-full h-6 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-cyber-primary to-cyber-secondary h-full rounded-full flex items-center justify-end pr-2"
                              style={{ width: `${(item.count / Math.max(...analysis.timeGraph.map(t => t.count))) * 100}%` }}
                            >
                              <span className="text-xs text-white font-semibold">{item.count}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
