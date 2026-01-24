'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Port Scanner', href: '/tools/port-scanner' },
    { name: 'Log Analyzer', href: '/tools/log-analyzer' },
    { name: 'Website Checker', href: '/tools/website-checker' },
    { name: 'Directory Discovery', href: '/tools/directory-discovery' },
    { name: 'IP Geolocation', href: '/tools/ip-geolocation' },
    { name: 'Metadata Extractor', href: '/tools/metadata-extractor' },
    { name: 'Subdomain Finder', href: '/tools/subdomain-finder' },
  ]

  return (
    <nav className="bg-cyber-dark/90 backdrop-blur-md border-b border-cyber-primary/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyber-primary to-cyber-secondary rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold">🛡️</span>
            </div>
            <span className="text-xl font-bold text-cyber-primary">CyberSec</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-cyber-primary hover:bg-cyber-primary/10 rounded-lg transition-all duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-cyber-primary focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-cyber-primary/20">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-cyber-primary hover:bg-cyber-primary/10 rounded-lg"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
