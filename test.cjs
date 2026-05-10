const http = require('http');
const data = JSON.stringify({ sensorData: { name: 'KLCC', type: 'Urban', region: 'CENTRAL', metrics: { aqi: { value: 50 }, temp: { value: 31 } } } });
const options = { hostname: 'localhost', port: 3001, path: '/api/predict', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length } };
const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', body));
});
req.on('error', e => console.error(e));
req.write(data);
req.end();
