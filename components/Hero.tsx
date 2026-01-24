export default function Hero() {
  return (
    <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-primary/10 via-cyber-secondary/10 to-cyber-accent/10"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMGQ0ZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
      
      <div className="relative max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyber-primary via-cyber-secondary to-cyber-accent bg-clip-text text-transparent">
          CyberSecurity Platform
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Advanced security tools for professionals. Scan ports, analyze logs, discover vulnerabilities, and secure your infrastructure.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#tools"
            className="px-8 py-4 bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white font-semibold rounded-lg glow-hover transform hover:scale-105 transition-all duration-200"
          >
            Explore Tools
          </a>
          <a
            href="/tools/port-scanner"
            className="px-8 py-4 border-2 border-cyber-primary text-cyber-primary font-semibold rounded-lg hover:bg-cyber-primary/10 transform hover:scale-105 transition-all duration-200"
          >
            Get Started
          </a>
        </div>
      </div>

      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-cyber-primary/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyber-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </section>
  )
}
