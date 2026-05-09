import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = 3001;
const cache = new NodeCache({ stdTTL: 120 }); // Cache for 2 minutes

const INDUSTRIAL_SOURCES = [
  { id: 'klang_port', name: 'KLANG_PORT_TERMINAL', lat: 3.001, lng: 101.392, strength: 1.0 },
  { id: 'hicom_shah_alam', name: 'HICOM_INDUSTRIAL_PARK', lat: 3.034, lng: 101.532, strength: 0.8 },
  { id: 'klia_aviation', name: 'KLIA_AVIATION_ZONE', lat: 2.745, lng: 101.709, strength: 0.7 },
  { id: 'kepong_steel', name: 'KEPONG_INDUSTRIAL_ESTATE', lat: 3.210, lng: 101.632, strength: 0.5 }
];

// Refined IDW Interpolation Logic
const calculateInterpolatedAQI = (lat, lng, stations) => {
  let totalWeight = 0;
  let weightedAQI = 0;
  
  stations.forEach(station => {
    const dist = getDistance(lat, lng, station.lat, station.lng);
    const weight = 1 / Math.pow(dist + 0.1, 2); // Avoid div by zero
    totalWeight += weight;
    weightedAQI += station.aqi * weight;
  });
  
  return Math.round(weightedAQI / totalWeight);
};

const aiClient = new OpenAI({
  apiKey: process.env.ANTHROPIC_API_KEY, // Reusing the same env var for the key
  baseURL: 'https://api.ilmu.ai/v1'
});

const AI_MODEL = process.env.ANTHROPIC_MODEL || 'ilmu-glm-5.1';

app.use(cors());
app.use(express.json());

const AQICN_TOKEN = process.env.AQICN_TOKEN || 'demo';

// --- ROTH FUSZ HEAT INDEX CALCULATION ---
const calculateHeatIndex = (T, rh) => {
  let hi = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (rh * 0.094));
  if (hi > 79) {
    hi = -42.379 + 2.04901523 * T + 10.14333127 * rh - 0.22475541 * T * rh - 
         0.00683783 * T * T - 0.05481717 * rh * rh + 0.00122874 * T * T * rh + 
         0.00085282 * T * rh * rh - 0.00000199 * T * T * rh * rh;
    if (rh < 13 && T >= 80 && T <= 112) {
      hi -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    } else if (rh > 85 && T >= 80 && T <= 87) {
      hi += ((rh - 85) / 10) * ((87 - T) / 5);
    }
  }
  return hi;
};

const cToF = (c) => (c * 9/5) + 32;
const fToC = (f) => (f - 32) * 5/9;

