import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// Custom high-tech marker icon with pulse animation
const createTerminalIcon = () => L.divIcon({
  className: 'terminal-marker',
  html: `
    <div class="marker-pulse"></div>
    <div style="
      width: 12px;
      height: 12px;
      background: #00f0ff;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 0 15px #00f0ff;
      position: relative;
      z-index: 2;
    "></div>
    <style>
      .marker-pulse {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 12px;
        height: 12px;
        background: rgba(0, 240, 255, 0.5);
        border-radius: 50%;
        animation: marker-pulse 2s infinite;
        z-index: 1;
      }
      @keyframes marker-pulse {
        0% { width: 12px; height: 12px; opacity: 1; }
        100% { width: 40px; height: 40px; opacity: 0; }
      }
    </style>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

const Map2DVisualization = ({ onSelectDistrict }) => {
  const [districts, setDistricts] = React.useState([]);
  const center = [3.139, 101.6869]; // Kuala Lumpur

  React.useEffect(() => {
    fetch('/api/districts')
      .then(res => res.json())
      .then(data => setDistricts(data))
      .catch(err => console.error('Districts fetch failed', err));
  }, []);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative',
      border: '1px solid rgba(0, 240, 255, 0.1)',
      overflow: 'hidden'
    }}>
      <MapContainer 
        center={center} 
        zoom={11} 
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', background: '#050505' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {districts.map(district => (
          <Marker 
            key={district.id} 
            position={[district.lat, district.lng]}
            icon={createTerminalIcon()}
            eventHandlers={{
              click: () => onSelectDistrict(district.id),
            }}
          >
            <Popup>
              <div style={{ color: '#000', fontSize: '0.8rem' }}>
                <strong>{district.name}</strong><br />
                Type: {district.type}<br />
                <button 
                  onClick={() => onSelectDistrict(district.id)}
                  style={{ marginTop: '5px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: 'none', padding: '2px 5px', cursor: 'pointer', fontSize: '0.6rem' }}
                >
                  VIEW DATA
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* High-tech Overlay */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'rgba(5, 5, 5, 0.8)',
        padding: '5px 10px',
        border: '1px solid var(--accent-cyan)',
        fontSize: '0.6rem',
        color: 'var(--accent-cyan)',
        pointerEvents: 'none'
      }}>
        [ GEOSPATIAL_GRID_ACTIVE ]
      </div>

      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        zIndex: 1000,
        fontSize: '0.5rem',
        color: 'rgba(0, 240, 255, 0.5)',
        pointerEvents: 'none'
      }}>
        LAT: 3.139 | LON: 101.686
      </div>
      
    </div>
  );
};

export default Map2DVisualization;

