async function testAdvisor() {
  console.log('Testing /api/advisor endpoint...');
  try {
    const response = await fetch('http://localhost:3001/api/advisor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sensorData: {
          id: 'klcc',
          name: 'KLCC / Kuala Lumpur City Centre',
          type: 'Urban / Commercial',
          metrics: {
            aqi: { value: 75 },
            temp: { value: 31 },
            pm25: { value: 22 }
          },
          pollutants: {
            pm25: 22,
            pm10: 45,
            o3: 12,
            no2: 8,
            so2: 4,
            co: 0.5
          }
        },
        requestedRole: 'factoryMsme'
      })
    });
    
    console.log('Response Status:', response.status);
    const data = await response.json();
    console.log('Response Data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Advisor API Error:', err.message);
  }
}

testAdvisor();
