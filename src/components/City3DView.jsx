import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const City3DView = ({ data, onSelectDistrict }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [buildingOpacity, setBuildingOpacity] = useState(0.8);
  const [showBeacon, setShowBeacon] = useState(true);

  // Initialize MapLibre
  useEffect(() => {
    // No access token needed for MapLibre
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      // Using OpenFreeMap style which includes 3D building data
      style: 'https://tiles.openfreemap.org/styles/dark',
      center: [data.lng, data.lat],
      zoom: 16,
      pitch: 60,
      bearing: -17.6,
      antialias: true
    });

    mapRef.current = map;

    map.on('load', () => {
      // Add a sky layer for more realism
      map.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 0.0],
          'sky-atmosphere-sun-intensity': 15
        }
      });

      // Add a Heatmap Layer for Temperature
      map.addSource('heat-source', {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': Array.from({ length: 20 }).map(() => ({
            'type': 'Feature',
            'properties': { 'temp': parseFloat(data.metrics.temp.value) + (Math.random() * 2 - 1) },
            'geometry': {
              'type': 'Point',
              'coordinates': [data.lng + (Math.random() * 0.01 - 0.005), data.lat + (Math.random() * 0.01 - 0.005)]
            }
          }))
        }
      });

      map.addLayer({
        'id': 'heat-layer',
        'type': 'heatmap',
        'source': 'heat-source',
        'maxzoom': 18,
        'paint': {
          'heatmap-weight': ['get', 'temp'],
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, 'rgba(0, 240, 255, 0.2)',
            0.4, 'rgba(0, 255, 130, 0.4)',
            0.6, 'rgba(255, 184, 0, 0.6)',
            0.8, 'rgba(255, 77, 77, 0.8)'
          ],
          'heatmap-radius': 40,
          'heatmap-opacity': 0.6
        }
      }, 'sky');

      // Add Pollution Plume (Circular gradient)
      map.addSource('plume-source', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': [data.lng, data.lat]
          }
        }
      });

      map.addLayer({
        'id': 'plume-layer',
        'type': 'circle',
        'source': 'plume-source',
        'paint': {
          'circle-radius': 200,
          'circle-color': getAQIColor(data.metrics.aqi.value),
          'circle-opacity': 0.2,
          'circle-blur': 1
        }
      });

      // Add Cyber-Beacon (Vertical Marker)
      map.addSource('beacon-source', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': { 'type': 'Point', 'coordinates': [data.lng, data.lat] }
        }
      });

      map.addLayer({
        'id': 'beacon-glow',
        'type': 'circle',
        'source': 'beacon-source',
        'paint': {
          'circle-radius': 10,
          'circle-color': '#00f0ff',
          'circle-blur': 1,
          'circle-opacity': 0.8
        }
      });

      map.addLayer({
        'id': 'beacon-core',
        'type': 'circle',
        'source': 'beacon-source',
        'paint': {
          'circle-radius': 4,
          'circle-color': '#fff',
          'circle-opacity': 1
        }
      });

      // Beacon laser line (Vertical)
      // Since MapLibre doesn't have a 3D line easily, we use a symbol with a long vertical stretch or just markers
      // Here we'll use a high-visibility pulse effect

      // Force 3D Buildings with dynamic opacity
      const sources = map.getStyle().sources;
      const buildingSource = Object.keys(sources).find(s => s.includes('maptiles') || s === 'building' || s === 'openfreemap');
      
      if (!map.getLayer('3d-buildings')) {
        map.addLayer({
          'id': '3d-buildings',
          'source': buildingSource || 'openmaptiles',
          'source-layer': 'building',
          'type': 'fill-extrusion',
          'minzoom': 14,
          'paint': {
            'fill-extrusion-color': getAQIColor(data.metrics.aqi.value),
            'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 10],
            'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
            'fill-extrusion-opacity': buildingOpacity,
            'fill-extrusion-vertical-gradient': true
          }
        });
      }

      // Click building to see data
      const bId = buildingLayerId || '3d-buildings';
      map.on('click', bId, (e) => {
        const props = e.features[0].properties;
        new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="color: #000; font-family: 'JetBrains Mono'; font-size: 10px; padding: 10px;">
              <strong style="color: #00f0ff">BUILDING_DATA</strong><br/>
              NAME: ${props.name || 'OSM_STRUCTURE'}<br/>
              HEIGHT: ${props.render_height || props.height || '10'}m<br/>
              EST_AQI: ${data.metrics.aqi.value}<br/>
              THERMAL_INDEX: ${data.metrics.temp.value}°C
            </div>
          `)
          .addTo(map);
      });

      map.on('mouseenter', bId, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', bId, () => { map.getCanvas().style.cursor = ''; });

      setMapLoaded(true);
    });

    return () => map.remove();
  }, []);

  // Sync Visibility & Opacity
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    
    const map = mapRef.current;
    if (map.getLayer('3d-buildings')) {
      map.setPaintProperty('3d-buildings', 'fill-extrusion-opacity', buildingOpacity);
    }
    if (map.getLayer('beacon-glow')) {
      map.setLayoutProperty('beacon-glow', 'visibility', showBeacon ? 'visible' : 'none');
      map.setLayoutProperty('beacon-core', 'visibility', showBeacon ? 'visible' : 'none');
    }
  }, [buildingOpacity, showBeacon, mapLoaded]);

  // Update map only when district changes (not on metrics jitter)
  useEffect(() => {
    if (mapRef.current && data) {
      mapRef.current.flyTo({
        center: [data.lng, data.lat],
        essential: true,
        duration: 2000
      });

      // Update beacon position
      const beaconSource = mapRef.current.getSource('beacon-source');
      if (beaconSource) {
        beaconSource.setData({
          'type': 'Feature',
          'geometry': { 'type': 'Point', 'coordinates': [data.lng, data.lat] }
        });
      }
    }
  }, [data.id]); // Scoped to district ID only

  // Update visual layers on metrics jitter
  useEffect(() => {
    if (mapRef.current && mapLoaded && data) {
      const aqiColor = getAQIColor(data.metrics.aqi.value);
      
      if (mapRef.current.getLayer('3d-buildings')) {
        mapRef.current.setPaintProperty('3d-buildings', 'fill-extrusion-color', aqiColor);
      }

      // Update plume position
      const plumeSource = mapRef.current.getSource('plume-source');
      if (plumeSource) {
        plumeSource.setData({
          'type': 'Feature',
          'geometry': { 'type': 'Point', 'coordinates': [data.lng, data.lat] }
        });
        mapRef.current.setPaintProperty('plume-layer', 'circle-color', aqiColor);
      }
    }
  }, [data.metrics, mapLoaded]);

  const canvasRef = useRef(null);

  // Canvas Animation Loop (60FPS)
  useEffect(() => {
    if (!mapLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Fixed Sources from Blueprint
    const sources = [
      { id: 'klang', lat: 3.001, lng: 101.392, strength: 1.0 },
      { id: 'hicom', lat: 3.034, lng: 101.532, strength: 0.8 },
      { id: 'klia', lat: 2.745, lng: 101.709, strength: 0.7 }
    ];

    let particles = [];
    const maxParticles = 150;

    const render = () => {
      if (!mapRef.current) return;
      
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const windDir = (data.metrics.temp.windDir * Math.PI) / 180;
      const windSpeed = parseFloat(data.metrics.temp.wind) || 5;

      // 1. Draw Wind Arrows (Step 7)
      const gridSize = 80;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.lineWidth = 1;

      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.save();
          ctx.translate(x + gridSize / 2, y + gridSize / 2);
          ctx.rotate(windDir);
          
          // Draw arrow
          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(0, 10);
          ctx.moveTo(-3, 5);
          ctx.lineTo(0, 10);
          ctx.lineTo(3, 5);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 2. Draw Pollution Plumes (Step 8: Gaussian Spread)
      if (particles.length < maxParticles) {
        sources.forEach(s => {
          const pos = mapRef.current.project([s.lng, s.lat]);
          particles.push({
            x: pos.x,
            y: pos.y,
            ox: pos.x,
            oy: pos.y,
            life: 1,
            vx: Math.sin(windDir) * (windSpeed / 2),
            vy: -Math.cos(windDir) * (windSpeed / 2),
            spread: Math.random() * 2 - 1
          });
        });
      }

      particles = particles.filter(p => p.life > 0);
      particles.forEach(p => {
        p.life -= 0.005;
        p.x += p.vx + (p.spread * (1 - p.life) * 2);
        p.y += p.vy + (p.spread * (1 - p.life) * 2);

        const aqiColor = getAQIColor(data.metrics.aqi.value);
        ctx.fillStyle = aqiColor;
        ctx.globalAlpha = p.life * 0.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5 + (1 - p.life) * 20, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [mapLoaded, data.metrics]);

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#00ff88'; // Good
    if (aqi <= 100) return '#ffff00'; // Moderate
    if (aqi <= 150) return '#ff9900'; // Sensitive
    return '#ff0000'; // Unhealthy
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Simulation Canvas Layer */}
      <canvas 
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 5
        }}
      />

      {/* Visibility Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 20
      }}>
        <div style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid var(--accent-cyan)', padding: '10px', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--accent-cyan)', fontWeight: 800, marginBottom: '8px' }}>VISIBILITY_STATION</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.7rem' }}>
              <input type="checkbox" checked={showBeacon} onChange={e => setShowBeacon(e.target.checked)} />
              CYBER_BEACON
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.5rem', opacity: 0.7 }}>BLDG_OPACITY</span>
              <input 
                type="range" min="0" max="1" step="0.1" 
                value={buildingOpacity} 
                onChange={e => setBuildingOpacity(parseFloat(e.target.value))}
                style={{ width: '100px', cursor: 'pointer' }}
              />
            </div>
            <button 
              onClick={() => setBuildingOpacity(buildingOpacity === 0.2 ? 0.8 : 0.2)}
              style={{ background: buildingOpacity < 0.5 ? 'var(--accent-cyan)' : 'transparent', color: buildingOpacity < 0.5 ? '#000' : 'var(--accent-cyan)', border: '1px solid var(--accent-cyan)', padding: '4px', fontSize: '0.6rem', fontWeight: 800, cursor: 'pointer' }}
            >
              {buildingOpacity < 0.5 ? 'EXIT_GHOST_MODE' : 'GHOST_MODE_ON'}
            </button>
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0,0,0,0.8)',
        border: '1px solid #00f0ff',
        padding: '15px',
        color: '#fff',
        fontFamily: 'JetBrains Mono',
        pointerEvents: 'none',
        zIndex: 10
      }}>
        <div style={{ fontSize: '0.6rem', color: '#00f0ff', marginBottom: '5px' }}>LAYER_OSM_LIBRE_ACTIVE</div>
        <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>{data.name} SCAN_COMPLETE</div>
        <div style={{ marginTop: '10px', display: 'flex', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '0.5rem', opacity: 0.6 }}>WIND_DIR</div>
            <div>{data.metrics.temp.windDir}°</div>
          </div>
          <div>
            <div style={{ fontSize: '0.5rem', opacity: 0.6 }}>WIND_SPEED</div>
            <div>{data.metrics.temp.wind}</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes windFlow {
          0% { transform: rotate(${data.metrics.temp.windDir}deg) translateY(-100px); opacity: 0; }
          50% { opacity: 0.3; }
          100% { transform: rotate(${data.metrics.temp.windDir}deg) translateY(500px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default City3DView;
