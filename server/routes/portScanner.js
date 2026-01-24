const express = require('express');
const router = express.Router();
const net = require('net');
const dns = require('dns').promises;
const https = require('https');
const http = require('http');

// Extended service database with vulnerabilities
const serviceDatabase = {
  21: { name: 'FTP', version: '', vulnerable: true, cves: ['CVE-2021-22204'] },
  22: { name: 'SSH', version: '', vulnerable: false, cves: [] },
  23: { name: 'Telnet', version: '', vulnerable: true, cves: ['CVE-2020-10173'] },
  25: { name: 'SMTP', version: '', vulnerable: false, cves: [] },
  53: { name: 'DNS', version: '', vulnerable: false, cves: [] },
  80: { name: 'HTTP', version: '', vulnerable: false, cves: [] },
  110: { name: 'POP3', version: '', vulnerable: false, cves: [] },
  143: { name: 'IMAP', version: '', vulnerable: false, cves: [] },
  443: { name: 'HTTPS', version: '', vulnerable: false, cves: [] },
  3306: { name: 'MySQL', version: '', vulnerable: true, cves: ['CVE-2021-37137'] },
  5432: { name: 'PostgreSQL', version: '', vulnerable: false, cves: [] },
  8080: { name: 'HTTP-Proxy', version: '', vulnerable: false, cves: [] },
  8443: { name: 'HTTPS-Alt', version: '', vulnerable: false, cves: [] },
  3389: { name: 'RDP', version: '', vulnerable: true, cves: ['CVE-2019-0708'] },
  5900: { name: 'VNC', version: '', vulnerable: true, cves: ['CVE-2019-15690'] },
  27017: { name: 'MongoDB', version: '', vulnerable: true, cves: ['CVE-2021-20329'] },
};

// Vulnerable ports list
const vulnerablePorts = [21, 23, 3306, 3389, 5900, 27017, 1433, 5432];

function scanPortTCP(host, port, timeout = 3000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const result = {
      port,
      protocol: 'TCP',
      status: 'closed',
      service: serviceDatabase[port]?.name || 'Unknown',
      version: '',
      banner: '',
      os: '',
      firewall: false,
      vulnerable: vulnerablePorts.includes(port),
      cves: serviceDatabase[port]?.cves || [],
    };

    socket.setTimeout(timeout);
    
    socket.once('connect', async () => {
      result.status = 'open';
      result.firewall = false;
      
      // Try banner grabbing
      try {
        socket.setEncoding('utf8');
        let bannerData = '';
        socket.on('data', (data) => {
          bannerData += data.toString();
          if (bannerData.length > 500) {
            socket.destroy();
          }
        });
        
        // Send probe based on service
        if (port === 22) {
          // SSH banner
          setTimeout(() => {
            result.banner = bannerData.substring(0, 200) || 'SSH service detected';
            socket.destroy();
          }, 1000);
        } else if (port === 80 || port === 8080) {
          // HTTP banner
          socket.write('GET / HTTP/1.1\r\nHost: ' + host + '\r\n\r\n');
          setTimeout(() => {
            result.banner = bannerData.substring(0, 200) || 'HTTP service detected';
            socket.destroy();
          }, 1000);
        } else {
          setTimeout(() => {
            result.banner = bannerData.substring(0, 200) || 'Service detected';
            socket.destroy();
          }, 1000);
        }
      } catch (error) {
        // Continue without banner
      }
      
      setTimeout(() => {
        if (result.banner) {
          // Extract version from banner
          const versionMatch = result.banner.match(/(\d+\.\d+\.\d+)/);
          if (versionMatch) {
            result.version = versionMatch[1];
          }
        }
        resolve(result);
      }, timeout);
    });

    socket.once('timeout', () => {
      socket.destroy();
      result.firewall = true;
      result.status = 'filtered';
      resolve(result);
    });

    socket.once('error', (error) => {
      socket.destroy();
      if (error.code === 'ECONNREFUSED') {
        result.status = 'closed';
      } else {
        result.status = 'filtered';
        result.firewall = true;
      }
      resolve(result);
    });

    socket.connect(port, host);
  });
}

