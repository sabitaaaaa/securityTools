const express = require('express');
const router = express.Router();
const geoip = require('geoip-lite');

// Attack patterns
const sqlInjectionPatterns = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
  /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
  /((\%27)|(\'))union/i,
  /exec(\s|\+)+(s|x)p\w+/i,
  /union[^a-z]+select/i,
  /select.*from/i,
  /insert.*into/i,
  /delete.*from/i,
  /update.*set/i,
];

const xssPatterns = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /javascript:/i,
  /on\w+\s*=/i,
  /<img[^>]+src[^>]*=.*javascript:/i,
  /<svg[^>]*onload/i,
];

// Log format parsers
function parseApacheLog(line) {
  // Apache Combined Log Format
  const regex = /^(\S+) (\S+) (\S+) \[([^\]]+)\] "(\S+) (\S+) (\S+)" (\d+) (\d+) "([^"]*)" "([^"]*)"/;
  const match = line.match(regex);
  if (match) {
    return {
      ip: match[1],
      timestamp: match[4],
      method: match[5],
      path: match[6],
      protocol: match[7],
      status: parseInt(match[8]),
      size: parseInt(match[9]),
      referer: match[10],
      userAgent: match[11],
      raw: line,
    };
  }
  return null;
}

function parseNginxLog(line) {
  // Nginx access log format
  const regex = /^(\S+) - (\S+) \[([^\]]+)\] "(\S+) (\S+) (\S+)" (\d+) (\d+) "([^"]*)" "([^"]*)" "([^"]*)"/;
  const match = line.match(regex);
  if (match) {
    return {
      ip: match[1],
      user: match[2],
      timestamp: match[3],
      method: match[4],
      path: match[5],
      protocol: match[6],
      status: parseInt(match[7]),
      size: parseInt(match[8]),
      referer: match[9],
      userAgent: match[10],
      forwarded: match[11],
      raw: line,
    };
  }
  return null;
}

function parseSSHLog(line) {
  // SSH log format
  const regex = /(\w+\s+\d+\s+\d+:\d+:\d+).*?(\d+\.\d+\.\d+\.\d+).*?(Failed|Accepted|Invalid)/i;
  const match = line.match(regex);
  if (match) {
    return {
      timestamp: match[1],
      ip: match[2],
      event: match[3],
      raw: line,
    };
  }
  return null;
}

function detectLogFormat(lines) {
  let apacheCount = 0;
  let nginxCount = 0;
  let sshCount = 0;

  lines.slice(0, 10).forEach(line => {
    if (parseApacheLog(line)) apacheCount++;
    if (parseNginxLog(line)) nginxCount++;
    if (parseSSHLog(line)) sshCount++;
  });

  if (apacheCount > nginxCount && apacheCount > sshCount) return 'apache';
  if (nginxCount > apacheCount && nginxCount > sshCount) return 'nginx';
  if (sshCount > apacheCount && sshCount > nginxCount) return 'ssh';
  return 'generic';
}

function detectBruteForce(ipAttempts, timeWindow = 120000) {
  const bruteForceIPs = [];
  const now = Date.now();

  Object.entries(ipAttempts).forEach(([ip, attempts]) => {
    const recentAttempts = attempts.filter(t => now - t < timeWindow);
    if (recentAttempts.length >= 5) {
      bruteForceIPs.push({
        ip,
        attempts: recentAttempts.length,
        timeWindow: Math.round(timeWindow / 60000) + ' minutes',
        risk: recentAttempts.length > 20 ? 'CRITICAL' : recentAttempts.length > 10 ? 'HIGH' : 'MEDIUM',
      });
    }
  });

  return bruteForceIPs;
}

function detectSuspiciousActivity(parsedLogs) {
  const suspicious = {
    sqlInjection: [],
    xss: [],
    pathTraversal: [],
    suspiciousPaths: [],
    repeated404: [],
  };

  const path404Counts = {};
  const suspiciousPaths = ['/admin', '/wp-admin', '/phpmyadmin', '/.env', '/config', '/backup'];

  parsedLogs.forEach((log, index) => {
    const path = log.path || '';
    const userAgent = log.userAgent || '';
    const query = log.raw || '';

    // SQL Injection detection
    sqlInjectionPatterns.forEach(pattern => {
      if (pattern.test(path) || pattern.test(query)) {
        suspicious.sqlInjection.push({
          line: index + 1,
          ip: log.ip,
          path,
          pattern: pattern.toString(),
        });
      }
    });

    // XSS detection
    xssPatterns.forEach(pattern => {
      if (pattern.test(path) || pattern.test(userAgent)) {
        suspicious.xss.push({
          line: index + 1,
          ip: log.ip,
          path,
          pattern: pattern.toString(),
        });
      }
    });

    // Path traversal
    if (path.includes('../') || path.includes('..\\') || path.includes('%2e%2e')) {
      suspicious.pathTraversal.push({
        line: index + 1,
        ip: log.ip,
        path,
      });
    }

    // Suspicious paths
    suspiciousPaths.forEach(suspPath => {
      if (path.toLowerCase().includes(suspPath)) {
        suspicious.suspiciousPaths.push({
          line: index + 1,
          ip: log.ip,
          path,
        });
      }
    });

    // Repeated 404s
    if (log.status === 404) {
      path404Counts[path] = (path404Counts[path] || 0) + 1;
    }
  });

  // Find paths with many 404s
  Object.entries(path404Counts).forEach(([path, count]) => {
    if (count >= 3) {
      suspicious.repeated404.push({ path, count });
    }
  });

  return suspicious;
}

