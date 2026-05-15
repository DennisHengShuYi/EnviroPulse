/* global process, Buffer */
import http from 'http';

// Ensure standalone test mode
process.env.NODE_ENV = 'test';

console.log('[TEST_INIT] Initializing factoryMsme role verification...');

const { default: app } = await import('./server/index.js');

const TEST_PORT = 3006;
const server = app.listen(TEST_PORT, '127.0.0.1', () => {
  console.log(`[TEST_SERVER] Isolated instance active on port ${TEST_PORT}`);

  const payload = JSON.stringify({
    role: 'factoryMsme',
    sensorData: {
      id: 'klcc',
      name: 'KLCC',
      type: 'Industrial',
      region: 'CENTRAL',
      metrics: {
        aqi: { value: 120 },
        temp: { value: 34.5, rh: '85%' },
        heatIndex: { value: 39.2 },
        pm25: { value: 45.0 }
      },
      pollutants: {
        pm25: 45.0,
        pm10: 60.0,
        no2: 25.0,
        so2: 5.0,
        co: 0.8,
        o3: 45.0
      }
    }
  });

  const options = {
    hostname: '127.0.0.1',
    port: TEST_PORT,
    path: '/api/advisor',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      console.log(`[HTTP STATUS] ${res.statusCode}`);
      server.close(() => {
        try {
          const data = JSON.parse(body);
          console.log('[RESPONSE RECEIVED]', JSON.stringify(data, null, 2));

          const advisor = data.factoryMsme || data;
          let failed = false;

          const expectedFields = [
            'workerSafetyStatus',
            'workerProtocolNow',
            'workerPPESpec',
            'workerRestCycle',
            'workerActions',
            'emissionStatus',
            'primaryMitigationAction',
            'emissionMitigationSteps',
            'stackControlRecommendation',
            'productionAdjustment',
            'doeNotificationStatus',
            'eqaBreachIndicator',
            'regulatoryCitation',
            'chainOfThought',
            'technicalReasoning'
          ];

          for (const f of expectedFields) {
            if (advisor[f] === undefined) {
              console.error(`❌ [ASSERTION FAILED] Missing field: "${f}".`);
              failed = true;
            }
          }

          if (failed) {
            console.error('\n💥 [TEST SUITE FAILED] factoryMsme role schema is incomplete.');
            process.exit(1);
          } else {
            console.log('\n✅ [TEST PASSED] factoryMsme role schema verified.');
            process.exit(0);
          }

        } catch (err) {
          console.error('❌ [JSON PARSE ERROR] Failed to parse response body:', err.message);
          process.exit(1);
        }
      });
    });
  });

  req.on('error', (e) => {
    console.error('❌ [REQUEST ERROR] Failed to connect to test server:', e.message);
    server.close(() => process.exit(1));
  });

  req.write(payload);
  req.end();
});
