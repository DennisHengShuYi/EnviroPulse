import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const City3DView = ({ data, allDistricts, onSelectDistrict }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [buildingOpacity, setBuildingOpacity] = useState(0.8);
  const [showBeacon, setShowBeacon] = useState(true);
  const [showTempHeatmap, setShowTempHeatmap] = useState(false);
  const [showAQIHeatmap, setShowAQIHeatmap] = useState(false);

  // Persistence for simulation
  const pListRef = useRef([]);
  const windOffsetRef = useRef(0);

  // Initialize MapLibre
  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/positron',
      center: [data.lng, data.lat],
      zoom: 15,
      pitch: 60,
      bearing: -17.6,
      antialias: true
    });

    mapRef.current = map;

    map.on('load', () => {
      const allDistrictsList = (allDistricts || [data]).filter(d => d && typeof d.lng === 'number' && typeof d.lat === 'number');
      
      // TEMPERATURE HEATMAP (NATIONWIDE COVERAGE)
      map.addSource('temp-heat-source', {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': allDistrictsList.flatMap(d => 
            // Generate more points with wider spread for "Malaysia-wide" effect
            Array.from({ length: 25 }).map(() => ({
              'type': 'Feature',
              'properties': { 'temp': 31 + (Math.random() * 5) },
              'geometry': {
                'type': 'Point',
                'coordinates': [d.lng + (Math.random() * 0.4 - 0.2), d.lat + (Math.random() * 0.4 - 0.2)]
              }
            }))
          )
        }
      });

      map.addLayer({
        'id': 'temp-heat-layer',
        'type': 'heatmap',
        'source': 'temp-heat-source',
        'layout': { 'visibility': 'none' },
        'paint': {
          'heatmap-weight': ['get', 'temp'],
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0, 0, 255, 0)',
            0.2, 'rgba(0, 150, 255, 0.4)',
            0.5, 'rgba(255, 184, 0, 0.6)',
            0.8, 'rgba(255, 60, 60, 0.8)'
          ],
          'heatmap-radius': 180, // Even larger for nationwide blending
          'heatmap-opacity': 0.45
        }
      });

      // AQI HEATMAP (NATIONWIDE COVERAGE)
      map.addSource('aqi-heat-source', {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': allDistrictsList.flatMap(d => 
            Array.from({ length: 25 }).map(() => ({
              'type': 'Feature',
              'properties': { 'aqi': 50 + (Math.random() * 120) },
              'geometry': {
                'type': 'Point',
                'coordinates': [d.lng + (Math.random() * 0.5 - 0.25), d.lat + (Math.random() * 0.5 - 0.25)]
              }
            }))
          )
        }
      });

      map.addLayer({
        'id': 'aqi-heat-layer',
        'type': 'heatmap',
        'source': 'aqi-heat-source',
        'layout': { 'visibility': 'none' },
        'paint': {
          'heatmap-weight': ['get', 'aqi'],
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0, 255, 130, 0)',
            0.3, 'rgba(0, 255, 130, 0.4)',
            0.6, 'rgba(255, 184, 0, 0.6)',
            0.9, 'rgba(255, 60, 60, 0.8)'
          ],
          'heatmap-radius': 220, // Maximum radius for nationwide atmospheric blanket
          'heatmap-opacity': 0.4
        }
      });

      // District Beacon
      map.addSource('beacon-source', {
        'type': 'geojson',
        'data': { 'type': 'Feature', 'geometry': { 'type': 'Point', 'coordinates': [data.lng, data.lat] } }
      });

      map.addLayer({
        'id': 'beacon-glow',
        'type': 'circle',
        'source': 'beacon-source',
        'paint': { 'circle-radius': 15, 'circle-color': '#00f0ff', 'circle-blur': 1, 'circle-opacity': 0.8 }
      });

      map.addLayer({
        'id': 'beacon-core',
        'type': 'circle',
        'source': 'beacon-source',
        'paint': { 'circle-radius': 6, 'circle-color': '#fff', 'circle-opacity': 1 }
      });

      // 3D Buildings - Force find source
      const style = map.getStyle();
      const buildingSourceId = Object.keys(style.sources).find(s => s === 'openmaptiles' || s === 'building' || s === 'osm_buildings' || s === 'openfreemap') || 'openmaptiles';
      
      // Hide default flat buildings
      if (map.getLayer('building')) {
        map.setLayoutProperty('building', 'visibility', 'none');
      }

      if (!map.getLayer('3d-buildings')) {
        map.addLayer({
          'id': '3d-buildings',
          'source': buildingSourceId,
          'source-layer': 'building',
          'type': 'fill-extrusion',
          'minzoom': 13,
          'filter': [
            'all',
            ['any', 
              ['>', ['to-number', ['coalesce', ['get', 'render_height'], ['get', 'height'], 0]], 2],
              ['==', ['coalesce', ['get', 'building'], ''], 'yes']
            ],
            ['!', ['in', ['coalesce', ['get', 'building'], ''], ['literal', ['roof', 'carport', 'shed', 'kiosk', 'grandstand', 'garage', 'service', 'tent', 'container']]]]
          ],
          'paint': {
            'fill-extrusion-color': [
              'interpolate', ['linear'], ['to-number', ['coalesce', ['get', 'render_height'], ['get', 'height'], 10]],
              0, '#bbb',
              50, '#999',
              100, '#777'
            ],
            'fill-extrusion-height': ['to-number', ['coalesce', ['get', 'render_height'], ['get', 'height'], 10]],
            'fill-extrusion-base': ['to-number', ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0]],
            'fill-extrusion-opacity': buildingOpacity,
            'fill-extrusion-vertical-gradient': true
          }
        });

        // Building Info Popup
        map.on('click', '3d-buildings', (e) => {
          const props = e.features[0].properties;
          new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div style="color: #000; font-family: 'JetBrains Mono'; font-size: 10px; padding: 10px; min-width: 150px;">
                <strong style="color: #007bff">STRUCTURE_ID: ${e.features[0].id || 'OSM_' + Math.floor(Math.random()*1000)}</strong><br/>
                TYPE: ${props.building?.toUpperCase() || 'URBAN_BLOCK'}<br/>
                EST_HEIGHT: ${props.render_height || props.height || '10'}m<br/>
                <div style="margin-top: 5px; border-top: 1px solid #eee; padding-top: 5px;">
                  AQI_EXPOSURE: <span style="color: #ff3e3e">ELEVATED</span>
                </div>
              </div>
            `)
            .addTo(map);
        });

        map.on('mouseenter', '3d-buildings', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', '3d-buildings', () => { map.getCanvas().style.cursor = ''; });
      }

      setMapLoaded(true);
    });

    return () => map.remove();
  }, []);

  // Periodic Data & Layer Sync (Heatmaps, Beacons, Opacity)
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;
    
    // Update Nationwide Heatmaps with new data points
    const allDistrictsList = (allDistricts || [data]).filter(d => d && typeof d.lng === 'number' && typeof d.lat === 'number');
    
    const tempSource = map.getSource('temp-heat-source');
    if (tempSource) {
      tempSource.setData({
        'type': 'FeatureCollection',
        'features': allDistrictsList.flatMap(d => 
          Array.from({ length: 25 }).map(() => ({
            'type': 'Feature',
            'properties': { 'temp': d.temp || 31 },
            'geometry': {
              'type': 'Point',
              'coordinates': [d.lng + (Math.random() * 0.4 - 0.2), d.lat + (Math.random() * 0.4 - 0.2)]
            }
          }))
        )
      });
    }

    const aqiSource = map.getSource('aqi-heat-source');
    if (aqiSource) {
      aqiSource.setData({
        'type': 'FeatureCollection',
        'features': allDistrictsList.flatMap(d => 
          Array.from({ length: 25 }).map(() => ({
            'type': 'Feature',
            'properties': { 'aqi': d.aqi || 50 },
            'geometry': {
              'type': 'Point',
              'coordinates': [d.lng + (Math.random() * 0.5 - 0.25), d.lat + (Math.random() * 0.5 - 0.25)]
            }
          }))
        )
      });
    }

    // Update Local Beacon
    const bSource = map.getSource('beacon-source');
    if (bSource) {
      bSource.setData({ 'type': 'Feature', 'geometry': { 'type': 'Point', 'coordinates': [data.lng, data.lat] } });
    }

    // Sync Layer Visibilities
    if (map.getLayer('3d-buildings')) map.setPaintProperty('3d-buildings', 'fill-extrusion-opacity', buildingOpacity);
    if (map.getLayer('temp-heat-layer')) map.setLayoutProperty('temp-heat-layer', 'visibility', showTempHeatmap ? 'visible' : 'none');
    if (map.getLayer('aqi-heat-layer')) map.setLayoutProperty('aqi-heat-layer', 'visibility', showAQIHeatmap ? 'visible' : 'none');
    if (map.getLayer('beacon-glow')) {
      map.setLayoutProperty('beacon-glow', 'visibility', showBeacon ? 'visible' : 'none');
      map.setLayoutProperty('beacon-core', 'visibility', showBeacon ? 'visible' : 'none');
    }
  }, [allDistricts, data, buildingOpacity, showTempHeatmap, showAQIHeatmap, showBeacon, mapLoaded]);

  const canvasRef = useRef(null);

  // Animation Loop
  useEffect(() => {
    if (!mapLoaded || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const industrialSources = [
      // High-Impact Industrial Anchors (Always active)
      { id: 'klang', lat: 3.0449, lng: 101.4456, label: 'Klang Port' },
      { id: 'shahalam', lat: 3.0738, lng: 101.5183, label: 'Hicom' },
      { id: 'perai', lat: 5.3850, lng: 100.3800, label: 'Perai Industrial' },
      { id: 'pasirgudang', lat: 1.4700, lng: 103.9000, label: 'Pasir Gudang' },
      { id: 'gebeng', lat: 3.9744, lng: 103.3931, label: 'Gebeng Petro' },
      { id: 'kerteh', lat: 4.5123, lng: 103.4422, label: 'Kerteh Refinery' },
      { id: 'bintulu', lat: 3.250, lng: 113.080, label: 'Bintulu MLNG' },
      { id: 'samalaju', lat: 3.550, lng: 113.350, label: 'Samalaju Steel' }
    ];

    const render = () => {
      if (!mapRef.current) return;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const windDirRad = (data.metrics.temp.windDir * Math.PI) / 180;
      const windSpeed = parseFloat(data.metrics.temp.wind) || 5;
      
      // 1. ANIMATED WIND ARROWS (NATIONWIDE)
      windOffsetRef.current += windSpeed * 0.1;
      const gridSize = 120;
      ctx.strokeStyle = 'rgba(0, 100, 255, 0.3)';
      ctx.lineWidth = 1;

      for (let x = -gridSize; x < canvas.width + gridSize; x += gridSize) {
        for (let y = -gridSize; y < canvas.height + gridSize; y += gridSize) {
          const sX = (Math.sin(windDirRad) * windOffsetRef.current) % gridSize;
          const sY = (-Math.cos(windDirRad) * windOffsetRef.current) % gridSize;
          ctx.save();
          ctx.translate(x + sX + gridSize/2, y + sY + gridSize/2);
          ctx.rotate(windDirRad);
          ctx.beginPath();
          ctx.moveTo(0, -10); ctx.lineTo(0, 10);
          ctx.moveTo(-3, 5); ctx.lineTo(0, 10); ctx.lineTo(3, 5);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 2. POLLUTION PLUMES (HIGH-VISIBILITY NATIONWIDE FLOW)
      if (pListRef.current.length < 2000) {
        const activeEmitters = [
          ...industrialSources,
          ...(allDistricts || [])
            .filter(d => d.aqi > 50)
            .map(d => ({ lat: d.lat, lng: d.lng, strength: (d.aqi - 50) / 100 }))
        ];

        activeEmitters.forEach(s => {
          const pos = mapRef.current.project([s.lng, s.lat]);
          if (pos.x > -400 && pos.x < canvas.width + 400 && pos.y > -400 && pos.y < canvas.height + 400) {
            // Increased spawn chance for "heavy" look
            const spawnChance = s.strength ? Math.min(s.strength * 0.8, 0.6) : 0.2;
            if (Math.random() < spawnChance) {
              pListRef.current.push({
                x: pos.x, y: pos.y, life: 1.0,
                vx: Math.sin(windDirRad) * (windSpeed * 0.35),
                vy: -Math.cos(windDirRad) * (windSpeed * 0.35),
                jitter: Math.random() * 2.5 - 1.25,
                size: 6 + (s.strength ? s.strength * 15 : 8) // Larger, more impactful sources
              });
            }
          }
        });
      }

      pListRef.current = pListRef.current.filter(p => p.life > 0);
      pListRef.current.forEach(p => {
        p.life -= 0.0025;
        p.x += p.vx + Math.cos(windDirRad) * p.jitter * (1-p.life) * 2;
        p.y += p.vy + Math.sin(windDirRad) * p.jitter * (1-p.life) * 2;
        
        // High visibility alpha (0.7) and vibrant orange/red tones
        const alpha = p.life * 0.7; 
        const currentSize = p.size * (1 + (1-p.life) * 5);
        
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize);
        // Vibrant, high-impact core
        const r = 255;
        const g = 80 + (100 * (1-p.life));
        const b = 20 * (1-p.life);
        
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
        grad.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${alpha * 0.6})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [mapLoaded, data.metrics.temp.wind, data.metrics.temp.windDir, allDistricts]);

  // Handle map flight on focus change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    mapRef.current.flyTo({ center: [data.lng, data.lat], zoom: 15, duration: 1500 });
  }, [data.id, mapLoaded]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#f0f0f0' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }} />

      <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 20 }}>
        <div style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #ddd', padding: '15px', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', color: '#000' }}>
          <div style={{ fontSize: '0.6rem', color: '#888', fontWeight: 800, marginBottom: '10px', letterSpacing: '1px' }}>SIMULATION_ENGINE_v4.2</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700 }}>
              <input type="checkbox" checked={showTempHeatmap} onChange={e => setShowTempHeatmap(e.target.checked)} />
              HEAT_ISLAND_LAYER
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700 }}>
              <input type="checkbox" checked={showAQIHeatmap} onChange={e => setShowAQIHeatmap(e.target.checked)} />
              AQI_CONCENTRATION_LAYER
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700 }}>
              <input type="checkbox" checked={showBeacon} onChange={e => setShowBeacon(e.target.checked)} />
              DISTRICT_BEACON
            </label>
            <div style={{ height: '1px', background: '#eee' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '0.5rem', color: '#999' }}>GHOST_MODE (OPACITY)</span>
              <input type="range" min="0" max="1" step="0.1" value={buildingOpacity} onChange={e => setBuildingOpacity(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(255,255,255,0.95)', border: '1px solid #ddd', padding: '15px', color: '#000', fontFamily: 'JetBrains Mono', pointerEvents: 'none', zIndex: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '0.6rem', color: '#007bff', marginBottom: '5px', fontWeight: 800 }}>LIVE_SIMULATION_SYNC</div>
        <div style={{ fontSize: '0.85rem', fontWeight: 900 }}>{data.name.toUpperCase()} Digital Twin</div>
        <div style={{ marginTop: '10px', display: 'flex', gap: '30px' }}>
          <div>
            <div style={{ fontSize: '0.5rem', color: '#888' }}>WIND_VECTOR</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>{data.metrics.temp.windDir}° @ {data.metrics.temp.wind}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.5rem', color: '#888' }}>MODEL</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ff5500' }}>GAUSSIAN_PLUME</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default City3DView;
