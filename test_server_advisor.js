import http from 'http';

const payload = JSON.stringify({
  role: 'factoryMsme',
  sensorData: {
    id: 'klcc',
    name: 'KLCC',
    metrics: { aqi: { value: 120 }, temp: { value: 34.5 } },
    pollutants: { pm25: 45.0 }
  }
});

const options = {
  hostname: '127.0.0.1',
  port: 3001,
  path: '/api/advisor',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

console.log('[TEST] Hitting local server /api/advisor...');
const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log('[STATUS]', res.statusCode);
    console.log('[BODY]', body);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('[ERROR]', e.message);
  process.exit(1);
});

req.write(payload);
req.end();
