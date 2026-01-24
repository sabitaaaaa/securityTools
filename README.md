# Cybersecurity Platform

A comprehensive cybersecurity platform built with Next.js, Node.js, and MySQL featuring advanced security tools for professionals and security enthusiasts.

## Features

### 🛡️ Security Tools

1. **Port Scanner** - Scan open ports on any host or IP address
2. **Log File Analyzer** - Analyze and parse log files for security events
3. **Website Status Checker** - Check website availability and response times
4. **Directory Discovery Tool** - Discover hidden directories and paths on web servers
5. **IP Geolocation** - Get detailed geolocation information for any IP address
6. **Metadata Extractor** - Extract metadata from files and images
7. **Subdomain Finder** - Discover subdomains for any domain name

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Styling**: Tailwind CSS with custom cybersecurity theme

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sabpr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MySQL database**
   ```bash
   # Login to MySQL
   mysql -u root -p
   
   # Run the schema file
   source database/schema.sql
   ```

4. **Configure environment variables**
   
   Create or update `.env.local` file:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=cybersecurity_db
   DB_PORT=3306
   
   API_URL=http://localhost:3001
   NEXT_PUBLIC_API_URL=http://localhost:3001
   
   PORT=3001
   ```

5. **Create uploads directory**
   ```bash
   mkdir -p server/uploads
   ```

## Running the Application

### Development Mode

Run both frontend and backend simultaneously:
```bash
npm run dev:all
```

Or run them separately:

**Terminal 1 - Frontend (Next.js)**
```bash
npm run dev
```

**Terminal 2 - Backend (Node.js)**
```bash
npm run server
```

### Production Mode

1. **Build the Next.js application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

3. **Start the backend server**
   ```bash
   npm run server
   ```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## Project Structure

```
cybersecurity-platform/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   └── tools/             # Tool pages
│       ├── port-scanner/
│       ├── log-analyzer/
│       ├── website-checker/
│       ├── directory-discovery/
│       ├── ip-geolocation/
│       ├── metadata-extractor/
│       └── subdomain-finder/
├── components/            # React components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── Stats.tsx
│   ├── ToolsGrid.tsx
│   └── Features.tsx
├── server/               # Backend server
│   ├── index.js         # Express server
│   ├── routes/          # API routes
│   │   ├── portScanner.js
│   │   ├── logAnalyzer.js
│   │   ├── websiteChecker.js
│   │   ├── directoryDiscovery.js
│   │   ├── ipGeolocation.js
│   │   ├── metadataExtractor.js
│   │   └── subdomainFinder.js
│   └── uploads/         # Temporary file storage
├── database/            # Database files
│   └── schema.sql       # Database schema
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## API Endpoints

- `POST /api/port-scan` - Scan ports on a host
- `POST /api/log-analyze` - Analyze log files
- `POST /api/website-check` - Check website status
- `POST /api/directory-discovery` - Discover directories
- `POST /api/ip-geolocation` - Get IP geolocation
- `POST /api/metadata-extract` - Extract file metadata
- `POST /api/subdomain-find` - Find subdomains
- `GET /api/health` - Health check endpoint

## Features Overview

### Port Scanner
- Scan multiple ports simultaneously
- Identify common services
- Fast and efficient scanning

### Log File Analyzer
- Parse various log formats
- Extract IP addresses, paths, and status codes
- Identify errors, warnings, and info messages
- Generate statistics and top lists

### Website Status Checker
- Check HTTP/HTTPS availability
- Measure response times
- Verify SSL certificates
- Display response headers

### Directory Discovery
- Brute-force directory discovery
- Custom wordlist support
- Filter interesting results (200, 403, redirects)

### IP Geolocation
- Get location data for any IP
- ISP and organization information
- Timezone and coordinates
- Auto-detect your IP

### Metadata Extractor
- Extract file metadata
- EXIF data for images
- File size and type information
- Support for various file formats

### Subdomain Finder
- Discover subdomains using DNS
- Check for web servers
- Large built-in wordlist
- Fast parallel scanning

## Security Notes

⚠️ **Important**: This platform is designed for authorized security testing only. Always ensure you have permission before scanning or testing any systems.

- Only use on systems you own or have explicit permission to test
- Respect rate limits and don't abuse the tools
- Be aware of legal implications in your jurisdiction

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your cybersecurity needs.

## Support

For issues and questions, please open an issue on the repository.
