const express = require('express');
const router = express.Router();
const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

// Large wordlist
const largeWordlist = [
  'admin', 'administrator', 'api', 'app', 'assets', 'backup', 'backups', 'blog', 'cdn', 'config',
  'database', 'db', 'dev', 'development', 'docs', 'download', 'downloads', 'files', 'ftp', 'git',
  'images', 'img', 'includes', 'index', 'js', 'lib', 'libs', 'login', 'logs', 'mail', 'media',
  'old', 'phpmyadmin', 'private', 'public', 'secure', 'server', 'src', 'static', 'test', 'tmp',
  'uploads', 'www', 'xml', 'zip', 'archive', 'archives', 'bin', 'cache', 'cgi', 'cgi-bin',
  'client', 'clients', 'components', 'css', 'data', 'demo', 'demos', 'design', 'designs',
  'error', 'errors', 'export', 'ext', 'external', 'feed', 'feeds', 'file', 'forum', 'forums',
  'help', 'home', 'image', 'inc', 'include', 'info', 'install', 'js', 'lang', 'language',
  'languages', 'lib', 'library', 'local', 'locale', 'mail', 'manager', 'manual', 'misc',
  'modules', 'news', 'new', 'old', 'panel', 'php', 'plugin', 'plugins', 'portal', 'private',
  'pub', 'public_html', 'releases', 'resources', 'restricted', 'robots.txt', 'rpc', 'scripts',
  'search', 'secure', 'security', 'server', 'service', 'services', 'setup', 'shop', 'sitemap',
  'sitemap.xml', 'sql', 'store', 'style', 'styles', 'support', 'sys', 'system', 'temp', 'test',
  'tests', 'tmp', 'tools', 'translations', 'upload', 'user', 'users', 'vendor', 'video', 'videos',
  'web', 'webapp', 'webapps', 'webdav', 'webservices', 'ws', 'www', 'xml', 'xmlrpc', '.env',
  '.git', '.svn', '.htaccess', '.htpasswd', 'config.php', 'config.inc.php', 'wp-config.php',
  'wp-admin', 'wp-content', 'wp-includes', 'administrator', 'components', 'modules', 'plugins',
  'templates', 'includes', 'libraries', 'media', 'cache', 'tmp', 'logs', 'backup', 'backups',
];

// Admin panel patterns
const adminPatterns = [
  /admin/i, /administrator/i, /wp-admin/i, /phpmyadmin/i, /cpanel/i, /whm/i,
  /panel/i, /dashboard/i, /manager/i, /control/i, /console/i,
];

// File extensions to try
const extensions = ['', '.php', '.html', '.htm', '.asp', '.aspx', '.jsp', '.bak', '.old', '.zip', '.tar', '.gz', '.sql'];

function checkPath(baseUrl, testPath, extensions = ['']) {
  return new Promise((resolve) => {
    const urlObj = new URL(baseUrl);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const checkSinglePath = (ext) => {
      const fullPath = testPath + ext;
      const testUrl = new URL(fullPath, baseUrl);
      const startTime = Date.now();

      const options = {
        hostname: testUrl.hostname,
        port: testUrl.port || (isHttps ? 443 : 80),
        path: testUrl.pathname,
        method: 'HEAD',
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SecurityTool/1.0)',
        },
      };

      const req = client.request(options, (res) => {
        const responseTime = Date.now() - startTime;
        const contentLength = res.headers['content-length'];
        const contentType = res.headers['content-type'];
        
        resolve({
          path: testUrl.pathname,
          status: res.statusCode,
          size: contentLength ? parseInt(contentLength) : undefined,
          contentType,
          responseTime,
          isAdmin: adminPatterns.some(pattern => pattern.test(testPath)),
        });
        req.destroy();
      });

      req.on('error', () => {
        resolve(null);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });

      req.end();
    };

    // Try with extensions
    if (extensions.length > 0) {
      checkSinglePath(extensions[0]);
    } else {
      checkSinglePath('');
    }
  });
}

router.post('/', async (req, res) => {
  try {
    const { url, wordlist, recursive = false, extensions: customExtensions = [], statusFilter = [] } = req.body;

    if (!url || !wordlist || !Array.isArray(wordlist)) {
      return res.status(400).json({ error: 'URL and wordlist array are required' });
    }

    let baseUrl = url;
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = 'https://' + baseUrl;
    }

    // Use provided wordlist or large default
    const pathsToCheck = wordlist.length > 0 ? wordlist : largeWordlist;
    const extsToTry = customExtensions.length > 0 ? customExtensions : extensions;
    
    // Limit for performance
    const maxPaths = 200;
    const pathsToScan = pathsToCheck.slice(0, maxPaths);
    
    // Check paths with rate limiting
    const results = [];
    const batchSize = 10;
    
    for (let i = 0; i < pathsToScan.length; i += batchSize) {
      const batch = pathsToScan.slice(i, i + batchSize);
      const batchPromises = batch.map(path => checkPath(baseUrl, path, extsToTry));
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result && (!statusFilter.length || statusFilter.includes(result.status))) {
          results.push(result);
        }
      });
      
      // Rate limiting delay
      if (i + batchSize < pathsToScan.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Filter interesting results
    const interestingResults = results.filter(r => 
      r && (r.status === 200 || r.status === 403 || r.status === 301 || r.status === 302 || r.isAdmin)
    );

    // Group by status
    const grouped = {
      found: interestingResults.filter(r => r.status === 200),
      forbidden: interestingResults.filter(r => r.status === 403),
      redirects: interestingResults.filter(r => r.status === 301 || r.status === 302),
      admin: interestingResults.filter(r => r.isAdmin),
    };

    // Save to database if available
    const { db } = require('../index');
    const database = db();
    if (database) {
      try {
        await database.execute(
          'INSERT INTO scan_history (tool_name, target, result) VALUES (?, ?, ?)',
          ['directory_discovery', url, JSON.stringify(interestingResults)]
        );
      } catch (error) {
        console.error('Database save error:', error.message);
      }
    }

    res.json({ 
      results: interestingResults,
      summary: {
        total: interestingResults.length,
        found: grouped.found.length,
        forbidden: grouped.forbidden.length,
        redirects: grouped.redirects.length,
        admin: grouped.admin.length,
      },
    });
  } catch (error) {
    console.error('Directory discovery error:', error);
    res.status(500).json({ error: 'Failed to discover directories' });
  }
});

module.exports = router;
