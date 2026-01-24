const express = require('express');
const router = express.Router();
const dns = require('dns').promises;
const https = require('https');
const http = require('http');
const axios = require('axios');

const commonSubdomains = [
  'www', 'mail', 'ftp', 'localhost', 'webmail', 'smtp', 'pop', 'ns1', 'webdisk',
  'ns2', 'cpanel', 'whm', 'autodiscover', 'autoconfig', 'm', 'imap', 'test',
  'ns', 'blog', 'pop3', 'dev', 'www2', 'admin', 'forum', 'news', 'vpn',
  'ns3', 'mail2', 'new', 'mysql', 'old', 'lists', 'support', 'mobile', 'mx',
  'static', 'docs', 'beta', 'web', 'bbox', 'mailsvr', 'shop', 'svn', 'api',
  'dns2', 'api1', 'www1', 'private', 'mail1', 'smtp1', 'public', 'newsletter',
  'vps', 'ns4', 'www3', 'ftp2', 'mail3', 'blog2', 'mx1', 'chat', 'wap',
  'svn1', 'mx2', 'cdn', 'git', 'ns5', 'sms', 'online', 'images', 'apps',
  'sip', 'dns1', 'api2', 'www4', 'dns', 'www5', 'whm1', 'autodiscover2',
  'proxy', 'ad', 'adserver', 'ads', 'ads1', 'ads2', 'alpha', 'amazonses',
  'app', 'app1', 'autodiscover', 'autodiscover2', 'biz', 'cache', 'calendar',
  'cdn1', 'cdn2', 'certs', 'chat1', 'citrix', 'cms', 'confluence', 'crm',
  'demo', 'dev1', 'dev2', 'direct', 'directconnect', 'dmarc', 'dns3',
  'docs1', 'email', 'exchange', 'files', 'files1', 'gate', 'git1', 'gitlab',
  'grafana', 'help', 'helpdesk', 'imap1', 'imap2', 'internal', 'jira',
  'ldap', 'ldap1', 'live', 'local', 'manage', 'manager', 'marketing',
  'monitor', 'monitoring', 'mx3', 'net', 'network', 'office', 'owa', 'panel',
  'partner', 'partners', 'pop1', 'pop2', 'portal', 'preview', 'printer',
  'promo', 'promotion', 'remote', 'secure', 'server', 'server1', 'service',
  'services', 'shop1', 'smtp2', 'smtp3', 'splunk', 'sql', 'sql1', 'ssh',
  'ssl', 'staging', 'stats', 'status', 'store', 'stream', 'survey', 'test1',
  'test2', 'ticket', 'tickets', 'tools', 'vault', 'video', 'vpn1', 'vpn2',
  'web1', 'web2', 'web3', 'webapp', 'webapps', 'wiki', 'ws', 'ws1', 'www6',
  'www7', 'www8', 'www9', 'www10', 'xml', 'xml1', 'xmpp', 'zabbix'
];

// Extended wordlist for DNS brute-force
const extendedWordlist = [
  ...commonSubdomains,
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'a1', 'a2', 'a3', 'b1', 'b2', 'c1', 'c2', 'd1', 'd2',
  'staging1', 'staging2', 'prod', 'production', 'preprod', 'pre-prod',
  'test1', 'test2', 'test3', 'qa', 'qa1', 'qa2',
  'uat', 'dev1', 'dev2', 'dev3', 'development',
  'internal', 'internal1', 'internal2', 'int', 'int1',
  'secure', 'secure1', 'secure2', 'security',
  'vpn', 'vpn1', 'vpn2', 'remote', 'remote1',
  'backup', 'backup1', 'backup2', 'backups',
  'db', 'db1', 'database', 'database1', 'mysql', 'postgres',
  'redis', 'mongodb', 'elastic', 'elasticsearch',
  'kibana', 'grafana', 'prometheus', 'jenkins',
  'git', 'gitlab', 'github', 'bitbucket',
  'jira', 'confluence', 'wiki', 'docs',
  'api', 'api1', 'api2', 'api3', 'apis', 'rest', 'graphql',
  'cdn', 'cdn1', 'cdn2', 'static', 'static1', 'assets',
  'media', 'media1', 'images', 'img', 'img1',
  'mail', 'mail1', 'mail2', 'email', 'smtp', 'imap',
  'web', 'web1', 'web2', 'www', 'www1', 'www2',
  'app', 'app1', 'app2', 'apps', 'application',
  'mobile', 'm', 'm1', 'mobile1',
  'admin', 'admin1', 'administrator',
  'portal', 'portal1', 'dashboard', 'dash',
  'shop', 'shop1', 'store', 'store1', 'ecommerce',
  'blog', 'blog1', 'news', 'news1',
  'support', 'help', 'helpdesk', 'ticket',
  'status', 'status1', 'health', 'ping',
  'monitor', 'monitoring', 'metrics',
  'logs', 'log', 'logging',
  'cache', 'cache1', 'redis1',
  'search', 'search1', 'elastic1',
  'auth', 'auth1', 'login', 'sso',
  's3', 'storage', 'storage1',
  'files', 'files1', 'file', 'upload',
  'download', 'downloads', 'dl',
  'video', 'videos', 'stream', 'streaming',
  'live', 'live1', 'streaming1',
  'staging', 'staging1', 'staging2',
  'prod', 'prod1', 'production1',
  'test', 'test1', 'test2', 'test3',
  'dev', 'dev1', 'dev2', 'dev3',
  'qa', 'qa1', 'qa2', 'qa3',
  'uat', 'uat1', 'preprod',
  'demo', 'demo1', 'demo2',
  'sandbox', 'sandbox1',
  'playground', 'playground1',
];

