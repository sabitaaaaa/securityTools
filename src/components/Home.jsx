import React from 'react'
import ToolCard from './ToolCard'
import './Home.css'

const Home = () => {
  const cybersecurityTools = [
    {
      id: 1,
      name: 'Network Scanner',
      description: 'Scan and analyze network infrastructure for vulnerabilities and open ports',
      category: 'Network Security',
      icon: '🔍'
    },
    {
      id: 2,
      name: 'Vulnerability Assessment',
      description: 'Identify security weaknesses in systems and applications',
      category: 'Assessment',
      icon: '🛡️'
    },
    {
      id: 3,
      name: 'Penetration Testing',
      description: 'Simulate cyber attacks to test security defenses',
      category: 'Testing',
      icon: '⚔️'
    },
    {
      id: 4,
      name: 'Threat Intelligence',
      description: 'Monitor and analyze emerging cyber threats and attack patterns',
      category: 'Intelligence',
      icon: '📊'
    },
    {
      id: 5,
      name: 'Malware Analysis',
      description: 'Analyze malicious software to understand behavior and impact',
      category: 'Analysis',
      icon: '🔬'
    },
    {
      id: 6,
      name: 'Security Monitoring',
      description: 'Real-time monitoring of security events and incidents',
      category: 'Monitoring',
      icon: '👁️'
    },
    {
      id: 7,
      name: 'Encryption Tools',
      description: 'Secure data with advanced encryption algorithms',
      category: 'Cryptography',
      icon: '🔐'
    },
    {
      id: 8,
      name: 'Firewall Management',
      description: 'Configure and manage firewall rules and policies',
      category: 'Network Security',
      icon: '🔥'
    },
    {
      id: 9,
      name: 'Incident Response',
      description: 'Rapid response toolkit for security incidents and breaches',
      category: 'Response',
      icon: '🚨'
    }
  ]

  const stats = [
    { label: 'Active Threats', value: '1,247', trend: '+12%' },
    { label: 'Protected Systems', value: '5,432', trend: '+8%' },
    { label: 'Security Events', value: '23,891', trend: '-5%' },
    { label: 'Response Time', value: '2.3s', trend: '-15%' }
  ]

  return (
    <div className="home">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🔒</span>
            <h1>CyberShield</h1>
          </div>
          <nav className="nav">
            <a href="#tools">Tools</a>
            <a href="#dashboard">Dashboard</a>
            <a href="#reports">Reports</a>
            <a href="#settings">Settings</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h2 className="hero-title">Advanced Cybersecurity Platform</h2>
          <p className="hero-subtitle">
            Comprehensive security tools and intelligence to protect your digital infrastructure
          </p>
          <div className="hero-buttons">
            <button className="btn-primary">Get Started</button>
            <button className="btn-secondary">Learn More</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="cyber-grid"></div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className={`stat-trend ${stat.trend.startsWith('+') ? 'positive' : 'negative'}`}>
                  {stat.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tools" className="tools-section">
        <div className="container">
          <div className="section-header">
            <h2>Security Tools & Services</h2>
            <p>Comprehensive cybersecurity solutions for modern threats</p>
          </div>
          <div className="tools-grid">
            {cybersecurityTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Key Features</h2>
          </div>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🌐</div>
              <h3>Real-time Monitoring</h3>
              <p>24/7 surveillance of your network and systems</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Detection</h3>
              <p>Machine learning algorithms for threat detection</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📈</div>
              <h3>Advanced Analytics</h3>
              <p>Deep insights into security patterns and trends</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <h3>Rapid Response</h3>
              <p>Automated incident response and mitigation</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 CyberShield. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