function geoMapIPs(ips) {
  const geoData = [];
  ips.forEach(({ ip, count }) => {
    const geo = geoip.lookup(ip);
    if (geo) {
      geoData.push({
        ip,
        count,
        country: geo.country,
        city: geo.city || 'Unknown',
        latitude: geo.ll[0],
        longitude: geo.ll[1],
      });
    } else {
      geoData.push({
        ip,
        count,
        country: 'Unknown',
        city: 'Unknown',
        latitude: 0,
        longitude: 0,
      });
    }
  });
  return geoData;
}

function createTimeGraph(parsedLogs) {
  const timeData = {};
  parsedLogs.forEach(log => {
    if (log.timestamp) {
      // Extract hour from timestamp
      const hourMatch = log.timestamp.match(/\d{2}:\d{2}:\d{2}/);
      if (hourMatch) {
        const hour = hourMatch[0].substring(0, 2);
        timeData[hour] = (timeData[hour] || 0) + 1;
      }
    }
  });

  return Object.entries(timeData)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => a.hour - b.hour);
}

router.post('/', async (req, res) => {
  try {
    const { logContent, logFormat } = req.body;

    if (!logContent || typeof logContent !== 'string') {
      return res.status(400).json({ error: 'Log content is required' });
    }

    const lines = logContent.split('\n').filter(line => line.trim());
    const detectedFormat = logFormat || detectLogFormat(lines);

    // Parse logs based on format
    const parsedLogs = [];
    lines.forEach((line, index) => {
      let parsed = null;
      if (detectedFormat === 'apache') {
        parsed = parseApacheLog(line);
      } else if (detectedFormat === 'nginx') {
        parsed = parseNginxLog(line);
      } else if (detectedFormat === 'ssh') {
        parsed = parseSSHLog(line);
      }

      if (parsed) {
        parsed.lineNumber = index + 1;
        parsedLogs.push(parsed);
      } else {
        // Generic parsing
        const ipMatch = line.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
        parsedLogs.push({
          ip: ipMatch ? ipMatch[0] : 'Unknown',
          raw: line,
          lineNumber: index + 1,
        });
      }
    });

    // Basic statistics
    const analysis = {
      totalLines: lines.length,
      parsedLines: parsedLogs.length,
      logFormat: detectedFormat,
      errors: 0,
      warnings: 0,
      info: 0,
      topIPs: [],
      topPaths: [],
      statusCodes: [],
      bruteForce: [],
      suspicious: {},
      geoMap: [],
      timeGraph: [],
    };

    // Count log levels
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('error') || lowerLine.includes('err')) {
        analysis.errors++;
      } else if (lowerLine.includes('warn')) {
        analysis.warnings++;
      } else if (lowerLine.includes('info')) {
        analysis.info++;
      }
    });

    // IP counting
    const ipCounts = {};
    const ipAttempts = {};
    parsedLogs.forEach(log => {
      if (log.ip && log.ip !== 'Unknown') {
        ipCounts[log.ip] = (ipCounts[log.ip] || 0) + 1;
        if (!ipAttempts[log.ip]) {
          ipAttempts[log.ip] = [];
        }
        ipAttempts[log.ip].push(Date.now());
      }
    });

    analysis.topIPs = Object.entries(ipCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Path counting
    const pathCounts = {};
    parsedLogs.forEach(log => {
      if (log.path) {
        pathCounts[log.path] = (pathCounts[log.path] || 0) + 1;
      }
    });

    analysis.topPaths = Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Status code counting
    const statusCounts = {};
    parsedLogs.forEach(log => {
      if (log.status) {
        statusCounts[log.status] = (statusCounts[log.status] || 0) + 1;
      }
    });

    analysis.statusCodes = Object.entries(statusCounts)
      .map(([code, count]) => ({ code: parseInt(code), count }))
      .sort((a, b) => b.count - a.count);

    // Brute force detection
    analysis.bruteForce = detectBruteForce(ipAttempts);

    // Suspicious activity detection
    analysis.suspicious = detectSuspiciousActivity(parsedLogs);

    // Geo-mapping
    analysis.geoMap = geoMapIPs(analysis.topIPs);

    // Time-based graph
    analysis.timeGraph = createTimeGraph(parsedLogs);

    // Save to database if available
    const { db } = require('../index');
    const database = db();
    if (database) {
      try {
        await database.execute(
          'INSERT INTO log_analysis (analysis_data) VALUES (?)',
          [JSON.stringify(analysis)]
        );
      } catch (error) {
        console.error('Database save error:', error.message);
      }
    }

    res.json({ analysis });
  } catch (error) {
    console.error('Log analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze logs' });
  }
});

module.exports = router;
