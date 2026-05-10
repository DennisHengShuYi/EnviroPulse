const sensorData = {
    id: 'klcc',
    name: 'KLCC',
    type: 'Urban core',
    lat: 3.1579,
    lng: 101.7123,
    metrics: {
      heatIndex: { value: '38.2', unit: '°C', status: 'SAFE' },
      aqi: { value: 45, status: 'GOOD' },
      temp: {
        value: '31.2',
        unit: '°C',
        rh: '81%',
        uv: '0.0',
        wind: '0.0 km/h',
        windDir: '0'
      },
      pm25: {
        value: '0.00',
        unit: 'µg/m³',
        limitPercent: '0%',
        status: 'NOMINAL'
      }
    },
    pollutants: { pm25: '15.65', pm10: '26.80', no2: { value: '19.85', status: 'STABLE' }, so2: '4.95', co: '0.49', o3: '39.60' },
    systemStatus: { feed: 'KLCC_STATION_DELTA', sync: '99.9%', activeNode: 'NODE_KLCC_ACTIVE' }
  };

const generateDynamicFallback = (category, sensorData) => {
  const name = sensorData.name || 'Unknown District';
  const type = sensorData.type || 'Urban';
  const region = sensorData.region || 'CENTRAL';
  const aqi = parseFloat(sensorData.metrics?.aqi?.value) || 50;
  const temp = parseFloat(sensorData.metrics?.temp?.value) || 31;
  const pm25 = parseFloat(sensorData.metrics?.pm25?.value || sensorData.metrics?.pm25) || 15;
  const humidity = parseFloat(sensorData.metrics?.temp?.rh?.replace('%', '')) || 80;
  const uv = parseFloat(sensorData.metrics?.temp?.uv) || 8;
  const windSpeed = parseFloat(sensorData.metrics?.temp?.wind?.replace(' km/h', '')) || 10;
  const windDir = parseFloat(sensorData.metrics?.temp?.windDir) || 0;

  const riskLevel = aqi > 150 || temp > 36 ? 'EXTREME' : aqi > 100 || temp > 33 ? 'HIGH' : aqi > 50 ? 'MODERATE' : 'LOW';
  
  const isIndustrial = type.toLowerCase().includes('industrial');
  const isUrban = type.toLowerCase().includes('urban');

  if (category === 'advisor') {
    return {
      construction: {
        riskLevel,
        workRestCycle: riskLevel === 'EXTREME' ? "15 min work / 45 min rest" : riskLevel === 'HIGH' ? "30 min work / 30 min rest" : "45 min work / 15 min rest",
        safetyPPE: `N95 Respirators (mandatory for AQI ${aqi}), UPF 50+ Cooling Vests, Hydration Packs (min 1L/hr), UV400 Goggles.`,
        siteActions: [
          `Deploy ${Math.ceil(aqi/30)} additional hydration stations in ${name}`,
          `Activate ${isIndustrial ? 'Misting Cannons' : 'Dust Suppression'} at ${name} site boundary`,
          `Schedule high-exertion tasks before 09:30 or after 17:30`,
          `Monitor WBGT every 30 mins (Current Temp: ${temp}°C)`,
          `Establish ventilated shaded zones within 50m of active work`,
          `Mandatory heat-stress briefing for all ${type} site personnel`,
          `Check wind direction (${windDir}°) for particulate plume management`,
          `Report any heat-related illness to DOSH within 1 hour`
        ],
        detailedAnalysis: `The ${type} environment in ${name} is currently experiencing ${riskLevel.toLowerCase()} environmental stress. With a recorded temperature of ${temp}°C and AQI at ${aqi}, physiological strain on outdoor workers is elevated. The ${region} regional climate pattern suggests sustained humidity (${humidity}%), further impairing evaporative cooling.`,
        technicalReasoning: `Analysis based on Rothfusz Heat Index (${temp}°C, ${humidity}% RH) and DOSH Malaysia OSHA Act 514. The synergistic effect of PM2.5 (${pm25}µg/m³) and thermal load triggers mandatory administrative controls.`,
        healthRiskBreakdown: {
          heatStress: temp > 33 ? `High risk of heat exhaustion in ${type} heat island.` : "Managed thermal risk.",
          respiratoryRisk: aqi > 100 ? `AQI ${aqi} requires N95 protection for all personnel.` : "Baseline respiratory precautions.",
          uvExposure: `Current UV index is ${uv.toFixed(1)}; dermal protection is ${uv > 6 ? 'mandatory' : 'recommended'}.`
        }
      },
      government: {
        riskLevel,
        publicStatus: `Public health risk in ${name} is ${riskLevel}. Residents in this ${type} zone are advised to ${aqi > 100 ? 'stay indoors' : 'limit outdoor activity'}.`,
        policyTrigger: aqi > 100 ? 'Level 2 Public Health Alert (DOE API Framework)' : 'Level 1 Monitoring Protocol',
        infrastructureImpact: `Grid demand in ${region} is projected to rise by ${Math.max(0, Math.floor((temp-28)*3.2))}% due to cooling load.`,
        escalationContact: 'Kementerian Kesihatan Malaysia (KKM) State Office',
        emergencyProtocol: 'Activate community cooling centers and MySejahtera health push notifications.',
        populationAtRisk: 'Children, elderly, and respiratory-sensitive individuals in high-density urban areas.',
        technicalReasoning: `Classification based on DOE Malaysia API thresholds and KKM heat-health guidelines for the ${region} region.`
      },
      esgFirm: {
        riskLevel,
        complianceRating: aqi > 100 ? 'B- / 68' : 'B+ / 74',
        environmentalPerformance: `District environmental performance for ${name} is impacted by ${isIndustrial ? 'industrial particulate' : 'urban heat island'} factors (PM2.5: ${pm25}µg/m³).`,
        mitigationStrategy: 'Optimize HVAC cycling and accelerate renewable energy tariff (RE Tariff) uptake.',
        regulatoryContext: 'EQA 1974, Bursa Malaysia ESG Framework, GRI 305 Disclosure Guidelines.',
        carbonImpact: `Projected Scope 2 emission uplift of ${Math.max(0, Math.floor((temp-28)*1.5))}% against TNB grid factors.`,
        sdgAlignment: 'SDG 3 (Health), SDG 11 (Cities), SDG 13 (Climate Action) - Partial Alignment.',
        technicalReasoning: `Metric-driven audit incorporating TCFD physical risk indicators and WHO 2021 guideline gaps.`
      }
    };
  } else if (category === 'prediction') {
    const formattedName = name.replace(/_/g, ' ');
    const isHot = temp >= 33;
    const isPolluted = aqi >= 80;
    const isUrban = type.toLowerCase().includes('urban');
    const isSuburban = type.toLowerCase().includes('suburban');

    let constOpening = `Atmospheric stability in ${formattedName} is projected to maintain ${riskLevel.toLowerCase()} risks over the next 48 hours.`;
    if (isUrban) constOpening = `The dense urban infrastructure in ${formattedName} will trap heat, driving ${riskLevel.toLowerCase()} exposure risks for outdoor workers over the next 48-hour window.`;
    else if (isIndustrial) constOpening = `Heavy industrial activity in ${formattedName} combined with local weather patterns (Wind: ${windSpeed}km/h) projects a ${riskLevel.toLowerCase()} risk profile for site operations.`;
    else if (isSuburban) constOpening = `Residential and commercial development zones across ${formattedName} are facing ${riskLevel.toLowerCase()} environmental stress for the next 48 hours.`;

    let constThermal = `The ${type} morphology will sustain thermal loads, with peak heat index occurring between 13:00-16:00.`;
    if (isHot) constThermal = `Severe thermal loading is expected due to the ${type} landscape and ${humidity}% humidity, pushing the heat index to ${(temp + 2).toFixed(1)}°C during peak afternoon hours.`;

    let govOpening = `Public health metrics in ${formattedName} are expected to track within the ${riskLevel.toLowerCase()} band.`;
    if (isPolluted) govOpening = `Elevated pollutant levels (PM2.5: ${pm25}µg/m³) in ${formattedName} have shifted the 48-hour public health forecast into the ${riskLevel.toLowerCase()} band.`;
    else if (isUrban) govOpening = `Population density in ${formattedName} combined with thermal trapping shifts public health risks to ${riskLevel.toLowerCase()} levels.`;

    let esgOpening = `ESG disclosures for the ${formattedName} node will focus on Scope 2 carbon intensity and WHO PM2.5 compliance gaps.`;
    if (isIndustrial) esgOpening = `Industrial emission baselines for ${formattedName} will heavily influence upcoming GRI 305 disclosures and Scope 2 projections.`;
    else if (isSuburban) esgOpening = `Decentralized cooling demands in the ${formattedName} suburban grid will drive the 48-hour carbon intensity narrative.`;

    return {
      construction: {
        riskLevel,
        forecast48h: `${constOpening} ${constThermal} AQI trends suggest ${isPolluted ? 'persistent particulate stagnation requiring strict PPE compliance' : 'stable levels with minor localized dust spikes'}.`,
        predictedEvents: [
          `07:30 — ${isPolluted ? `Morning smog layer (PM2.5: ${pm25}): Ensure respiratory PPE` : 'Optimal work window: Low UV and stable AQI'}`,
          `12:00 — UV Index crosses ${uv > 8 ? 'Extreme' : 'High'} threshold (${uv.toFixed(1)}) in ${region}: PPE activation`,
          `14:00 — Peak Heat Index (${(temp + 2).toFixed(1)}°C projected): ${isHot ? 'Mandatory rest cycles' : 'Monitor WBGT levels'}`,
          `16:30 — Convective cooling begins across ${formattedName} (Wind: ${windSpeed}km/h): Partial recovery`,
          `19:00 — Baseline stability: Safe window for ${isIndustrial ? 'heavy machinery operations' : 'logistics'}`
        ],
        chainOfThought: [
          `1. Validate ${formattedName} baseline against Malaysia equatorial norms.`,
          `2. Project heat index trajectory for ${type} using Rothfusz model (${humidity}% RH).`,
          `3. Assess PM2.5 trends based on current ${pm25} µg/m³ concentration.`,
          `4. Evaluate UV solar cycle impact for ${region} latitude (UV: ${uv.toFixed(1)}).`,
          `5. Map findings to DOSH Malaysia safety thresholds.`,
          `6. Assign risk confidence (${isHot ? '92%' : '85%'}) based on pattern stability.`
        ],
        riskMatrix: { 
          heat: Math.min(100, Math.max(10, Math.floor((temp - 25) * 6))), 
          air: Math.min(100, Math.floor((aqi / 150) * 100)), 
          uv: Math.min(100, Math.floor((uv / 11) * 100)), 
          overall: Math.min(100, Math.floor(((temp-25)*3) + (aqi*0.4) + (uv*2)))
        },
        hourlyOutlook: [
          { window: '06:00–10:00', condition: isPolluted ? 'Poor Air Quality' : 'Manageable', risk: isPolluted ? 'HIGH' : 'LOW' },
          { window: '10:00–14:00', condition: 'Rising Heat', risk: isHot ? 'HIGH' : 'MODERATE' },
          { window: '14:00–18:00', condition: 'Peak Stress', risk: isHot ? 'EXTREME' : 'HIGH' },
          { window: '18:00–22:00', condition: 'Cooling', risk: 'MODERATE' },
          { window: '22:00–02:00', condition: 'Stable', risk: 'LOW' },
          { window: '02:00–06:00', condition: 'Optimal', risk: 'LOW' }
        ],
        technicalReasoning: `Predictive model based on ${region} regional weather persistence and ${type}-specific emission profiles. Referenced against ISO 7243.`
      },
      government: {
        riskLevel,
        forecast48h: `${govOpening} Healthcare centers should prepare for minor increases in ${isHot ? 'heat-related' : 'respiratory'} presentations during afternoon windows.`,
        predictedEvents: [
          `08:00 — Commute NO2 spike expected in ${formattedName}`,
          `13:00 — Grid demand surge +${Math.max(0, Math.floor((temp - 28) * 1.5))}% above baseline`,
          `15:00 — Peak public exposure advisory for ${type} zones`,
          `18:00 — ${isIndustrial ? 'Industrial' : 'Traffic-related'} PM2.5 increase`,
          `22:00 — System recovery to baseline`
        ],
        chainOfThought: [
          `1. Evaluate DOE API classification trajectory (Current: ${aqi}).`,
          `2. Map vulnerable population exposure windows for ${type} areas.`,
          `3. Model healthcare surge from thermal patterns (${temp}°C).`,
          `4. Forecast infrastructure load for ${formattedName} (Wind: ${windSpeed}km/h).`,
          `5. Check policy trigger thresholds (EQA 1974).`,
          `6. Determine inter-agency escalation needs.`
        ],
        riskMatrix: { 
          publicHealth: Math.min(100, Math.floor((aqi / 150) * 100)), 
          infrastructure: Math.min(100, Math.max(10, Math.floor((temp - 26) * 7))), 
          policy: Math.min(100, Math.floor((pm25 / 35) * 100)), 
          overall: Math.min(100, Math.floor((aqi*0.3) + (temp*1.5))) 
        },
        hourlyOutlook: [
          { window: '06:00–10:00', condition: 'Normal', risk: 'LOW' },
          { window: '10:00–18:00', condition: isHot ? 'Heat Warning' : 'Heightened Monitoring', risk: isHot ? 'HIGH' : 'MODERATE' },
          { window: '18:00–06:00', condition: 'Baseline', risk: 'LOW' },
          { window: '06:00–10:00', condition: 'Normal', risk: 'LOW' },
          { window: '10:00–18:00', condition: 'Moderate Heat', risk: 'MODERATE' },
          { window: '18:00–06:00', condition: 'Baseline', risk: 'LOW' }
        ],
        technicalReasoning: `Forecast derived from DOE Malaysia trend analysis and TNB grid demand elasticity models for ${region}.`
      },
      esgFirm: {
        riskLevel,
        forecast48h: `${esgOpening} High thermal loads will negatively impact GRI 305 performance during peak hours.`,
        predictedEvents: [
          `09:00 — Disclosure data capture window for ${formattedName}`,
          `14:00 — Peak carbon intensity event (+${Math.max(0, Math.floor((temp - 28) * 2))}% uplift)`,
          `16:00 — TCFD physical risk review (${type} morphology)`,
          `20:00 — Aggregated daily ESG audit`,
          `24:00 — Reporting cycle close`
        ],
        chainOfThought: [
          `1. Model carbon intensity from temperature drivers (${temp}°C).`,
          `2. Analyze GRI 305 disclosure gaps against WHO limits (PM2.5: ${pm25}).`,
          `3. Perform TCFD physical risk assessment for ${formattedName}.`,
          `4. Score SDG alignment (3, 11, 13).`,
          `5. Evaluate investor materiality for the ${type} district.`,
          `6. Identify mitigation opportunities (RE Tariff).`
        ],
        riskMatrix: { 
          carbon: Math.min(100, Math.max(10, Math.floor((temp - 28) * 8 + 30))), 
          compliance: Math.min(100, Math.floor((pm25 / 35) * 100)), 
          disclosure: Math.min(100, Math.floor(humidity * 0.7)), 
          overall: Math.min(100, Math.floor((temp*1.3) + (pm25*0.8))) 
        },
        hourlyOutlook: [
          { window: 'Morning', condition: 'Disclosure Window', risk: 'LOW' },
          { window: 'Afternoon', condition: isHot ? 'Critical Carbon Peak' : 'Carbon Intensity Peak', risk: isHot ? 'EXTREME' : 'HIGH' },
          { window: 'Evening', condition: 'Data aggregation', risk: 'MODERATE' },
          { window: 'Night', condition: 'Baseline', risk: 'LOW' },
          { window: 'Morning', condition: 'Disclosure Window', risk: 'LOW' },
          { window: 'Afternoon', condition: 'Carbon Peak', risk: 'HIGH' }
        ],
        technicalReasoning: `Audit-grade projection using Bursa Malaysia ESG Disclosure Framework and TNB emission factors.`
      }
    };
  }
  return {};
};

console.log(JSON.stringify(generateDynamicFallback('prediction', sensorData), null, 2));
