export default function Stats() {
  const stats = [
    { label: 'Security Tools', value: '7+', icon: '🔧' },
    { label: 'Scans Performed', value: '10K+', icon: '📊' },
    { label: 'Active Users', value: '500+', icon: '👥' },
    { label: 'Uptime', value: '99.9%', icon: '⚡' },
  ]

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-cyber-dark to-cyber-dark/50 border border-cyber-primary/30 rounded-xl p-6 text-center glow-hover"
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold text-cyber-primary mb-2">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
