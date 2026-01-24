'use client'

import { useState } from 'react'
import axios from 'axios'

interface GeolocationData {
  ip: string
  country: string
  region: string
  city: string
  latitude: number
  longitude: number
  timezone: string
  isp: string
  org: string
  as: string
}

export default function IPGeolocation() {
  const [ip, setIp] = useState('')
  const [data, setData] = useState<GeolocationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLookup = async () => {
    if (!ip) {
      setError('Please enter an IP address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/ip-geolocation`, {
        ip,
      })

      setData(response.data.geolocation)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to get geolocation data')
    } finally {
      setLoading(false)
    }
  }

  const handleMyIP = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/ip-geolocation`, {
        ip: 'auto',
      })

      setData(response.data.geolocation)
      setIp(response.data.geolocation.ip)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to get geolocation data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyber-primary to-cyber-secondary bg-clip-text text-transparent">
            IP Geolocation
          </h1>
          <p className="text-gray-400">Get detailed geolocation information for any IP address</p>
        </div>

        <div className="bg-gradient-to-br from-cyber-dark to-cyber-dark/50 border border-cyber-primary/30 rounded-xl p-6 mb-6 glow-hover">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cyber-primary mb-2">
                IP Address
              </label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="8.8.8.8 or leave empty for your IP"
                className="w-full px-4 py-3 bg-cyber-dark border border-cyber-primary/30 rounded-lg text-white focus:outline-none focus:border-cyber-primary"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleLookup}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? 'Looking up...' : 'Lookup IP'}
              </button>
              <button
                onClick={handleMyIP}
                disabled={loading}
                className="px-6 py-3 border-2 border-cyber-primary text-cyber-primary font-semibold rounded-lg hover:bg-cyber-primary/10 disabled:opacity-50 transition-all duration-200"
              >
                My IP
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                {error}
              </div>
            )}
          </div>
        </div>

        {data && (
          <div className="bg-gradient-to-br from-cyber-dark to-cyber-dark/50 border border-cyber-primary/30 rounded-xl p-6 glow-hover">
            <h2 className="text-2xl font-semibold text-cyber-primary mb-4">Geolocation Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-cyber-dark/50 p-4 rounded-lg border border-cyber-primary/20">
                <div className="text-sm text-gray-400 mb-1">IP Address</div>
                <div className="text-lg font-semibold text-cyber-primary">{data.ip}</div>
              </div>
              <div className="bg-cyber-dark/50 p-4 rounded-lg border border-cyber-primary/20">
                <div className="text-sm text-gray-400 mb-1">Country</div>
                <div className="text-lg font-semibold text-cyber-primary">{data.country}</div>
              </div>
              <div className="bg-cyber-dark/50 p-4 rounded-lg border border-cyber-primary/20">
                <div className="text-sm text-gray-400 mb-1">Region</div>
                <div className="text-lg font-semibold text-cyber-primary">{data.region}</div>
              </div>
              <div className="bg-cyber-dark/50 p-4 rounded-lg border border-cyber-primary/20">
                <div className="text-sm text-gray-400 mb-1">City</div>
                <div className="text-lg font-semibold text-cyber-primary">{data.city}</div>
              </div>
              <div className="bg-cyber-dark/50 p-4 rounded-lg border border-cyber-primary/20">
                <div className="text-sm text-gray-400 mb-1">Latitude</div>
                <div className="text-lg font-semibold text-cyber-primary">{data.latitude}</div>
              </div>
              <div className="bg-cyber-dark/50 p-4 rounded-lg border border-cyber-primary/20">
                <div className="text-sm text-gray-400 mb-1">Longitude</div>
                <div className="text-lg font-semibold text-cyber-primary">{data.longitude}</div>
              </div>
              <div className="bg-cyber-dark/50 p-4 rounded-lg border border-cyber-primary/20">
                <div className="text-sm text-gray-400 mb-1">Timezone</div>
                <div className="text-lg font-semibold text-cyber-primary">{data.timezone}</div>
              </div>
              <div className="bg-cyber-dark/50 p-4 rounded-lg border border-cyber-primary/20">
                <div className="text-sm text-gray-400 mb-1">ISP</div>
                <div className="text-lg font-semibold text-cyber-primary truncate">{data.isp}</div>
              </div>
              <div className="bg-cyber-dark/50 p-4 rounded-lg border border-cyber-primary/20 md:col-span-2">
                <div className="text-sm text-gray-400 mb-1">Organization</div>
                <div className="text-lg font-semibold text-cyber-primary">{data.org}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
