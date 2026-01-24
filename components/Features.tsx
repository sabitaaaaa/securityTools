const features = [
  {
    title: 'Real-time Analysis',
    description: 'Get instant results with our optimized scanning and analysis engines',
    icon: '⚡',
  },
  {
    title: 'Secure & Private',
    description: 'Your data is encrypted and never stored without your permission',
    icon: '🔒',
  },
  {
    title: 'Professional Grade',
    description: 'Enterprise-level tools used by security professionals worldwide',
    icon: '💼',
  },
  {
    title: 'Easy to Use',
    description: 'Intuitive interface designed for both beginners and experts',
    icon: '🎯',
  },
]

export default function Features() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-cyber-dark/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyber-primary to-cyber-secondary bg-clip-text text-transparent">
            Why Choose Us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-cyber-dark to-cyber-dark/50 border border-cyber-primary/30 rounded-xl p-6 text-center glow-hover"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-cyber-primary mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
