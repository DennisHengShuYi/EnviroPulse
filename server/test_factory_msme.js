// Native fetch available in Node 18+

async function testFactoryMsme() {
  const sensorData = {
    id: "factory-alpha",
    name: "Industrial Zone A",
    aqi: 85,
    pm25: 28.5,
    pm10: 45.2,
    no2: 12.8,
    so2: 5.4,
    co: 0.8,
    o3: 22.1,
    temp: 32,
    humidity: 65,
    timestamp: new Date().toISOString()
  };

  console.log("Testing Factory MSME Advisory...");
  console.log("Sensor Data:", JSON.stringify(sensorData, null, 2));

  try {
    const response = await fetch('http://localhost:3001/api/advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sensorData, role: 'factoryMsme' })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP Error ${response.status}:`, errorText);
      return;
    }

    const data = await response.json();
    console.log("AI Advisory Response:");
    console.log(JSON.stringify(data, null, 2));

    // Validation
    const advisory = data.factoryMsme || data;
    const requiredFields = [
      'workerSafetyStatus', 'workerProtocolNow', 'workerPPESpec', 
      'workerRestCycle', 'workerActions', 'emissionStatus', 
      'primaryMitigationAction', 'emissionMitigationSteps'
    ];

    const missing = requiredFields.filter(field => !advisory[field]);
    if (missing.length > 0) {
      console.error("FAIL: Missing required fields:", missing);
    } else {
      console.log("SUCCESS: All required fields present.");
    }

  } catch (error) {
    console.error("Test Error:", error);
  }
}

testFactoryMsme();