async function checkSubdomain(domain, subdomain) {
  try {
    const fullDomain = `${subdomain}.${domain}`;
    const addresses = await dns.resolve4(fullDomain);
    const ip = addresses[0];
    
    // Check if it's a web server
    const status = await checkWebServer(fullDomain, ip);
    
    return {
      subdomain: fullDomain,
      ip,
      status,
      alive: status > 0,
    };
  } catch (error) {
    return null;
  }
}

function checkWebServer(domain, ip) {
  return new Promise((resolve) => {
    const options = {
      hostname: domain,
      port: 443,
      path: '/',
      method: 'HEAD',
      timeout: 3000,
      rejectUnauthorized: false,
    };

    https.request(options, (res) => {
      resolve(res.statusCode);
    })
    .on('error', () => {
      // Try HTTP
      http.request({
        hostname: domain,
        port: 80,
        path: '/',
        method: 'HEAD',
        timeout: 3000,
      }, (res) => {
        resolve(res.statusCode);
      })
      .on('error', () => resolve(0))
      .end();
    })
    .on('timeout', () => resolve(0))
    .end();
  });
}

async function checkWildcard(domain) {
  try {
    const randomSub = Math.random().toString(36).substring(7);
    await dns.resolve4(`${randomSub}.${domain}`);
    return true;
  } catch (error) {
    return false;
  }
}

async function getCertificateTransparency(domain) {
  try {
    const response = await axios.get(`https://crt.sh/?q=%.${domain}&output=json`, { timeout: 10000 });
    const certs = response.data || [];
    const subdomains = new Set();
    
    certs.forEach(cert => {
      if (cert.name_value) {
        const names = cert.name_value.split('\n');
        names.forEach(name => {
          const cleanName = name.trim().toLowerCase();
          if (cleanName.endsWith(`.${domain}`) || cleanName === domain) {
            const sub = cleanName.replace(`.${domain}`, '').replace(domain, '');
            if (sub && sub !== '*') {
              subdomains.add(sub);
            }
          }
        });
      }
    });
    
    return Array.from(subdomains);
  } catch (error) {
    return [];
  }
}

function detectTakeover(subdomain, ip) {
  const hints = [];
  
  // Check for common takeover scenarios
  const cnamePatterns = {
    'github': /github\.io/i,
    'heroku': /herokuapp\.com/i,
    'aws': /s3\.amazonaws\.com/i,
    'azure': /azurewebsites\.net/i,
    'cloudflare': /cloudflare\.com/i,
  };
  
  // This would require CNAME lookup which we'll add
  hints.push('Check CNAME records for potential takeover');
  
  return hints;
}

router.post('/', async (req, res) => {
  try {
    const { domain, useCT = true, useBruteForce = true, checkWildcard = true } = req.body;

    if (!domain || typeof domain !== 'string') {
      return res.status(400).json({ error: 'Domain name is required' });
    }

    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0];

    const foundSubdomains = [];
    const subdomainMap = new Map();

    // Wildcard detection
    let hasWildcard = false;
    if (checkWildcard) {
      hasWildcard = await checkWildcard(cleanDomain);
    }

    // Certificate Transparency
    if (useCT) {
      const ctSubdomains = await getCertificateTransparency(cleanDomain);
      for (const sub of ctSubdomains.slice(0, 100)) {
        const result = await checkSubdomain(cleanDomain, sub);
        if (result) {
          foundSubdomains.push(result);
          subdomainMap.set(result.subdomain, result);
        }
      }
    }

    // DNS Brute-force
    if (useBruteForce) {
      const wordlist = extendedWordlist.slice(0, 200);
      const batchSize = 20;
      
      for (let i = 0; i < wordlist.length; i += batchSize) {
        const batch = wordlist.slice(i, i + batchSize);
        const batchPromises = batch.map(sub => checkSubdomain(cleanDomain, sub));
        const batchResults = await Promise.all(batchPromises);
        
        batchResults.forEach(result => {
          if (result && !subdomainMap.has(result.subdomain)) {
            foundSubdomains.push(result);
            subdomainMap.set(result.subdomain, result);
          }
        });
        
        // Rate limiting
        if (i + batchSize < wordlist.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    }

    // IP mapping
    const ipMap = new Map();
    foundSubdomains.forEach(sub => {
      if (!ipMap.has(sub.ip)) {
        ipMap.set(sub.ip, []);
      }
      ipMap.get(sub.ip).push(sub.subdomain);
    });

    // Takeover detection hints
    foundSubdomains.forEach(sub => {
      sub.takeoverHints = detectTakeover(sub.subdomain, sub.ip);
    });

    // Save to database if available
    const { db } = require('../index');
    const database = db();
    if (database) {
      try {
        await database.execute(
          'INSERT INTO scan_history (tool_name, target, result) VALUES (?, ?, ?)',
          ['subdomain_finder', domain, JSON.stringify(foundSubdomains)]
        );
      } catch (error) {
        console.error('Database save error:', error.message);
      }
    }

    res.json({
      subdomains: foundSubdomains,
      summary: {
        total: foundSubdomains.length,
        alive: foundSubdomains.filter(s => s.alive).length,
        dead: foundSubdomains.filter(s => !s.alive).length,
        uniqueIPs: ipMap.size,
        hasWildcard,
      },
      ipMap: Object.fromEntries(ipMap),
    });
  } catch (error) {
    console.error('Subdomain finder error:', error);
    res.status(500).json({ error: 'Failed to find subdomains' });
  }
});

module.exports = router;
