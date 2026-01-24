import Link from 'next/link'

const tools = [
  {
    name: 'Port Scanner',
    description: 'Scan open ports on any host or IP address',
    icon: '🔍',
    href: '/tools/port-scanner',
    color: 'from-cyber-primary to-cyan-500',
  },
  {
    name: 'Log File Analyzer',
    description: 'Analyze and parse log files for security events',
    icon: '📝',
    href: '/tools/log-analyzer',
    color: 'from-cyber-secondary to-purple-500',
  },
  {
    name: 'Website Status Checker',
    description: 'Check website availability and response times',
    icon: '🌐',
    href: '/tools/website-checker',
    color: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Directory Discovery',
    description: 'Discover hidden directories and paths on web servers',
    icon: '📁',
    href: '/tools/directory-discovery',
    color: 'from-cyber-accent to-pink-500',
  },
  {
    name: 'IP Geolocation',
    description: 'Get detailed geolocation information for any IP address',
    icon: '📍',
    href: '/tools/ip-geolocation',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    name: 'Metadata Extractor',
    description: 'Extract metadata from files and images',
    icon: '📄',
    href: '/tools/metadata-extractor',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    name: 'Subdomain Finder',
    description: 'Discover subdomains for any domain name',
    icon: '🔎',
    href: '/tools/subdomain-finder',
    color: 'from-teal-500 to-cyan-500',
  },
]

export default function ToolsGrid() {
  return (
    <section id="tools" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyber-primary to-cyber-secondary bg-clip-text text-transparent">
            Security Tools
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Professional-grade cybersecurity tools to help you secure and analyze your infrastructure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <Link
              key={index}
              href={tool.href}
              className="group relative bg-gradient-to-br from-cyber-dark to-cyber-dark/50 border border-cyber-primary/30 rounded-xl p-6 hover:border-cyber-primary transition-all duration-300 glow-hover transform hover:scale-105"
            >
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {tool.icon}
              </div>
              <h3 className="text-xl font-semibold text-cyber-primary mb-2">{tool.name}</h3>
              <p className="text-gray-400 text-sm">{tool.description}</p>
              <div className="mt-4 text-cyber-primary text-sm font-medium group-hover:translate-x-2 transition-transform duration-300">
                Use Tool →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