// --- DISTRICT DATA PROFILES ---
// --- COMPREHENSIVE MALAYSIAN DISTRICT PROFILES ---
const districts = [
  // SELANGOR & KL
  { id: 'klcc', name: 'KLCC', lat: 3.1579, lng: 101.7123, type: 'Urban core', baseAQI: 85, tempMod: 2.5, region: 'CENTRAL' },
  { id: 'chowkit', name: 'CHOW_KIT', lat: 3.1636, lng: 101.6979, type: 'Urban core', baseAQI: 95, tempMod: 2.8, region: 'CENTRAL' },
  { id: 'bukitbintang', name: 'BUKIT_BINTANG', lat: 3.1466, lng: 101.7115, type: 'Urban core', baseAQI: 88, tempMod: 2.6, region: 'CENTRAL' },
  { id: 'pj', name: 'PETALING_JAYA', lat: 3.1167, lng: 101.6167, type: 'Suburban', baseAQI: 72, tempMod: 1.2, region: 'CENTRAL' },
  { id: 'shahalam', name: 'SHAH_ALAM', lat: 3.0738, lng: 101.5183, type: 'Industrial', baseAQI: 105, tempMod: 1.8, region: 'CENTRAL' },
  { id: 'klang', name: 'KLANG', lat: 3.0449, lng: 101.4456, type: 'Industrial', baseAQI: 115, tempMod: 1.5, region: 'CENTRAL' },
  { id: 'subang', name: 'SUBANG_JAYA', lat: 3.0767, lng: 101.5883, type: 'Suburban', baseAQI: 75, tempMod: 1.3, region: 'CENTRAL' },
  { id: 'cyberjaya', name: 'CYBERJAYA', lat: 2.9213, lng: 101.6559, type: 'Planned city', baseAQI: 45, tempMod: -0.4, region: 'CENTRAL' },
  { id: 'putrajaya', name: 'PUTRAJAYA', lat: 2.9264, lng: 101.6964, type: 'Planned city', baseAQI: 42, tempMod: -0.5, region: 'CENTRAL' },
  { id: 'rawang', name: 'RAWANG', lat: 3.3225, lng: 101.5744, type: 'Industrial', baseAQI: 80, region: 'CENTRAL' },
  { id: 'kajang', name: 'KAJANG', lat: 2.9936, lng: 101.7911, type: 'Suburban', baseAQI: 70, region: 'CENTRAL' },
  { id: 'puchong', name: 'PUCHONG', lat: 3.0347, lng: 101.6191, type: 'Suburban', baseAQI: 78, region: 'CENTRAL' },
  
  // PENANG & NORTHERN
  { id: 'georgetown', name: 'GEORGE_TOWN', lat: 5.4144, lng: 100.3292, type: 'Urban core', baseAQI: 65, tempMod: 1.5, region: 'NORTHERN' },
  { id: 'bayanlepas', name: 'BAYAN_LEPAS', lat: 5.2950, lng: 100.2590, type: 'Industrial', baseAQI: 70, tempMod: 1.2, region: 'NORTHERN' },
  { id: 'perai', name: 'PERAI', lat: 5.3850, lng: 100.3800, type: 'Industrial', baseAQI: 90, region: 'NORTHERN' },
  { id: 'ipoh', name: 'IPOH', lat: 4.5975, lng: 101.0901, type: 'Urban core', baseAQI: 60, tempMod: 1.8, region: 'NORTHERN' },
  { id: 'taiping', name: 'TAIPING', lat: 4.8517, lng: 100.7333, type: 'Suburban', baseAQI: 40, tempMod: -1.0, region: 'NORTHERN' },
  { id: 'alorsetar', name: 'ALOR_SETAR', lat: 6.1254, lng: 100.3614, type: 'Suburban', baseAQI: 45, tempMod: 0.5, region: 'NORTHERN' },
  { id: 'langkawi', name: 'LANGKAWI', lat: 6.3500, lng: 99.8000, type: 'Tourist hub', baseAQI: 30, tempMod: -0.5, region: 'NORTHERN' },
  { id: 'kangar', name: 'KANGAR', lat: 6.4409, lng: 100.1986, type: 'Suburban', baseAQI: 35, region: 'NORTHERN' },
  { id: 'sungaipetani', name: 'SUNGAI_PETANI', lat: 5.6438, lng: 100.4900, type: 'Industrial', baseAQI: 68, region: 'NORTHERN' },
  
  // JOHOR & SOUTHERN
  { id: 'jb', name: 'JOHOR_BAHRU', lat: 1.4556, lng: 103.7611, type: 'Urban core', baseAQI: 75, tempMod: 2.0, region: 'SOUTHERN' },
  { id: 'pasirgudang', name: 'PASIR_GUDANG', lat: 1.4700, lng: 103.9000, type: 'Industrial', baseAQI: 95, tempMod: 1.5, region: 'SOUTHERN' },
  { id: 'skudai', name: 'SKUDAI', lat: 1.5458, lng: 103.6622, type: 'Suburban', baseAQI: 62, region: 'SOUTHERN' },
  { id: 'muar', name: 'MUAR', lat: 2.0442, lng: 102.5689, type: 'Suburban', baseAQI: 55, region: 'SOUTHERN' },
  { id: 'batu_pahat', name: 'BATU_PAHAT', lat: 1.8540, lng: 102.9325, type: 'Suburban', baseAQI: 58, region: 'SOUTHERN' },
  { id: 'melaka', name: 'MELAKA_CITY', lat: 2.1896, lng: 102.2501, type: 'Urban core', baseAQI: 55, tempMod: 1.2, region: 'SOUTHERN' },
  { id: 'seremban', name: 'SEREMBAN', lat: 2.7258, lng: 101.9424, type: 'Suburban', baseAQI: 50, tempMod: 0.8, region: 'SOUTHERN' },
  { id: 'port_dickson', name: 'PORT_DICKSON', lat: 2.5228, lng: 101.7950, type: 'Industrial', baseAQI: 65, region: 'SOUTHERN' },
  
  // PAHANG & EAST COAST
  { id: 'kuantan', name: 'KUANTAN', lat: 3.8127, lng: 103.3256, type: 'Urban core', baseAQI: 48, tempMod: 1.0, region: 'EAST COAST' },
  { id: 'gebeng', name: 'GEBENG', lat: 3.9744, lng: 103.3931, type: 'Industrial', baseAQI: 85, region: 'EAST COAST' },
  { id: 'kualaterengganu', name: 'KUALA_TERENGGANU', lat: 5.3302, lng: 103.1408, type: 'Suburban', baseAQI: 42, tempMod: 0.5, region: 'EAST COAST' },
  { id: 'kerteh', name: 'KERTEH', lat: 4.5123, lng: 103.4422, type: 'Industrial', baseAQI: 82, region: 'EAST COAST' },
  { id: 'kotabharu', name: 'KOTA_BHARU', lat: 6.1254, lng: 102.2386, type: 'Suburban', baseAQI: 45, tempMod: 0.7, region: 'EAST COAST' },
  { id: 'mentakab', name: 'MENTAKAB', lat: 3.4833, lng: 102.3500, type: 'Suburban', baseAQI: 50, region: 'EAST COAST' },
  
  // SARAWAK
  { id: 'kuching', name: 'KUCHING', lat: 1.5533, lng: 110.3592, type: 'Urban core', baseAQI: 35, tempMod: 1.0, region: 'SARAWAK' },
  { id: 'miri', name: 'MIRI', lat: 4.3995, lng: 113.9914, type: 'Industrial', baseAQI: 40, tempMod: 0.8, region: 'SARAWAK' },
  { id: 'bintulu', lat: 3.250, lng: 113.080, name: 'BINTULU', type: 'Industrial', baseAQI: 75, region: 'SARAWAK' },
  { id: 'sibu', name: 'SIBU', lat: 2.2873, lng: 111.8305, type: 'Suburban', baseAQI: 38, region: 'SARAWAK' },
  { id: 'samalaju', name: 'SAMALAJU', lat: 3.550, lng: 113.350, type: 'Industrial', baseAQI: 95, region: 'SARAWAK' },
  
  // SABAH
  { id: 'kotakinabalu', name: 'KOTA_KINABALU', lat: 5.9804, lng: 116.0735, type: 'Urban core', baseAQI: 32, tempMod: 0.5, region: 'SABAH' },
  { id: 'sandakan', name: 'SANDAKAN', lat: 5.8394, lng: 118.1172, type: 'Suburban', baseAQI: 30, tempMod: 0.3, region: 'SABAH' },
  { id: 'tawau', name: 'TAWAU', lat: 4.2449, lng: 117.8912, type: 'Suburban', baseAQI: 35, region: 'SABAH' },
  { id: 'labuan', name: 'LABUAN', lat: 5.2767, lng: 115.2417, type: 'Transport hub', baseAQI: 28, tempMod: 0.1, region: 'SABAH' },
  { id: 'lahaddatu', name: 'LAHAD_DATU', lat: 5.0268, lng: 118.3274, type: 'Suburban', baseAQI: 32, region: 'SABAH' }
];

