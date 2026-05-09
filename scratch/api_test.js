
const AQICN_TOKEN = '414d0d37b1396066aeba58ec9b84f8e05f9f2c99';
const LAT = 3.1579;
const LNG = 101.7123;

async function testAPIs() {
  console.log('--- API CONNECTION AUDIT ---');
  
  // 1. Test Open-Meteo (Weather)
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}&current=temperature_2m`;
    const res = await fetch(weatherUrl);
    const data = await res.json();
    console.log('DEBUG_OPEN_METEO:', JSON.stringify(data));
    if (data.current) {
      console.log('✅ OPEN-METEO: SUCCESS (Temp: ' + data.current.temperature_2m + '°C)');
    } else {
      console.log('❌ OPEN-METEO: FAILED (Unexpected structure)');
    }
  } catch (e) {
    console.log('❌ OPEN-METEO: CRITICAL FAILURE (' + e.message + ')');
  }

  // 2. Test WAQI (Air Quality)
  try {
    const aqicnUrl = `https://api.waqi.info/feed/geo:${LAT};${LNG}/?token=${AQICN_TOKEN}`;
    const res = await fetch(aqicnUrl);
    const data = await res.json();
    if (data.status === 'ok') {
      console.log('✅ WAQI (AQICN): SUCCESS (AQI: ' + data.data.aqi + ')');
    } else {
      console.log('❌ WAQI (AQICN): FAILED (Status: ' + data.status + ', Message: ' + (data.data || 'N/A') + ')');
    }
  } catch (e) {
    console.log('❌ WAQI (AQICN): CRITICAL FAILURE (' + e.message + ')');
  }
}

testAPIs();
