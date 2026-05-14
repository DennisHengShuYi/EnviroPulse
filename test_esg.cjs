const http = require('http');

const payload = JSON.stringify({
  sensorData: {
    name: 'KLCC',
    type: 'Urban Core',
    metrics: {
      aqi: { value: 45 },
      temp: { value: 31.2, rh: '80%', wind: '12 km/h' },
      pm25: { value: 12.5 }
    }
  },
  stats: {
    pm25Compliance: 100,
    doeCompliance: 100,
    heatSafeDays: 28
  }
});

const options = {
  hostname: '127.0.0.1',
  port: 3001,
  path: '/api/analytics/esg',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

console.log('[TEST_INIT] Transmitting payload to /api/analytics/esg for IFRS ISSB schema verification...');

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log(`[HTTP STATUS] ${res.statusCode}`);
    try {
      const data = JSON.parse(body);
      console.log('[RESPONSE RECEIVED]', JSON.stringify(data, null, 2));

      let failed = false;

      // 1. Verify issbPillars object exists and contains the four mandatory nodes
      if (!data.issbPillars || typeof data.issbPillars !== 'object') {
        console.error('❌ [ASSERTION FAILED] Missing or invalid "issbPillars" object.');
        failed = true;
      } else {
        const expectedPillars = ['governance', 'strategy', 'riskManagement', 'metricsAndTargets'];
        for (const p of expectedPillars) {
          if (!data.issbPillars[p]) {
            console.error(`❌ [ASSERTION FAILED] "issbPillars" missing required node: "${p}".`);
            failed = true;
          }
        }
      }

      // 2. Verify sustainabilityMatters object exists and contains the four core matters
      if (!data.sustainabilityMatters || typeof data.sustainabilityMatters !== 'object') {
        console.error('❌ [ASSERTION FAILED] Missing or invalid "sustainabilityMatters" object.');
        failed = true;
      } else {
        const expectedMatters = ['healthAndSafety', 'emissions', 'energyManagement', 'water'];
        for (const m of expectedMatters) {
          if (!data.sustainabilityMatters[m]) {
            console.error(`❌ [ASSERTION FAILED] "sustainabilityMatters" missing required node: "${m}".`);
            failed = true;
          }
        }
      }

      // 3. Verify IFRS S1 and IFRS S2 string citations exist in the returned payload
      const fullTextDump = JSON.stringify(data);
      if (!fullTextDump.includes('IFRS S1')) {
        console.error('❌ [ASSERTION FAILED] Payload does not explicitly cite "IFRS S1".');
        failed = true;
      }
      if (!fullTextDump.includes('IFRS S2')) {
        console.error('❌ [ASSERTION FAILED] Payload does not explicitly cite "IFRS S2".');
        failed = true;
      }

      if (failed) {
        console.error('\n💥 [TEST SUITE FAILED] The implementation does not conform to the required IFRS ISSB schema.');
        process.exit(1);
      } else {
        console.log('\n✅ [TEST PASSED] /api/analytics/esg perfectly enforces IFRS S1/S2 pillars and Sustainability Matters schema.');
        process.exit(0);
      }

    } catch (err) {
      console.error('❌ [JSON PARSE ERROR] Failed to parse response body:', err.message);
      console.error('Raw Body:', body);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ [REQUEST ERROR] Failed to connect to server:', e.message);
  process.exit(1);
});

req.write(payload);
req.end();
