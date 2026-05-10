
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
    console.log('❌ OPEN-METEO (Weather): CRITICAL FAILURE');
    console.log(e);
  }

  // 1b. Test Open-Meteo (Air Quality)
  try {
    const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LNG}&current=us_aqi,pm2_5,pm10`;
    const res = await fetch(airQualityUrl);
    const data = await res.json();
    console.log('DEBUG_OPEN_METEO_AIR:', JSON.stringify(data));
    if (data.current) {
      console.log('✅ OPEN-METEO (Air): SUCCESS (AQI: ' + data.current.us_aqi + ')');
    } else {
      console.log('❌ OPEN-METEO (Air): FAILED (Unexpected structure)');
    }
  } catch (e) {
    console.log('❌ OPEN-METEO (Air): CRITICAL FAILURE');
    console.log(e);
  }

  // 1c. Test Open-Meteo (Hourly/Trend)
  try {
    const hourlyUrl = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}&hourly=temperature_2m&forecast_days=1`;
    const res = await fetch(hourlyUrl);
    const data = await res.json();
    if (data.hourly) {
      console.log('✅ OPEN-METEO (Hourly Weather): SUCCESS (' + data.hourly.temperature_2m.length + ' data points)');
    } else {
      console.log('❌ OPEN-METEO (Hourly Weather): FAILED');
    }
  } catch (e) {
    console.log('❌ OPEN-METEO (Hourly Weather): CRITICAL FAILURE');
  }

  // 1d. Test Open-Meteo (Hourly Air Quality)
  try {
    const hourlyAirUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LNG}&hourly=pm2_5,european_aqi&forecast_days=1`;
    const res = await fetch(hourlyAirUrl);
    const data = await res.json();
    if (data.hourly) {
      console.log('✅ OPEN-METEO (Hourly Air): SUCCESS (' + data.hourly.pm2_5.length + ' data points)');
    } else {
      console.log('❌ OPEN-METEO (Hourly Air): FAILED');
    }
  } catch (e) {
    console.log('❌ OPEN-METEO (Hourly Air): CRITICAL FAILURE');
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