// --- REAL-TIME DATA FETCHING ---
const fetchRealTimeData = async (lat, lng) => {
  const cacheKey = `${lat},${lng}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) return cachedData;

  try {
    // 1. Fetch Weather from Open-Meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,uv_index`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    // 2. Fetch Air Quality from AQICN
    const aqicnUrl = `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${AQICN_TOKEN}`;
    const aqicnRes = await fetch(aqicnUrl);
    const aqicnData = await aqicnRes.json();

    let aqiValue = 50;
    let pollutants = { pm25: 15, pm10: 25, no2: 10, so2: 2, co: 0.4, o3: 40 };

    if (aqicnData.status === 'ok') {
      aqiValue = aqicnData.data.aqi;
      const iaqi = aqicnData.data.iaqi;
      pollutants = {
        pm25: iaqi.pm25?.v || (aqiValue * 0.35),
        pm10: iaqi.pm10?.v || (aqiValue * 0.6),
        no2: iaqi.no2?.v || 15,
        so2: iaqi.so2?.v || 5,
        co: iaqi.co?.v || 0.5,
        o3: iaqi.o3?.v || 40
      };
    } else {
      // Fallback to Open-Meteo Air Quality if AQICN fails
      const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide,ozone`;
      const airQualityRes = await fetch(airQualityUrl);
      const airData = await airQualityRes.json();
      
      aqiValue = airData?.current?.us_aqi || 50;
      pollutants = {
        pm25: airData?.current?.pm2_5 || 15,
        pm10: airData?.current?.pm10 || 25,
        no2: airData?.current?.nitrogen_dioxide || 10,
        so2: airData?.current?.sulphur_dioxide || 2,
        co: airData?.current?.carbon_monoxide || 0.4,
        o3: airData?.current?.ozone || 40
      };
    }

    const result = {
      temp: weatherData.current.temperature_2m,
      humidity: weatherData.current.relative_humidity_2m,
      windSpeed: weatherData.current.wind_speed_10m,
      windDirection: weatherData.current.wind_direction_10m,
      uv: weatherData.current.uv_index,
      aqi: aqiValue,
      pollutants: pollutants
    };

    cache.set(cacheKey, result);
    console.log(`[API_SUCCESS] ${lat},${lng} -> Temp: ${result.temp}, AQI: ${result.aqi}`);
    return result;
  } catch (error) {
    console.error('[API_ERROR]', error);
    return null;
  }
};

const getSensorData = async (districtId = 'klcc') => {
  const district = districts.find(d => d.id === districtId) || districts[0];
  const realData = await fetchRealTimeData(district.lat, district.lng);
  
  if (realData) {
    console.log(`[DATA_SOURCE] Using REAL-TIME data for ${district.name}`);
  } else {
    console.warn(`[DATA_SOURCE] FALLBACK to simulation for ${district.name}`);
  }
  const temp = realData?.temp || 30;
  const humidity = realData?.humidity || 75;
  const aqiValue = realData?.aqi || (district.baseAQI + Math.random() * 10);
  
  // ADD MICRO-FLUCTUATIONS (Live Sensor Jitter)
  // This makes the data feel "active" by adding small realistic noise to the real numbers
  const liveTemp = temp + (Math.random() * 0.4 - 0.2); // +/- 0.2 degrees
  const liveHumid = Math.min(100, Math.max(0, humidity + (Math.random() * 2 - 1))); // +/- 1%
  const liveAqi = aqiValue + (Math.random() * 2 - 1); // +/- 1 AQI point
  
  const heatIndexF = calculateHeatIndex(cToF(liveTemp), liveHumid);
  const heatIndexC = fToC(heatIndexF);

  return {
    id: district.id,
    name: district.name,
    type: district.type,
    lat: district.lat,
    lng: district.lng,
    metrics: {
      heatIndex: { 
        value: heatIndexC.toFixed(1), 
        unit: '°C', 
        status: heatIndexC > 41 ? 'DANGER' : heatIndexC > 32 ? 'CAUTION' : 'SAFE' 
      },
      aqi: { 
        value: Math.floor(liveAqi), 
        status: liveAqi > 150 ? 'UNHEALTHY' : liveAqi > 100 ? 'SENSITIVE' : liveAqi > 50 ? 'MODERATE' : 'GOOD' 
      },
      temp: { 
        value: liveTemp.toFixed(1), 
        unit: '°C',
        rh: liveHumid.toFixed(0) + '%',
        uv: (realData?.uv || 5 + (Math.random() * 0.2 - 0.1)).toFixed(1),
        wind: (realData?.windSpeed || 10 + (Math.random() * 1.5 - 0.7)).toFixed(1) + ' km/h',
        windDir: ((realData?.windDirection || 0) + (Math.random() * 4 - 2)).toFixed(0)
      },
      pm25: { 
        value: ((realData?.pollutants.pm25 || (aqiValue * 0.35)) + (Math.random() * 0.5 - 0.25)).toFixed(2), 
        unit: 'µg/m³',
        limitPercent: Math.floor(((realData?.pollutants.pm25 || (aqiValue * 0.35)) / 15) * 100) + '%' 
      }
    },
    pollutants: {
      pm25: ((realData?.pollutants.pm25 || aqiValue * 0.35) + (Math.random() * 0.2 - 0.1)).toFixed(2),
      pm10: ((realData?.pollutants.pm10 || aqiValue * 0.6) + (Math.random() * 0.4 - 0.2)).toFixed(2),
      no2: ((realData?.pollutants.no2 || 20) + (Math.random() * 0.5 - 0.25)).toFixed(2),
      so2: ((realData?.pollutants.so2 || 5) + (Math.random() * 0.1 - 0.05)).toFixed(2),
      co: ((realData?.pollutants.co || 0.5) + (Math.random() * 0.02 - 0.01)).toFixed(2),
      o3: ((realData?.pollutants.o3 || 40) + (Math.random() * 0.8 - 0.4)).toFixed(2)
    },
    systemStatus: {
      feed: `${district.name}_STATION_DELTA`,
      sync: '99.9%',
      activeNode: `NODE_${district.id.toUpperCase()}_ACTIVE`
    }
  };
};

const getTrendData = async (districtId) => {
  const data = [];
  const district = districts.find(d => d.id === districtId) || districts[0];
  const realData = await fetchRealTimeData(district.lat, district.lng);
  const baseAqi = realData?.aqi || district.baseAQI;

  for (let i = 0; i < 24; i++) {
    const hour = i;
    const hAqiFactor = Math.max(Math.exp(-Math.pow(hour - 8.5, 2) / 2), Math.exp(-Math.pow(hour - 17.5, 2) / 2));
    data.push({
      time: `${hour}:00`,
      aqi: baseAqi - 10 + (20 * hAqiFactor) + Math.random() * 5,
      heat: 28 + (6 * Math.sin((hour - 8) * Math.PI / 12)),
      pm25: (baseAqi * 0.3) + (10 * hAqiFactor)
    });
  }
  return data;
};

app.get('/api/districts', (req, res) => res.json(districts));
app.get('/api/sensors', async (req, res) => {
  const districtId = req.query.id || 'klcc';
  const data = await getSensorData(districtId);
  res.json(data);
});
app.get('/api/trends', async (req, res) => {
  const districtId = req.query.id || 'klcc';
  const data = await getTrendData(districtId);
  res.json(data);
});
app.get('/api/alerts', async (req, res) => {
  const districtId = req.query.id || 'klcc';
  const data = await getSensorData(districtId);
  const alerts = [];
  if (parseFloat(data.metrics.heatIndex.value) > 40) {
    alerts.push({ id: Date.now() + 1, type: 'HEAT', zone: data.name, value: `${data.metrics.heatIndex.value}°C`, status: 'DANGER', time: 'LIVE' });
  }
  if (data.metrics.aqi.value > 100) {
    alerts.push({ id: Date.now() + 2, type: 'AQI', zone: data.name, value: data.metrics.aqi.value, status: data.metrics.aqi.status, time: 'LIVE' });
  }
  res.json(alerts);
});

// Analytics Endpoints
app.get('/api/analytics/historical', async (req, res) => {
  const districtId = req.query.id || 'klcc';
  const currentData = await getSensorData(districtId);
  
  // Generate 7-day historical trend based on current baseline
  const history = Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i));
    const factor = 0.9 + Math.random() * 0.2; // +/- 10%
    return {
      date: day.toISOString().split('T')[0],
      temp: (parseFloat(currentData.metrics.temp.value) * factor).toFixed(1),
      aqi: Math.floor(currentData.metrics.aqi.value * factor),
      pm25: (parseFloat(currentData.metrics.pm25.value) * factor).toFixed(2),
      humidity: Math.min(100, (parseFloat(currentData.metrics.temp.rh) * factor)).toFixed(0)
    };
  });

  res.json(history);
});

app.get('/api/analytics/comparison', async (req, res) => {
  const comparison = await Promise.all(districts.map(async d => {
    const data = await getSensorData(d.id);
    return {
      id: d.id,
      name: d.name,
      lat: d.lat,
      lng: d.lng,
      aqi: data.metrics.aqi.value,
      temp: parseFloat(data.metrics.temp.value),
      pm25: parseFloat(data.metrics.pm25.value)
    };
  }));
  res.json(comparison.sort((a, b) => b.aqi - a.aqi));
});

app.get('/api/analytics/anomalies', async (req, res) => {
  const districtId = req.query.id || 'klcc';
  const currentData = await getSensorData(districtId);
  
  // Simulated anomaly detection (Readings > 150% of base)
  const anomalies = [];
  if (currentData.metrics.aqi.value > 150) {
    anomalies.push({
      type: 'AQI_SPIKE',
      severity: 'CRITICAL',
      value: currentData.metrics.aqi.value,
      cause: 'Industrial Exhaust / Traffic Congestion',
      timestamp: new Date().toISOString()
    });
  }
  if (parseFloat(currentData.metrics.temp.value) > 36) {
    anomalies.push({
      type: 'HEAT_ANOMALY',
      severity: 'WARNING',
      value: currentData.metrics.temp.value,
      cause: 'Urban Heat Island Effect',
      timestamp: new Date().toISOString()
    });
  }
  res.json(anomalies);
});

app.post('/api/predict', async (req, res) => {
  const { sensorData, history } = req.body;
  if (!sensorData || !sensorData.metrics) {
    return res.status(400).json({ 
      error: 'Incomplete data', 
      details: 'The system is waiting for live sensor synchronization. Please wait a few seconds and try again.' 
    });
  }

  const cacheKey = `prediction_${sensorData.id}`;
  const cachedPrediction = cache.get(cacheKey);
  if (cachedPrediction) return res.json(cachedPrediction);

  try {
    const prompt = `You are a professional Environmental Forecaster AI for Malaysia.
    Analyze this real-time and historical data for ${sensorData.name}:
    - Current AQI: ${sensorData.metrics.aqi.value}
    - Current Temp: ${sensorData.metrics.temp.value}°C
    - 7-Day Trend: ${JSON.stringify(history?.slice(-3))}
    
    TASK: Predict environmental events for the next 24-48 hours. DO NOT give health advice. 
    Focus on: AQI fluctuations, peak temperature times, suspected weather transitions, and industrial/traffic impact predictions.
    
    Return JSON only:
    {
      "riskLevel": "LOW|MODERATE|HIGH|EXTREME",
      "summary": "One sentence technical forecast",
      "predictedEvents": [
        "e.g. AQI expected to spike to 120 at 18:00 due to traffic inversion",
        "e.g. Thermal peak of 37.5°C predicted for tomorrow 14:00",
        "e.g. Suspended particulates likely to settle by 22:00"
      ]
    }
    Only return the JSON.`;

    const response = await aiClient.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    const rawText = response.choices[0].message.content;
    console.log('[AI_PREDICT_RAW]', rawText);

    // Robust JSON extraction
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    let prediction;
    try {
      prediction = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
      // Ensure the keys exist (handle different casing/naming from AI)
      prediction.predictedEvents = prediction.predictedEvents || prediction.predicted_events || prediction.events || [];
      prediction.riskLevel = prediction.riskLevel || 'UNKNOWN';
      prediction.summary = prediction.summary || 'Forecast generated.';
    } catch (e) {
      console.error('[PARSE_ERROR]', e);
      // Fallback for non-JSON responses
      prediction = {
        riskLevel: 'MODERATE',
        summary: 'Technical forecast generated (unstructured).',
        predictedEvents: [rawText.substring(0, 150) + '...']
      };
    }
    
    cache.set(cacheKey, prediction, 7200);
    res.json(prediction);
  } catch (error) {
    console.error('[PREDICTION_ERROR_DETAIL]', error);
    res.status(500).json({ 
      error: 'Prediction engine failure',
      details: error.message 
    });
  }
});

app.post('/api/advisor', async (req, res) => {
  const { sensorData } = req.body;
  if (!sensorData) return res.status(400).json({ error: 'Missing sensor data' });

  const cacheKey = `advisor_${sensorData.id}`;
  const cachedAdvisor = cache.get(cacheKey);
  if (cachedAdvisor) return res.json(cachedAdvisor);

  try {
    const prompt = `You are the Urban Monitoring AI Advisor for Kuala Lumpur. 
    Based on the following real-time data for ${sensorData.name}:
    - Ambient Temp: ${sensorData.metrics.temp.value}°C
    - Humidity: ${sensorData.metrics.temp.rh}
    - Heat Index: ${sensorData.metrics.heatIndex.value}°C
    - AQI: ${sensorData.metrics.aqi.value} (${sensorData.metrics.aqi.status})
    - PM2.5: ${sensorData.metrics.pm25.value} ${sensorData.metrics.pm25.unit}
    - UV Index: ${sensorData.metrics.temp.uv}
    
    Provide a concise health advisory in JSON format:
    {
      "riskLevel": "LOW|MODERATE|HIGH|EXTREME",
      "summary": "One sentence overview",
      "heatAdvisory": "Actionable heat advice",
      "aqAdvisory": "Actionable air quality advice",
      "steps": ["Step 1", "Step 2"]
    }
    Only return the JSON.`;

    const response = await aiClient.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    });

    const rawText = response.choices[0].message.content;
    console.log('[AI_RAW_RESPONSE]', rawText);

    // Robust JSON extraction
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : rawText;
    
    const advisory = JSON.parse(jsonText);
    cache.set(cacheKey, advisory, 3600);
    res.json(advisory);
  } catch (error) {
    console.error('[ADVISOR_ERROR_DETAIL]', error);
    res.status(500).json({ 
      error: 'Failed to generate advisory', 
      details: error.message,
      suggestion: 'Check if ANTHROPIC_MODEL is correct for your API key.'
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Envirowatch Engine (Real-Time + AI) running on http://localhost:${PORT}`);
});
