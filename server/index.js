const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
// Fallback to .env if .env.local doesn't exist
if (!process.env.DB_HOST) {
  require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cybersecurity_db',
  port: process.env.DB_PORT || 3306,
};

let db;

// Initialize database connection
async function initDB() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully');
    
    // Create tables if they don't exist
    await createTables();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('⚠️  Running without database (some features may be limited)');
  }
}

async function createTables() {
  if (!db) return;
  
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS scan_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tool_name VARCHAR(50) NOT NULL,
        target VARCHAR(255) NOT NULL,
        result TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS log_analysis (
        id INT AUTO_INCREMENT PRIMARY KEY,
        analysis_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Database tables created/verified');
  } catch (error) {
    console.error('Error creating tables:', error.message);
  }
}

// Routes
const portScannerRoutes = require('./routes/portScanner');
const logAnalyzerRoutes = require('./routes/logAnalyzer');
const websiteCheckerRoutes = require('./routes/websiteChecker');
const directoryDiscoveryRoutes = require('./routes/directoryDiscovery');
const ipGeolocationRoutes = require('./routes/ipGeolocation');
const metadataExtractorRoutes = require('./routes/metadataExtractor');
const subdomainFinderRoutes = require('./routes/subdomainFinder');

app.use('/api/port-scan', portScannerRoutes);
app.use('/api/log-analyze', logAnalyzerRoutes);
app.use('/api/website-check', websiteCheckerRoutes);
app.use('/api/directory-discovery', directoryDiscoveryRoutes);
app.use('/api/ip-geolocation', ipGeolocationRoutes);
app.use('/api/metadata-extract', metadataExtractorRoutes);
app.use('/api/subdomain-find', subdomainFinderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: db ? 'connected' : 'disconnected' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await initDB();
});

// Export db for use in routes
module.exports = { db: () => db };
