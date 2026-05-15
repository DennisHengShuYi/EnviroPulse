import { spawn } from 'child_process';

async function testFullChain() {
  console.log('Starting test server on port 3002...');
  const server = spawn('node', ['server/index.js'], {
    env: { ...process.env, PORT: '3002' }
  });

  server.stdout.on('data', (data) => {
    console.log(`[SERVER_LOG]: ${data}`);
  });

  server.stderr.on('data', (data) => {
    console.error(`[SERVER_ERR]: ${data}`);
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('Triggering Advisor Request...');
  const sensorData = {
    id: "klcc",
    name: "KLCC",
    metrics: {
      aqi: { value: 85 },
      pm25: { value: 28.5 },
      heatIndex: { value: 31.7 },
      temp: { value: 30.5, rh: "65%" }
    },
    pollutants: {
      pm25: 28.5,
      pm10: 45.2,
      no2: 12.8,
      so2: 5.4,
      co: 0.8,
      o3: 22.1
    }
  };

  try {
    const response = await fetch('http://localhost:3002/api/advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sensorData, role: 'factoryMsme' })
    });

    const data = await response.json();
    console.log('Advisor Response:', JSON.stringify(data, null, 2));
    
    if (data.isFallback) {
      console.error('FAIL: Still getting fallback data.');
    } else {
      console.log('SUCCESS: Got real LLM response!');
    }
  } catch (err) {
    console.error('Request failed:', err.message);
  } finally {
    console.log('Cleaning up...');
    server.kill();
    process.exit(0);
  }
}

testFullChain();
