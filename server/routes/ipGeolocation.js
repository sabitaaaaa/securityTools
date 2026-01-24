const express = require('express');
const router = express.Router();
const geoip = require('geoip-lite');
const https = require('https');
const axios = require('axios');

function getIPFromRequest(req) {
  return new Promise((resolve) => {
    if (req.body.ip === 'auto' || !req.body.ip) {
      const ip = req.headers['x-forwarded-for'] || 
                 req.headers['x-real-ip'] || 
                 req.connection.remoteAddress ||
                 '8.8.8.8';
      resolve(ip.split(',')[0].trim());
    } else {
      resolve(req.body.ip);
    }
  });
}

async function getAdvancedGeolocation(ip) {
  try {
    // Try multiple APIs for comprehensive data
    const [ipapiData, abuseData] = await Promise.allSettled([
      axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 5000 }),
      axios.get(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}`, {
        headers: { 'Key': process.env.ABUSEIPDB_KEY || '' },
        timeout: 5000,
      }).catch(() => ({ data: null })),
    ]);

    const ipapi = ipapiData.status === 'fulfilled' ? ipapiData.value.data : null;
    const geo = geoip.lookup(ip);

    const result = {
      ip,
      country: ipapi?.country_name || geo?.country || 'Unknown',
      region: ipapi?.region || geo?.region || 'Unknown',
      city: ipapi?.city || geo?.city || 'Unknown',
      latitude: ipapi?.latitude || geo?.ll?.[0] || 0,
      longitude: ipapi?.longitude || geo?.ll?.[1] || 0,
      timezone: ipapi?.timezone || geo?.timezone || 'Unknown',
      isp: ipapi?.org || 'Unknown',
      org: ipapi?.org || 'Unknown',
      as: ipapi?.asn || 'Unknown',
      asn: ipapi?.asn || 'Unknown',
      ispType: 'Unknown',
      isProxy: false,
      isVPN: false,
      isTor: false,
      isHosting: false,
      abuseScore: 0,
      blacklistStatus: [],
      countryRisk: 'LOW',
    };

    // Determine ISP type
    const hostingKeywords = ['hosting', 'server', 'datacenter', 'cloud', 'aws', 'azure', 'gcp', 'digitalocean'];
    const ispLower = result.isp.toLowerCase();
    result.isHosting = hostingKeywords.some(keyword => ispLower.includes(keyword));
    result.ispType = result.isHosting ? 'Hosting' : 'Residential';

    // Proxy/VPN/Tor detection (basic heuristics)
    if (ipapi) {
      result.isProxy = ipapi.proxy === true || ipapi.proxy === 'true';
      result.isVPN = ipapi.vpn === true || ipapi.vpn === 'true';
      result.isTor = ipapi.tor === true || ipapi.tor === 'true';
    }

    // Abuse score (if API available)
    if (abuseData.status === 'fulfilled' && abuseData.value.data) {
      const abuse = abuseData.value.data.data;
      result.abuseScore = abuse.abuseConfidencePercentage || 0;
      result.blacklistStatus = abuse.isWhitelisted ? [] : ['AbuseIPDB'];
    }

    // Country risk assessment
    const highRiskCountries = ['CN', 'RU', 'KP', 'IR'];
    const mediumRiskCountries = ['IN', 'BR', 'ID', 'VN'];
    if (ipapi?.country_code) {
      if (highRiskCountries.includes(ipapi.country_code)) {
        result.countryRisk = 'HIGH';
      } else if (mediumRiskCountries.includes(ipapi.country_code)) {
        result.countryRisk = 'MEDIUM';
      }
    }

    return result;
  } catch (error) {
    // Fallback to basic geoip-lite
    const geo = geoip.lookup(ip);
    if (geo) {
      return {
        ip,
        country: geo.country || 'Unknown',
        region: geo.region || 'Unknown',
        city: geo.city || 'Unknown',
        latitude: geo.ll[0] || 0,
        longitude: geo.ll[1] || 0,
        timezone: geo.timezone || 'Unknown',
        isp: 'Unknown',
        org: 'Unknown',
        as: 'Unknown',
        ispType: 'Unknown',
        isProxy: false,
        isVPN: false,
        isTor: false,
        isHosting: false,
        abuseScore: 0,
        blacklistStatus: [],
        countryRisk: 'LOW',
      };
    }
    throw new Error('Could not geolocate IP');
  }
}

router.post('/', async (req, res) => {
  try {
    const ip = await getIPFromRequest(req);

    if (!ip || typeof ip !== 'string') {
      return res.status(400).json({ error: 'IP address is required' });
    }

    const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      return res.status(400).json({ error: 'Invalid IP address format' });
    }

    const geolocation = await getAdvancedGeolocation(ip);

    // Save to database if available
    const { db } = require('../index');
    const database = db();
    if (database) {
      try {
        await database.execute(
          'INSERT INTO scan_history (tool_name, target, result) VALUES (?, ?, ?)',
          ['ip_geolocation', ip, JSON.stringify(geolocation)]
        );
      } catch (error) {
        console.error('Database save error:', error.message);
      }
    }

    res.json({ geolocation });
  } catch (error) {
    console.error('IP geolocation error:', error);
    res.status(500).json({ error: error.message || 'Failed to get geolocation data' });
  }
});

module.exports = router;
