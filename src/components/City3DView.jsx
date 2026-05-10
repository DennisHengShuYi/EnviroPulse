import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const City3DView = ({ data, allDistricts, onSelectDistrict, userCoords, homeDistrictId }) => {
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
  const heatmapFeaturesRef = useRef({ temp: [], aqi: [] });

  // Initialize MapLibre
  useEffect(() => {
    const center = [parseFloat(data.lng), parseFloat(data.lat)];

    console.log(`[City3DView] Initializing Map at: ${center[0]}, ${center[1]} (${data.name})`);
    
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/positron',
      center: center,
      zoom: 15,
      pitch: 60,
      bearing: -17.6,
      antialias: true
    });

    mapRef.current = map;

    map.on('load', () => {
      const allDistrictsList = (allDistricts || [data]).filter(d => d && typeof d.lng === 'number' && typeof d.lat === 'number');
      
      // TEMPERATURE HEATMAP (HEAT ISLAND EFFECT)
      map.addSource('temp-heat-source', {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': allDistrictsList.flatMap(d => 
            Array.from({ length: 25 }).map(() => ({
              'type': 'Feature',
              'properties': { 'temp': d.temp ?? 31 },
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
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'temp'], 25, 0, 40, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0, 100, 255, 0)',
            0.1, 'rgba(0, 150, 255, 0.1)',
            0.3, 'rgba(0, 255, 130, 0.3)',
            0.5, 'rgba(255, 184, 0, 0.5)',
            0.7, 'rgba(255, 120, 0, 0.7)',
            0.9, 'rgba(255, 60, 60, 0.8)'
          ],
          'heatmap-radius': [
            'interpolate', ['linear'], ['zoom'],
            0, 2,
            5, 15,
            10, 80,
            15, 300
          ],
          'heatmap-opacity': 0.55
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
              'properties': { 'aqi': d.aqi ?? 50 },
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
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'aqi'], 0, 0, 200, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0, 255, 130, 0)',
            0.2, 'rgba(0, 255, 130, 0.3)',
            0.4, 'rgba(255, 184, 0, 0.5)',
            0.6, 'rgba(255, 120, 0, 0.7)',
            0.8, 'rgba(255, 60, 60, 0.8)',
            1.0, 'rgba(128, 0, 128, 0.9)'
          ],
          'heatmap-radius': [
            'interpolate', ['linear'], ['zoom'],
            0, 2,
            5, 15,
            10, 80,
            15, 300
          ],
          'heatmap-opacity': 0.5
        }
      });

      // District Beacon Pinhead
      const smartCoords = [parseFloat(data.lng), parseFloat(data.lat)];

      map.addSource('beacon-source', {
        'type': 'geojson',
        'data': { 
          'type': 'Feature', 
          'properties': { 'name': data.name, 'aqi': data.aqi },
          'geometry': { 'type': 'Point', 'coordinates': smartCoords } 
        }
      });

      map.addLayer({
        'id': 'beacon-glow',
        'type': 'circle',
        'source': 'beacon-source',
        'paint': { 
          'circle-radius': 18, 
          'circle-color': '#00f0ff', 
          'circle-opacity': 0.4,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#00f0ff'
        }
      });

      map.addLayer({
        'id': 'beacon-core',
        'type': 'circle',
        'source': 'beacon-source',
        'paint': { 
          'circle-radius': 6, 
          'circle-color': '#fff', 
          'circle-stroke-width': 3,
          'circle-stroke-color': '#00f0ff'
        }
      });

      // User Location Marker
      map.addSource('user-location-source', {
        'type': 'geojson',
        'data': { 
          'type': 'Feature', 
          'geometry': { 
            'type': 'Point', 
            'coordinates': userCoords ? [userCoords.lng, userCoords.lat] : [0, 0] 
          } 
        }
      });

      map.addLayer({
        'id': 'user-location-glow',
        'type': 'circle',
        'source': 'user-location-source',
        'layout': { 'visibility': userCoords ? 'visible' : 'none' },
        'paint': {
          'circle-radius': 12,
          'circle-color': '#fff',
          'circle-opacity': 0.3,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      map.addLayer({
        'id': 'user-location-core',
        'type': 'circle',
        'source': 'user-location-source',
        'layout': { 'visibility': userCoords ? 'visible' : 'none' },
        'paint': {
          'circle-radius': 5,
          'circle-color': '#007bff',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      map.addLayer({
        'id': 'user-location-label',
        'type': 'symbol',
        'source': 'user-location-source',
        'layout': {
          'visibility': userCoords ? 'visible' : 'none',
          'text-field': 'YOU_ARE_HERE',
          'text-font': ['Noto Sans Bold'],
          'text-size': 10,
          'text-offset': [0, -2],
          'text-anchor': 'bottom'
        },
        'paint': {
          'text-color': '#000',
          'text-halo-color': '#fff',
          'text-halo-width': 2
        }
      });

      // Pinhead Label (Restored)
      map.addLayer({
        'id': 'district-label',
        'type': 'symbol',
        'source': 'beacon-source',
        'layout': {
          'text-field': ['concat', ['get', 'name'], '\nAQI: ', ['get', 'aqi']],
          'text-size': 12,
          'text-offset': [0, -2],
          'text-anchor': 'bottom',
          'text-font': ['Noto Sans Bold']
        },
        'paint': {
          'text-color': '#fff',
          'text-halo-color': '#000',
          'text-halo-width': 2
        }
      });
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
    
    const allDistrictsList = (allDistricts || [data]).filter(d => d && typeof d.lng === 'number' && typeof d.lat === 'number');
    
    // 1. STABILIZED HEATMAP GENERATION
    // If features don't exist, generate them once to lock their positions
    if (heatmapFeaturesRef.current.temp.length === 0 || heatmapFeaturesRef.current.temp.length !== allDistrictsList.length * 25) {
      heatmapFeaturesRef.current.temp = allDistrictsList.flatMap(d => 
        Array.from({ length: 25 }).map(() => ({
          'type': 'Feature',
          'properties': { 'temp': d.temp || 31, 'districtId': d.id },
          'geometry': {
            'type': 'Point',
            'coordinates': [d.lng + (Math.random() * 0.4 - 0.2), d.lat + (Math.random() * 0.4 - 0.2)]
          }
        }))
      );
      heatmapFeaturesRef.current.aqi = allDistrictsList.flatMap(d => 
        Array.from({ length: 25 }).map(() => ({
          'type': 'Feature',
          'properties': { 'aqi': d.aqi || 50, 'districtId': d.id },
          'geometry': {
            'type': 'Point',
            'coordinates': [d.lng + (Math.random() * 0.5 - 0.25), d.lat + (Math.random() * 0.5 - 0.25)]
          }
        }))
      );
    } else {
      // Positions are locked, just update the live values (properties)
      heatmapFeaturesRef.current.temp.forEach(f => {
        const dist = allDistrictsList.find(d => d.id === f.properties.districtId);
        if (dist) f.properties.temp = dist.temp || 31;
      });
      heatmapFeaturesRef.current.aqi.forEach(f => {
        const dist = allDistrictsList.find(d => d.id === f.properties.districtId);
        if (dist) f.properties.aqi = dist.aqi || 50;
      });
    }

    const tempSource = map.getSource('temp-heat-source');
    if (tempSource) {
      tempSource.setData({
        'type': 'FeatureCollection',
        'features': heatmapFeaturesRef.current.temp
      });
    }

    const aqiSource = map.getSource('aqi-heat-source');
    if (aqiSource) {
      aqiSource.setData({
        'type': 'FeatureCollection',
        'features': heatmapFeaturesRef.current.aqi
      });
    }

    // Smooth FlyTo Transition when district changes
    if (map && data) {
      const targetCenter = [parseFloat(data.lng), parseFloat(data.lat)];

      map.flyTo({
        center: targetCenter,
        zoom: 15.5,
        pitch: 65,
        bearing: -17.6,
        essential: true,
        duration: 3500 // Smooth 3.5s cinematic flight
      });
    }

    // Update Local Beacon & Pinhead
    const bSource = map.getSource('beacon-source');
    if (bSource) {
      const smartCoords = [parseFloat(data.lng), parseFloat(data.lat)];

      bSource.setData({ 
        'type': 'Feature', 
        'properties': { 'name': data.name, 'aqi': data.aqi },
        'geometry': { 'type': 'Point', 'coordinates': smartCoords } 
      });
    }

    // Update User Location
    const uSource = map.getSource('user-location-source');
    if (uSource && userCoords) {
      uSource.setData({
        'type': 'Feature',
        'geometry': { 'type': 'Point', 'coordinates': [userCoords.lng, userCoords.lat] }
      });
      map.setLayoutProperty('user-location-glow', 'visibility', 'visible');
      map.setLayoutProperty('user-location-core', 'visibility', 'visible');
      map.setLayoutProperty('user-location-label', 'visibility', 'visible');
    }

    // Sync Layer Visibilities
    if (map.getLayer('3d-buildings')) map.setPaintProperty('3d-buildings', 'fill-extrusion-opacity', buildingOpacity);
    if (map.getLayer('temp-heat-layer')) map.setLayoutProperty('temp-heat-layer', 'visibility', showTempHeatmap ? 'visible' : 'none');
    if (map.getLayer('aqi-heat-layer')) map.setLayoutProperty('aqi-heat-layer', 'visibility', showAQIHeatmap ? 'visible' : 'none');
    if (map.getLayer('beacon-glow')) {
      const vis = showBeacon ? 'visible' : 'none';
      map.setLayoutProperty('beacon-glow', 'visibility', vis);
      map.setLayoutProperty('beacon-core', 'visibility', vis);
      if (map.getLayer('district-label')) map.setLayoutProperty('district-label', 'visibility', vis);
    }
  }, [allDistricts, data, buildingOpacity, showTempHeatmap, showAQIHeatmap, showBeacon, mapLoaded, userCoords]);

  const canvasRef = useRef(null);

  // Animation Loop
  useEffect(() => {
    if (!mapLoaded || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

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

      // 2. POLLUTION PLUMES (DRIVEN BY LIVE DISTRICT DATA)
      if (pListRef.current.length < 2000) {
        const activeEmitters = (allDistricts || [])
          .filter(d => d.aqi > 50)
          .map(d => ({ lat: d.lat, lng: d.lng, strength: (d.aqi - 50) / 100 }));

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
    
    const target = [parseFloat(data.lng), parseFloat(data.lat)];
    
    console.log(`[City3DView] Standard Flight to: ${target[0]}, ${target[1]} (${data.name})`);
    mapRef.current.flyTo({ 
      center: target, 
      zoom: 15, 
      duration: 2000, 
      pitch: 50 
    });
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
