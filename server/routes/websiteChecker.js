const express = require('express');
const router = express.Router();
const https = require('https');
const http = require('http');
const { URL } = require('url');
const cheerio = require('cheerio');

// CMS detection patterns
const cmsPatterns = {
  wordpress: [
    /wp-content/i,
    /wp-includes/i,
    /wp-json/i,
    /wordpress/i,
  ],
  laravel: [
    /laravel_session/i,
    /laravel/i,
  ],
  drupal: [
    /sites\/all/i,
    /drupal/i,
  ],
  joomla: [
    /joomla/i,
    /components\/com_/i,
  ],
  magento: [
    /magento/i,
    /skin\/frontend/i,
  ],
};

function checkWebsite(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      rejectUnauthorized: false,
    };

    const req = client.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      const headers = {};
      
      Object.keys(res.headers).forEach(key => {
        headers[key.toLowerCase()] = res.headers[key];
      });

      let data = '';
      res.on('data', chunk => {
        data += chunk.toString();
      });

      res.on('end', () => {
        const status = {
          url,
          status: res.statusCode,
          statusText: res.statusMessage,
          responseTime,
          headers,
          security: {
            hsts: false,
            csp: false,
            xFrameOptions: false,
            xContentTypeOptions: false,
            xXssProtection: false,
            strictTransportSecurity: false,
            cookies: [],
            mixedContent: false,
            securityScore: 0,
          },
          ssl: {},
          cms: null,
          outdatedLibraries: [],
        };

        // Security Headers Check
        if (headers['strict-transport-security']) {
          status.security.hsts = true;
          status.security.strictTransportSecurity = headers['strict-transport-security'];
          status.security.securityScore += 20;
        }

        if (headers['content-security-policy']) {
          status.security.csp = true;
          status.security.securityScore += 15;
        }

        if (headers['x-frame-options']) {
          status.security.xFrameOptions = true;
          status.security.securityScore += 10;
        }

        if (headers['x-content-type-options']) {
          status.security.xContentTypeOptions = true;
          status.security.securityScore += 10;
        }

        if (headers['x-xss-protection']) {
          status.security.xXssProtection = true;
          status.security.securityScore += 5;
        }

        // Cookie Security
        const setCookieHeaders = Array.isArray(headers['set-cookie']) 
          ? headers['set-cookie'] 
          : headers['set-cookie'] ? [headers['set-cookie']] : [];
        
        setCookieHeaders.forEach(cookie => {
          const cookieInfo = {
            httpOnly: cookie.includes('HttpOnly'),
            secure: cookie.includes('Secure'),
            sameSite: cookie.match(/SameSite=(\w+)/i)?.[1] || 'None',
            name: cookie.split('=')[0],
          };
          status.security.cookies.push(cookieInfo);
          
          if (cookieInfo.httpOnly) status.security.securityScore += 5;
          if (cookieInfo.secure) status.security.securityScore += 5;
        });

        // Check SSL if HTTPS
        if (isHttps && res.socket) {
          const cert = res.socket.getPeerCertificate();
          if (cert && Object.keys(cert).length > 0) {
            const validTo = new Date(cert.valid_to);
            const validFrom = new Date(cert.valid_from);
            const now = new Date();
            const daysUntilExpiry = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));
            
            status.ssl = {
              valid: validTo > now,
              issuer: cert.issuer?.CN || cert.issuer?.O || 'Unknown',
              expiry: cert.valid_to,
              daysUntilExpiry,
              subject: cert.subject?.CN || 'Unknown',
              algorithm: cert.pubkey?.algo || 'Unknown',
            };

            if (status.ssl.valid) {
              status.security.securityScore += 20;
              if (daysUntilExpiry > 30) status.security.securityScore += 10;
            } else {
              status.security.securityScore -= 50;
            }

            // SSL Grade (simplified)
            if (daysUntilExpiry > 30 && cert.pubkey?.algo?.includes('RSA')) {
              status.ssl.grade = 'A';
            } else if (daysUntilExpiry > 0) {
              status.ssl.grade = 'B';
            } else {
              status.ssl.grade = 'F';
            }
          } else {
            status.ssl.grade = 'F';
            status.ssl.valid = false;
          }
        }

        // Mixed Content Detection
        if (isHttps && data) {
          const mixedContentPatterns = [
            /http:\/\/[^"'\s]+/gi,
            /src=["']http:\/\//gi,
            /href=["']http:\/\//gi,
          ];
          
          mixedContentPatterns.forEach(pattern => {
            if (pattern.test(data)) {
              status.security.mixedContent = true;
              status.security.securityScore -= 10;
            }
          });
        }

        // CMS Detection
        try {
          const $ = cheerio.load(data);
          const htmlContent = data.toLowerCase();
          const metaGenerator = $('meta[name="generator"]').attr('content') || '';
          
          for (const [cms, patterns] of Object.entries(cmsPatterns)) {
            const matches = patterns.filter(pattern => 
              pattern.test(htmlContent) || pattern.test(metaGenerator)
            );
            if (matches.length > 0) {
              status.cms = {
                name: cms.charAt(0).toUpperCase() + cms.slice(1),
                confidence: (matches.length / patterns.length) * 100,
              };
              break;
            }
          }
        } catch (error) {
          // CMS detection failed, continue
        }

        // Outdated Libraries Detection (basic)
        const libraryPatterns = {
          'jquery': /jquery[.-]?(\d+\.\d+\.\d+)/i,
          'bootstrap': /bootstrap[.-]?(\d+\.\d+\.\d+)/i,
          'react': /react[.-]?(\d+\.\d+\.\d+)/i,
        };

        if (data) {
          Object.entries(libraryPatterns).forEach(([lib, pattern]) => {
            const match = data.match(pattern);
            if (match) {
              const version = match[1];
              status.outdatedLibraries.push({
                name: lib,
                version,
                outdated: false, // Would need version comparison logic
              });
            }
          });
        }

        // Calculate final security score
        status.security.securityScore = Math.max(0, Math.min(100, status.security.securityScore));

        resolve(status);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

router.post('/', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    let checkUrl = url;
    if (!checkUrl.startsWith('http://') && !checkUrl.startsWith('https://')) {
      checkUrl = 'https://' + checkUrl;
    }

    const status = await checkWebsite(checkUrl);

    // Save to database if available
    const { db } = require('../index');
    const database = db();
    if (database) {
      try {
        await database.execute(
          'INSERT INTO scan_history (tool_name, target, result) VALUES (?, ?, ?)',
          ['website_checker', url, JSON.stringify(status)]
        );
      } catch (error) {
        console.error('Database save error:', error.message);
      }
    }

    res.json({ status });
  } catch (error) {
    console.error('Website check error:', error);
    res.status(500).json({ error: error.message || 'Failed to check website' });
  }
});

module.exports = router;
