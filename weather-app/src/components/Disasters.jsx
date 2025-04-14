import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function Disasters({ showNotification }) {
  const [disasters, setDisasters] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [userCoords, setUserCoords] = useState({ lat: 43.2, lon: 76.9 });

  const mockDisasters = [
    {
      properties: {
        eventType: 'EARTHQUAKE',
        description: 'Minor earthquake in Almaty',
        severity: 'Moderate',
        updated: new Date().toISOString(),
      },
      geometry: { coordinates: [76.9, 43.2] },
    },
    {
      properties: {
        eventType: 'FLOOD',
        description: 'Flash flood in Astana',
        severity: 'Severe',
        updated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      geometry: { coordinates: [71.4, 51.1] },
    },
    {
      properties: {
        eventType: 'WILDFIRE',
        description: 'Forest fire near Shymkent',
        severity: 'Low',
        updated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      geometry: { coordinates: [69.6, 42.3] },
    },
  ];

  useEffect(() => {
    setDisasters(mockDisasters);
    showNotification('Using sample disaster data.');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
      },
      () => {
        setUserCoords({ lat: 43.2, lon: 76.9 });
      }
    );
  }, []);

  const filteredDisasters = disasters
    .filter((event) => typeFilter === 'all' || event.properties.eventType === typeFilter)
    .filter((event) => {
      if (timeFilter === 'all') return true;
      const now = new Date();
      const eventTime = new Date(event.properties.updated);
      return timeFilter === '24h'
        ? (now - eventTime) / (1000 * 60 * 60) < 24
        : (now - eventTime) / (1000 * 60 * 60 * 24) < 7;
    });

  return (
    <section className="section">
      <h2>Natural Disasters</h2>
      <div className="disaster-controls">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="EARTHQUAKE">Earthquake</option>
          <option value="FLOOD">Flood</option>
          <option value="WILDFIRE">Wildfire</option>
          <option value="CYCLONE">Cyclone</option>
        </select>
        <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
          <option value="all">All Time</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>
      </div>
      <MapContainer
        center={[userCoords.lat, userCoords.lon]}
        zoom={6}
        style={{ height: '400px', borderRadius: '10px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />
        {filteredDisasters.map(
          (event, index) =>
            event.geometry?.coordinates && (
              <Marker key={index} position={[event.geometry.coordinates[1], event.geometry.coordinates[0]]}>
                <Popup>
                  {event.properties.eventType}: {event.properties.description}
                </Popup>
              </Marker>
            )
        )}
      </MapContainer>
      <div className="disaster-stats">
        <h3>Statistics</h3>
        <p>
          Total events: {filteredDisasters.length}
          <br />
          Risk Level: {filteredDisasters.length > 3 ? 'High Risk' : 'Low Risk'}
        </p>
      </div>
      <div className="disaster-data">
        <h3>Active Disasters</h3>
        <ul>
          {filteredDisasters.length ? (
            filteredDisasters.map((event, index) => (
              <li key={index}>
                {event.properties.eventType}: {event.properties.description} (Severity:{' '}
                {event.properties.severity}) at {new Date(event.properties.updated).toLocaleString()}
              </li>
            ))
          ) : (
            <li>No disasters found.</li>
          )}
        </ul>
      </div>
    </section>
  );
}

export default Disasters;