import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue with Webpack/React in some setups
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const LocationMap = ({ locations, onSelectLocation, activeLocationId }) => {
  if (!locations) {
    return <p>Loading map data...</p>;
  }
  
  if (locations.length === 0) {
    return <p>No locations to display on the map.</p>;
  }
  
  const defaultPosition = [20, 0]; 
  const initialZoom = 1;

  return (
    <MapContainer 
      center={defaultPosition} 
      zoom={initialZoom} 
      style={{ height: '400px', width: '100%', marginTop: '10px', marginBottom: '10px' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location) => {
        const markerRef = React.createRef(); // Create a ref for each marker

        const lat = parseFloat(location.latitude);
        const lon = parseFloat(location.longitude);

        if (isNaN(lat) || isNaN(lon)) {
          console.warn(`Invalid coordinates for location: ${location.name}`, location);
          return null; // Skip rendering this marker
        }

        return (
          <Marker
            key={location.id}
            position={[lat, lon]}
            ref={markerRef}
          >
            <Popup>
              {location.name}
              <br />
              <button 
                onClick={(e) => { 
                  e.stopPropagation();
                  onSelectLocation(location.id.toString());
                  if (markerRef.current) {
                    markerRef.current.closePopup();
                  }
                }} 
                style={{ marginTop: '5px', cursor: 'pointer' }}
              >
                Select this location
              </button>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default LocationMap;