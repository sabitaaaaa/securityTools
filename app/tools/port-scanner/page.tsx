'use client'

import { useState } from 'react'
import axios from 'axios'

interface PortResult {
  port: number
  protocol: string
  status: 'open' | 'closed' | 'filtered'
  service: string
  version?: string
  banner?: string
  os?: string
  firewall?: boolean
  vulnerable?: boolean
  cves?: string[]
  risk?: string
  recommendation?: string
}

interface ScanSummary {
  total: number
  open: number
  closed: number
  filtered: number
  vulnerable: number
  services: string[]
}

export default function PortScanner() {
  const [host, setHost] = useState('')
  const [ports, setPorts] = useState('80,443,22,21,25,3306,8080,3389,5900')
  const [scanType, setScanType] = useState('tcp')
  const [speed, setSpeed] = useState('normal')
  const [serviceDetection, setServiceDetection] = useState(true)
  const [versionDetection, setVersionDetection] = useState(true)
  const [osDetection, setOsDetection] = useState(true)
  const [bannerGrabbing, setBannerGrabbing] = useState(true)
  const [results, setResults] = useState<PortResult[]>([])
  const [summary, setSummary] = useState<ScanSummary | null>(null)
  const [osInfo, setOsInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPort, setSelectedPort] = useState<PortResult | null>(null)

  const handleScan = async () => {
    if (!host) {
      setError('Please enter a host or IP address')
      return
    }

    setLoading(true)
    setError('')
    setResults([])
    setSummary(null)
    setOsInfo('')

    try {
      const portList = ports.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p) && p > 0 && p < 65536)
      if (portList.length === 0) {
        setError('Please enter valid port numbers')
        setLoading(false)
        return
      }

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/port-scan`, {
        host,
        ports: portList,
        scanType,
        speed,
        serviceDetection,
        versionDetection,
        osDetection,
        bannerGrabbing,
      })

      setResults(response.data.results)
      setSummary(response.data.summary)
      setOsInfo(response.data.os)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to scan ports')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyber-primary to-cyber-secondary bg-clip-text text-transparent">
            Advanced Port Scanner
          </h1>
          <p className="text-gray-400">Professional port scanning with service detection, OS fingerprinting, and CVE mapping</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-cyber-dark to-cyber-dark/50 border border-cyber-primary/30 rounded-xl p-6 glow-hover sticky top-4">
              <h2 className="text-xl font-semibold text-cyber-primary mb-4">Scan Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cyber-primary mb-2">
                    Host / IP Address
                  </label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="example.com or 192.168.1.1"
                    className="w-full px-4 py-2 bg-cyber-dark border border-cyber-primary/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyber-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-cyber-primary mb-2">
                    Ports (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={ports}
                    onChange={(e) => setPorts(e.target.value)}
                    placeholder="80,443,22,21"
                    className="w-full px-4 py-2 bg-cyber-dark border border-cyber-primary/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyber-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-cyber-primary mb-2">
                    Scan Type
                  </label>
                  <select
                    value={scanType}
                    onChange={(e) => setScanType(e.target.value)}
                    className="w-full px-4 py-2 bg-cyber-dark border border-cyber-primary/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyber-primary"
                  >
                    <option value="tcp">TCP</option>
                    <option value="udp">UDP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cyber-primary mb-2">
                    Scan Speed
                  </label>
                  <select
                    value={speed}
                    onChange={(e) => setSpeed(e.target.value)}
                    className="w-full px-4 py-2 bg-cyber-dark border border-cyber-primary/30 rounded-lg text-white text-sm focus:outline-none focus:border-cyber-primary"
                  >
                    <option value="stealth">Stealth (Slow, Stealthy)</option>
                    <option value="normal">Normal (Balanced)</option>
                    <option value="aggressive">Aggressive (Fast)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={serviceDetection}
                      onChange={(e) => setServiceDetection(e.target.checked)}
                      className="w-4 h-4 text-cyber-primary bg-cyber-dark border-cyber-primary/30 rounded focus:ring-cyber-primary"
                    />
                    <span className="text-sm text-gray-300">Service Detection</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={versionDetection}
                      onChange={(e) => setVersionDetection(e.target.checked)}
                      className="w-4 h-4 text-cyber-primary bg-cyber-dark border-cyber-primary/30 rounded focus:ring-cyber-primary"
                    />
                    <span className="text-sm text-gray-300">Version Detection</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={osDetection}
                      onChange={(e) => setOsDetection(e.target.checked)}
                      className="w-4 h-4 text-cyber-primary bg-cyber-dark border-cyber-primary/30 rounded focus:ring-cyber-primary"
                    />
                    <span className="text-sm text-gray-300">OS Fingerprinting</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={bannerGrabbing}
                      onChange={(e) => setBannerGrabbing(e.target.checked)}
                      className="w-4 h-4 text-cyber-primary bg-cyber-dark border-cyber-primary/30 rounded focus:ring-cyber-primary"
                    />
                    <span className="text-sm text-gray-300">Banner Grabbing</span>
                  </label>
                </div>

                <button
                  onClick={handleScan}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all duration-200"
                >
                  {loading ? 'Scanning...' : 'Start Advanced Scan'}
                </button>

                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {summary && (
              <div className="bg-gradient-to-br from-cyber-dark to-cyber-dark/50 border border-cyber-primary/30 rounded-xl p-6 mb-6 glow-hover">
                <h2 className="text-xl font-semibold text-cyber-primary mb-4">Scan Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="bg-cyber-dark/50 p-3 rounded-lg border border-cyber-primary/20 text-center">
                    <div className="text-2xl font-bold text-cyber-primary">{summary.total}</div>
                    <div className="text-xs text-gray-400">Total</div>
                  </div>
                  <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/30 text-center">
                    <div className="text-2xl font-bold text-green-400">{summary.open}</div>
                    <div className="text-xs text-gray-400">Open</div>
                  </div>
                  <div className="bg-gray-500/10 p-3 rounded-lg border border-gray-500/30 text-center">
                    <div className="text-2xl font-bold text-gray-400">{summary.closed}</div>
                    <div className="text-xs text-gray-400">Closed</div>
                  </div>
                  <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/30 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{summary.filtered}</div>
                    <div className="text-xs text-gray-400">Filtered</div>
                  </div>
                  <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/30 text-center">
                    <div className="text-2xl font-bold text-red-400">{summary.vulnerable}</div>
                    <div className="text-xs text-gray-400">Vulnerable</div>
                  </div>
                </div>
                {osInfo && osInfo !== 'Unknown' && (
                  <div className="mt-4 p-3 bg-cyber-dark/50 rounded-lg border border-cyber-primary/20">
                    <span className="text-sm text-gray-400">Detected OS: </span>
                    <span className="text-sm font-semibold text-cyber-primary">{osInfo}</span>
                  </div>
                )}
                {summary.services.length > 0 && (
                  <div className="mt-4">
                    <span className="text-sm text-gray-400">Services: </span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {summary.services.map((service, idx) => (
                        <span key={idx} className="px-2 py-1 bg-cyber-primary/20 text-cyber-primary text-xs rounded">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {results.length > 0 && (
              <div className="bg-gradient-to-br from-cyber-dark to-cyber-dark/50 border border-cyber-primary/30 rounded-xl p-6 glow-hover">
                <h2 className="text-xl font-semibold text-cyber-primary mb-4">Scan Results</h2>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedPort(result)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        result.status === 'open'
                          ? result.vulnerable
                            ? 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20'
                            : 'bg-green-500/10 border-green-500/50 hover:bg-green-500/20'
                          : result.status === 'filtered'
                          ? 'bg-yellow-500/10 border-yellow-500/50 hover:bg-yellow-500/20'
                          : 'bg-gray-500/10 border-gray-500/50 hover:bg-gray-500/20'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-cyber-primary">Port {result.port}</span>
                            <span className="text-xs px-2 py-1 bg-cyber-primary/20 text-cyber-primary rounded">
                              {result.protocol}
                            </span>
                            {result.vulnerable && (
                              <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded font-semibold">
                                ⚠️ VULNERABLE
                              </span>
                            )}
                            {result.firewall && (
                              <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                                🔥 Firewall
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-300">
                            <span className="font-medium">{result.service}</span>
                            {result.version && (
                              <span className="ml-2 text-gray-400">v{result.version}</span>
                            )}
                          </div>
                          {result.banner && (
                            <div className="mt-2 text-xs text-gray-400 font-mono bg-cyber-dark/50 p-2 rounded truncate">
                              {result.banner.substring(0, 100)}...
                            </div>
                          )}
                          {result.cves && result.cves.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-red-400 font-semibold">CVEs: </span>
                              {result.cves.map((cve, idx) => (
                                <span key={idx} className="text-xs text-red-300 ml-1">{cve}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ml-2 ${
                            result.status === 'open'
                              ? 'bg-green-500/20 text-green-400'
                              : result.status === 'filtered'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {result.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedPort && (
              <div className="mt-6 bg-gradient-to-br from-cyber-dark to-cyber-dark/50 border border-cyber-primary/30 rounded-xl p-6 glow-hover">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-cyber-primary">Port {selectedPort.port} Details</h3>
                  <button
                    onClick={() => setSelectedPort(null)}
                    className="text-gray-400 hover:text-cyber-primary"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-400">Protocol: </span>
                    <span className="text-cyber-primary">{selectedPort.protocol}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Service: </span>
                    <span className="text-cyber-primary">{selectedPort.service}</span>
                  </div>
                  {selectedPort.version && (
                    <div>
                      <span className="text-gray-400">Version: </span>
                      <span className="text-cyber-primary">{selectedPort.version}</span>
                    </div>
                  )}
                  {selectedPort.banner && (
                    <div>
                      <span className="text-gray-400">Banner: </span>
                      <div className="mt-1 p-2 bg-cyber-dark/50 rounded font-mono text-xs text-gray-300 whitespace-pre-wrap">
                        {selectedPort.banner}
                      </div>
                    </div>
                  )}
                  {selectedPort.cves && selectedPort.cves.length > 0 && (
                    <div>
                      <span className="text-red-400 font-semibold">Known CVEs: </span>
                      <div className="mt-1 space-y-1">
                        {selectedPort.cves.map((cve, idx) => (
                          <div key={idx} className="text-red-300 text-xs">{cve}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedPort.recommendation && (
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                      <span className="text-yellow-400 text-xs font-semibold">⚠️ Recommendation: </span>
                      <span className="text-yellow-300 text-xs">{selectedPort.recommendation}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