function scanPortUDP(host, port, timeout = 3000) {
  return new Promise((resolve) => {
    // UDP scanning is more complex and requires raw sockets
    // For now, we'll mark it as not implemented in pure Node.js
    const result = {
      port,
      protocol: 'UDP',
      status: 'open|filtered',
      service: serviceDatabase[port]?.name || 'Unknown',
      note: 'UDP scanning requires root privileges and raw sockets',
    };
    resolve(result);
  });
}

async function detectOS(host, openPorts) {
  // Basic OS detection based on open ports and banners
  const osHints = {
    windows: [3389, 445, 135, 139],
    linux: [22, 111, 2049],
    unix: [22, 111],
  };
  
  let detectedOS = 'Unknown';
  let maxMatches = 0;
  
  for (const [os, ports] of Object.entries(osHints)) {
    const matches = ports.filter(p => openPorts.includes(p)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedOS = os.charAt(0).toUpperCase() + os.slice(1);
    }
  }
  
  return detectedOS;
}

router.post('/', async (req, res) => {
  try {
    const {
      host,
      ports,
      scanType = 'tcp',
      speed = 'normal',
      serviceDetection = true,
      versionDetection = true,
      osDetection = true,
      bannerGrabbing = true,
    } = req.body;

    if (!host || !ports || !Array.isArray(ports)) {
      return res.status(400).json({ error: 'Invalid request. Host and ports array required.' });
    }

    // Resolve hostname to IP if needed
    let targetIP = host;
    try {
      if (!/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
        const addresses = await dns.resolve4(host);
        targetIP = addresses[0];
      }
    } catch (error) {
      return res.status(400).json({ error: `Could not resolve hostname: ${host}` });
    }

    // Adjust timeout based on speed
    const speedSettings = {
      stealth: 10000,
      normal: 3000,
      aggressive: 1000,
    };
    const timeout = speedSettings[speed] || 3000;

    // Limit ports based on speed
    const maxPorts = speed === 'aggressive' ? 100 : speed === 'normal' ? 50 : 20;
    const portsToScan = ports.slice(0, maxPorts);
    
    // Scan ports
    const scanFunction = scanType === 'udp' ? scanPortUDP : scanPortTCP;
    const scanPromises = portsToScan.map(port => scanFunction(targetIP, port, timeout));
    const results = await Promise.all(scanPromises);

    // Filter open ports for OS detection
    const openPorts = results.filter(r => r.status === 'open').map(r => r.port);
    
    // OS Detection
    let osInfo = 'Unknown';
    if (osDetection && openPorts.length > 0) {
      osInfo = await detectOS(targetIP, openPorts);
    }

    // Service detection and version detection are done during scanning
    // CVE mapping
    const cveResults = results.map(result => {
      if (result.status === 'open' && result.vulnerable) {
        return {
          ...result,
          risk: 'HIGH',
          recommendation: `Port ${result.port} (${result.service}) is known to have vulnerabilities. Consider securing or closing this port.`,
        };
      }
      return result;
    });

    // Summary statistics
    const summary = {
      total: results.length,
      open: results.filter(r => r.status === 'open').length,
      closed: results.filter(r => r.status === 'closed').length,
      filtered: results.filter(r => r.status === 'filtered').length,
      vulnerable: results.filter(r => r.vulnerable && r.status === 'open').length,
      services: [...new Set(results.filter(r => r.status === 'open').map(r => r.service))],
    };

    // Save to database if available
    const { db } = require('../index');
    const database = db();
    if (database) {
      try {
        await database.execute(
          'INSERT INTO scan_history (tool_name, target, result) VALUES (?, ?, ?)',
          ['port_scanner', host, JSON.stringify({ results: cveResults, summary, os: osInfo })]
        );
      } catch (error) {
        console.error('Database save error:', error.message);
      }
    }

    res.json({
      results: cveResults,
      summary,
      target: host,
      ip: targetIP,
      os: osInfo,
      scanType,
      speed,
    });
  } catch (error) {
    console.error('Port scan error:', error);
    res.status(500).json({ error: 'Failed to scan ports' });
  }
});

module.exports = router;
