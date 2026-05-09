import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom high-tech marker icon with pulse animation based on severity
const createTerminalIcon = (type, severity = 'normal') => {
  const colors = {
    'Urban core': '#ff3e3e',
    'Industrial': '#ffb400',
    'Suburban': '#ffd700',
    'Planned city': '#00ff82',
    'Affluent residential': '#00f0ff',
    'Transport hub': '#b19cd9'
  };
  const color = colors[type] || '#00f0ff';
  
  return L.divIcon({
    className: 'terminal-marker',
    html: `
      <div class="marker-pulse" style="width: 10px; height: 10px; background: ${color}; border-radius: 50%; box-shadow: 0 0 15px ${color};">
        <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [35, 35],
    iconAnchor: [17, 17]
  });
};

// Simplified polygon generator for mock districts
const getMockPolygon = (lat, lng) => {
  const offset = 0.015;
  return [
    [lat + offset, lng - offset],
    [lat + offset, lng + offset],
    [lat - offset, lng + offset],
    [lat - offset, lng - offset]
  ];
};

// Helper to change map view
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom]);
  return null;
};

const MapHero = ({ onSelectDistrict, selectedId, userCoords }) => {
  const [districts, setDistricts] = useState([]);
  const [showPolygons, setShowPolygons] = useState(true);
  const [mapCenter, setMapCenter] = useState([3.139, 101.6869]);
  const [mapZoom, setMapZoom] = useState(12);

  useEffect(() => {
    fetch('http://localhost:3001/api/districts')
      .then(res => res.json())
      .then(data => {
        setDistricts(data);
        const selected = data.find(d => d.id === selectedId);
        if (selected) {
          setMapCenter([selected.lat, selected.lng]);
          setMapZoom(13);
        }
      });
  }, [selectedId]);

  const getDistrictColor = (type) => {
    const colors = {
      'Urban core': '#ff3e3e',
      'Industrial': '#ffb400',
      'Suburban': '#ffd700',
      'Planned city': '#00ff82',
      'Affluent residential': '#00f0ff',
      'Transport hub': '#b19cd9',
      'Tourist hub': '#00ff82'
    };
    return colors[type] || '#00f0ff';
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ width: '100%', height: '100%', background: '#f5f5f5' }}
      >
        <ChangeView center={mapCenter} zoom={mapZoom} />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        {districts.map(district => (
          <React.Fragment key={district.id}>
            {showPolygons && (
              <Polygon 
                positions={getMockPolygon(district.lat, district.lng)}
                pathOptions={{ 
                  color: getDistrictColor(district.type), 
                  fillColor: getDistrictColor(district.type),
                  fillOpacity: district.id === selectedId ? 0.3 : 0.1,
                  weight: district.id === selectedId ? 2 : 1
                }}
                eventHandlers={{
                  click: () => onSelectDistrict(district.id)
                }}
              />
            )}
            
            <Marker 
              position={[district.lat, district.lng]}
              icon={createTerminalIcon(district.type)}
              eventHandlers={{
                click: () => onSelectDistrict(district.id),
              }}
            >
              <Popup>
                <div style={{ color: '#000', fontSize: '0.75rem', fontFamily: 'JetBrains Mono' }}>
                  <strong style={{ color: getDistrictColor(district.type) }}>{district.name}</strong><br />
                  TYPE: {district.type.toUpperCase()}<br />
                  <button 
                    onClick={() => onSelectDistrict(district.id)}
                    style={{ 
                      marginTop: '10px', 
                      background: '#000', 
                      color: '#fff', 
                      border: 'none', 
                      padding: '5px 10px', 
                      cursor: 'pointer', 
                      width: '100%',
                      fontSize: '0.6rem',
                      fontWeight: 800
                    }}
                  >
                    SELECT_STATION
                  </button>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}

        {userCoords && (
          <Marker 
            position={[userCoords.lat, userCoords.lng]}
            icon={L.divIcon({
              className: 'user-marker',
              html: `
                <div class="marker-pulse" style="width: 12px; height: 12px; background: #fff; border-radius: 50%; box-shadow: 0 0 15px #fff;">
                  <div style="width: 6px; height: 6px; background: #007bff; border-radius: 50%;"></div>
                </div>
              `,
              iconSize: [40, 40],
              iconAnchor: [20, 20]
            })}
          >
            <Popup>
              <div style={{ color: '#000', fontSize: '0.7rem', fontWeight: 800 }}>YOU_ARE_HERE</div>
            </Popup>
          </Marker>
        )}

        {/* Animated Polylines (Data Flow simulation) */}
        {districts.filter(d => d.id !== 'klcc').map(d => (
          <Circle 
            key={`flow-${d.id}`}
            center={[d.lat + (mapCenter[0] - d.lat) * 0.5, d.lng + (mapCenter[1] - d.lng) * 0.5]}
            radius={100}
            pathOptions={{ color: '#00f0ff', fillOpacity: 0.5 }}
          />
        ))}
      </MapContainer>

      {/* Floating UI Overlays */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1000, width: '250px' }}>
        <input 
          type="text" 
          placeholder="SEARCH_DISTRICT..." 
          style={{ 
            width: '100%', 
            background: 'rgba(10, 10, 10, 0.8)', 
            border: '1px solid rgba(0, 240, 255, 0.3)', 
            color: '#fff', 
            padding: '10px 15px',
            fontSize: '0.7rem',
            fontFamily: 'JetBrains Mono',
            outline: 'none',
            backdropFilter: 'blur(5px)'
          }}
        />
      </div>

      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button 
          onClick={() => setShowPolygons(!showPolygons)}
          style={{ 
            background: showPolygons ? 'rgba(0, 240, 255, 0.2)' : 'rgba(10, 10, 10, 0.8)', 
            border: '1px solid rgba(0, 240, 255, 0.3)',
            color: '#fff',
            padding: '8px 12px',
            fontSize: '0.6rem',
            fontWeight: 800,
            cursor: 'pointer',
            backdropFilter: 'blur(5px)'
          }}
        >
          {showPolygons ? 'HIDE_ZONES' : 'SHOW_ZONES'}
        </button>
      </div>

      {/* Legend */}
      <div style={{ 
        position: 'absolute', 
        bottom: '20px', 
        left: '20px', 
        zIndex: 1000, 
        background: 'rgba(10, 10, 10, 0.8)', 
        border: '1px solid rgba(255,255,255,0.1)', 
        padding: '15px',
        fontSize: '0.6rem',
        backdropFilter: 'blur(5px)'
      }}>
        <div style={{ fontWeight: 800, marginBottom: '10px', letterSpacing: '1px' }}>SEVERITY_INDEX</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 8, height: 8, background: '#ff3e3e', borderRadius: '50%' }}></div>
            <span>URBAN_CORE (HIGH)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 8, height: 8, background: '#ffb400', borderRadius: '50%' }}></div>
            <span>INDUSTRIAL (MOD)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 8, height: 8, background: '#00ff82', borderRadius: '50%' }}></div>
            <span>PLANNED_CITY (LOW)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapHero;
