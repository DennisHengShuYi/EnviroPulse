import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const aiClient = new OpenAI({
  apiKey: process.env.ILMU_API_KEY || process.env.ANTHROPIC_API_KEY || 'sk-dummy-key-for-local-dev',
  baseURL: 'https://api.ilmu.ai/v1/',
  timeout: 60000
});

const AI_MODEL = process.env.ANTHROPIC_MODEL || 'ilmu-glm-5.1';

async function testFullPrompt() {
  const sensorData = {
    id: 'klcc',
    name: 'KLCC / Kuala Lumpur City Centre',
    type: 'Urban / Commercial',
    region: 'Kuala Lumpur',
    metrics: {
      aqi: { value: 75 },
      temp: { value: 31, rh: 65, wind: 12, windDir: 180 },
      heatIndex: { value: 35 }
    },
    pollutants: {
      pm25: 22,
      pm10: 45,
      o3: 12,
      no2: 8,
      so2: 4,
      co: 0.5
    }
  };
  
  const requestedRole = 'factoryMsme';
  const history = [];

  console.log('Testing AI with full prompt for role:', requestedRole);

  const prompt = {
    messages: [
      {
        role: "system",
        content: `You are the ENVIROWATCH Compliance Advisory Engine (Patent UI 2020000785), a real-time anti-greenwashing compliance intelligence system for Malaysian industrial operators and regulators.
You give COMPLIANCE VERDICTS, not environmental health advice. Every output must answer:
"Given these exact sensor readings, what is this stakeholder's legal compliance position RIGHT NOW, and what specific action do they need to take TODAY?"

HARD RULES:
1. Use every sensor value provided. Reference each number at least once.
2. Every compliance statement must name a specific law, section, and threshold number.
3. Never write sentences that could apply to any district on any day. If it doesn't contain a number from the live data, rewrite it.
4. The MSME role must speak in plain Bahasa-English mixed register — like a compliance officer explaining to a small business owner, not academic writing.
5. Return ONLY valid JSON. No markdown.

THRESHOLDS:
- WHO PM2.5: 15 µg/m³ | DOE API notification: 50 | DOSH heat rest cycle: 33°C | OSH 2024 STOP WORK: 40°C | Bursa E1 disclosure: PM2.5 > WHO limit | EQA 1974 Sec 22 notification: AQI > 50 | NCAAP quarterly exceedance tracking: PM2.5 > 15
- factoryMsme role: This is a high-risk pollution source role. Output must contain two distinct logic blocks: Worker Safety (heat index vs DOSH) and Emission Mitigation (particulate control vs boundary limits). Every sentence must cite a real sensor number.`
      },
      {
        role: "user",
        content: `DISTRICT: ${sensorData.name} | TYPE: ${sensorData.type} | REGION: ${sensorData.region}
TIME: ${new Date().toLocaleTimeString('en-MY', {timeZone:'Asia/Kuala_Lumpur'})}

LIVE READINGS:
Heat Index: ${sensorData.metrics?.heatIndex?.value}°C | Temp: ${sensorData.metrics?.temp?.value}°C | RH: ${sensorData.metrics?.temp?.rh}
AQI: ${sensorData.metrics?.aqi?.value} | PM2.5: ${sensorData.pollutants?.pm25} µg/m³ | PM10: ${sensorData.pollutants?.pm10} µg/m³
NO2: ${sensorData.pollutants?.no2?.value || sensorData.pollutants?.no2} ppb | Wind: ${sensorData.metrics?.temp?.wind} @ ${sensorData.metrics?.temp?.windDir}°

PRE-COMPUTED COMPLIANCE GAPS (use these in your output):
- PM2.5 exceedance: ${sensorData.pollutants?.pm25} - 15 = ${(sensorData.pollutants?.pm25 - 15).toFixed(2)} µg/m³ above WHO limit
- PM2.5 as % of WHO limit: ${(sensorData.pollutants?.pm25 / 15 * 100).toFixed(1)}%
- Heat index buffer to DOSH Category 1: ${(33 - sensorData.metrics?.heatIndex?.value).toFixed(1)}°C remaining
- AQI buffer to EQA notification: ${(50 - sensorData.metrics?.aqi?.value).toFixed(0)} units remaining
- Acceptable corporate PM2.5 submission range (±20%): ${(sensorData.pollutants?.pm25 * 0.8).toFixed(1)} – ${(sensorData.pollutants?.pm25 * 1.2).toFixed(1)} µg/m³

HISTORICAL TRENDS (Last 12-24H buffer):
${JSON.stringify((history || []).slice(-12))}

You are speaking to the ${requestedRole} stakeholder. Use history to detect if pollution is rising or falling.

Generate compliance advisory ONLY for the "${requestedRole}" role schema. Return a pure JSON object for this role.
Every role output must have "isFallback": false and "riskLevel" ("LOW", "MODERATE", "HIGH", "EXTREME").

Include these exact mandatory fields populated with connected sentences containing real arithmetic and concrete numbers:
- complianceVerdict: one sentence stating current legal compliance position with specific clause
- submissionWindowAlert: whether today's readings support or contradict a clean submission
- specificAction: exactly what this stakeholder must do TODAY — one concrete action with deadline
- regulatoryCitation: the specific law section and threshold that applies
- chainOfThought: 5 steps showing actual arithmetic with the sensor values above
- siteActions: 6 specific actions referencing the actual numbers, not generic advice
- detailedAnalysis: 3-4 sentences using the actual readings, no generic environmental language
- technicalReasoning: cite the exact gap between current reading and applicable threshold
- healthRiskBreakdown: { heatStress, respiratoryRisk, complianceExposure } — all using actual values
- bursaE1Status: whether PM2.5 at ${sensorData.pollutants?.pm25} µg/m³ creates a Bursa E1 disclosure obligation

Role-specific mapping requirements:
3. factoryMsme: Generate two distinct logic blocks: Worker Safety (workerSafetyStatus, workerProtocolNow, workerPPESpec, workerRestCycle, workerActions) and Emission Mitigation (emissionStatus, primaryMitigationAction, emissionMitigationSteps, stackControlRecommendation, productionAdjustment). Also supply doeNotificationStatus, eqaBreachIndicator, plainVerdict, and regulatoryCitation. Write in plain conversational language for a non-technical industrial manager.

CRITICAL INSTRUCTION: Output ONLY the pure flat JSON object for the "${requestedRole}" role schema directly. Must match this exact structure:
${JSON.stringify({
  isFallback: false,
  riskLevel: "LOW|MODERATE|HIGH|EXTREME",
  complianceVerdict: "...",
  submissionWindowAlert: "...",
  specificAction: "...",
  regulatoryCitation: "...",
  chainOfThought: ["...", "...", "...", "...", "..."],
  siteActions: ["...", "...", "...", "...", "...", "..."],
  detailedAnalysis: "...",
  technicalReasoning: "...",
  healthRiskBreakdown: { heatStress: "...", respiratoryRisk: "...", complianceExposure: "..." },
  bursaE1Status: "...",
  workerSafetyStatus: "SAFE|CAUTION|DANGER|STOP_WORK",
  workerProtocolNow: "...",
  workerPPESpec: "...",
  workerRestCycle: "...",
  workerActions: ["...", "...", "...", "..."],
  emissionStatus: "CONTROLLED|MODERATE|ELEVATED|BREACH",
  primaryMitigationAction: "...",
  emissionMitigationSteps: ["...", "...", "..."],
  stackControlRecommendation: "...",
  productionAdjustment: "...",
  doeNotificationStatus: "...",
  eqaBreachIndicator: "...",
}, null, 2)}
`
      }
    ]
  };

  try {
    const response = await aiClient.chat.completions.create({
      model: AI_MODEL,
      messages: prompt.messages,
      temperature: 0.1,
      max_tokens: 4000
    });
    
    const rawText = response.choices[0].message.content;
    console.log('Finish Reason:', response.choices[0].finish_reason);
    console.log('Raw Text Length:', rawText.length);
    console.log('Response choice 0 content:', rawText);
    
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON match found in response');
    }
    let advisory = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
    console.log('Parsed Advisory:', JSON.stringify(advisory, null, 2));
  } catch (err) {
    console.error('AI Error:', err.message);
    if (err.stack) console.error(err.stack);
  }
}

testFullPrompt();
