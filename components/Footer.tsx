export default function Footer() {
  return (
    <footer className="bg-cyber-dark border-t border-cyber-primary/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-cyber-primary to-cyber-secondary rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold">🛡️</span>
              </div>
              <span className="text-lg font-bold text-cyber-primary">CyberSec</span>
            </div>
            <p className="text-gray-400 text-sm">
              Advanced cybersecurity tools for professionals and security enthusiasts.
            </p>
          </div>

          <div>
            <h3 className="text-cyber-primary font-semibold mb-4">Tools</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/tools/port-scanner" className="hover:text-cyber-primary transition">Port Scanner</a></li>
              <li><a href="/tools/log-analyzer" className="hover:text-cyber-primary transition">Log Analyzer</a></li>
              <li><a href="/tools/website-checker" className="hover:text-cyber-primary transition">Website Checker</a></li>
              <li><a href="/tools/directory-discovery" className="hover:text-cyber-primary transition">Directory Discovery</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-cyber-primary font-semibold mb-4">More Tools</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/tools/ip-geolocation" className="hover:text-cyber-primary transition">IP Geolocation</a></li>
              <li><a href="/tools/metadata-extractor" className="hover:text-cyber-primary transition">Metadata Extractor</a></li>
              <li><a href="/tools/subdomain-finder" className="hover:text-cyber-primary transition">Subdomain Finder</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-cyber-primary font-semibold mb-4">About</h3>
            <p className="text-gray-400 text-sm">
              Professional cybersecurity platform providing essential security tools for network analysis, vulnerability assessment, and security research.
            </p>
          </div>
        </div>

        <div className="border-t border-cyber-primary/20 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} CyberSecurity Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
