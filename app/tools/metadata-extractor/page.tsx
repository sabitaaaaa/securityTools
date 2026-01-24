'use client'

import { useState } from 'react'
import axios from 'axios'

interface Metadata {
  filename: string
  size: number
  type: string
  exif?: Record<string, any>
  general: Record<string, any>
}

export default function MetadataExtractor() {
  const [file, setFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setMetadata(null)
      setError('')
    }
  }

  const handleExtract = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/metadata-extract`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      setMetadata(response.data.metadata)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to extract metadata')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyber-primary to-cyber-secondary bg-clip-text text-transparent">
            Metadata Extractor
          </h1>
          <p className="text-gray-400">Extract metadata from files and images</p>
        </div>

        <div className="bg-gradient-to-br from-cyber-dark to-cyber-dark/50 border border-cyber-primary/30 rounded-xl p-6 mb-6 glow-hover">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cyber-primary mb-2">
                Select File
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-4 py-3 bg-cyber-dark border border-cyber-primary/30 rounded-lg text-white focus:outline-none focus:border-cyber-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyber-primary file:text-white hover:file:bg-cyber-secondary"
              />
              {file && (
                <div className="mt-2 text-sm text-gray-400">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </div>
              )}
            </div>

            <button
              onClick={handleExtract}
              disabled={loading || !file}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? 'Extracting...' : 'Extract Metadata'}
            </button>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                {error}
              </div>
            )}
          </div>
        </div>

        {metadata && (
          <div className="bg-gradient-to-br from-cyber-dark to-cyber-dark/50 border border-cyber-primary/30 rounded-xl p-6 glow-hover">
            <h2 className="text-2xl font-semibold text-cyber-primary mb-4">Extracted Metadata</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-cyber-dark/50 p-4 rounded-lg border border-cyber-primary/20">
                  <div className="text-sm text-gray-400 mb-1">Filename</div>
                  <div className="text-lg font-semibold text-cyber-primary">{metadata.filename}</div>
                </div>
                <div className="bg-cyber-dark/50 p-4 rounded-lg border border-cyber-primary/20">
                  <div className="text-sm text-gray-400 mb-1">Size</div>
                  <div className="text-lg font-semibold text-cyber-primary">{(metadata.size / 1024).toFixed(2)} KB</div>
                </div>
                <div className="bg-cyber-dark/50 p-4 rounded-lg border border-cyber-primary/20 col-span-2">
                  <div className="text-sm text-gray-400 mb-1">MIME Type</div>
                  <div className="text-lg font-semibold text-cyber-primary">{metadata.type}</div>
                </div>
              </div>

              {Object.keys(metadata.general).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-cyber-primary mb-2">General Information</h3>
                  <div className="bg-cyber-dark/50 p-4 rounded-lg border border-cyber-primary/20 font-mono text-sm max-h-64 overflow-y-auto">
                    {Object.entries(metadata.general).map(([key, value]) => (
                      <div key={key} className="mb-2">
                        <span className="text-cyber-primary">{key}:</span>{' '}
                        <span className="text-gray-300">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {metadata.exif && Object.keys(metadata.exif).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-cyber-primary mb-2">EXIF Data</h3>
                  <div className="bg-cyber-dark/50 p-4 rounded-lg border border-cyber-primary/20 font-mono text-sm max-h-64 overflow-y-auto">
                    {Object.entries(metadata.exif).map(([key, value]) => (
                      <div key={key} className="mb-2">
                        <span className="text-cyber-primary">{key}:</span>{' '}
                        <span className="text-gray-300">{String(value)}</span>
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
  )
}
