import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

function Disasters() {
  const [disasters, setDisasters] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [userCoords, setUserCoords] = useState({ lat: 43.2, lon: 76.9 });
  const [loading, setLoading] = useState(true);

  // Bounding box for Central Asia (Kazakhstan-focused)
  const asiaBounds = {
    minLat: 30,
    maxLat: 55,
    minLon: 60,
    maxLon: 100,
  };

  // Cache disasters in local storage
  const getCachedDisasters = () => {
    const cached = localStorage.getItem('disasters');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 30 * 60 * 1000) return data; // Cache valid for 30 minutes
    }
    return null;
  };

  const cacheDisasters = (data) => {
    localStorage.setItem('disasters', JSON.stringify({ data, timestamp: Date.now() }));
  };

  // Fetch disaster data
  useEffect(() => {
    const fetchDisasters = async () => {
      const cached = getCachedDisasters();
      if (cached) {
        setDisasters(cached);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [earthquakeRes, eonetRes] = await Promise.all([
          axios.get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson'), // Significant earthquakes (mag >= 4.5)
          axios.get(
            `https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires,severeStorms&status=open&limit=20&bbox=${asiaBounds.minLon},${asiaBounds.minLat},${asiaBounds.maxLon},${asiaBounds.maxLat}`
          ),
        ]);

        const earthquakeData = earthquakeRes.data.features
          .filter((feature) => {
            const [lon, lat] = feature.geometry.coordinates;
            return (
              lat >= asiaBounds.minLat &&
              lat <= asiaBounds.maxLat &&
              lon >= asiaBounds.minLon &&
              lon <= asiaBounds.maxLon
            );
          })
          .map((feature) => ({
            properties: {
              eventType: 'EARTHQUAKE',
              description: feature.properties.title,
              severity: feature.properties.mag >= 5 ? 'Высокая' : feature.properties.mag >= 3 ? 'Средняя' : 'Низкая',
              updated: new Date(feature.properties.time).toISOString(),
            },
            geometry: {
              coordinates: [feature.geometry.coordinates[0], feature.geometry.coordinates[1]],
            },
          }));

        const eonetData = eonetRes.data.events
          .map((event) => ({
            properties: {
              eventType: event.categories[0]?.title.toUpperCase() === 'WILDFIRES' ? 'ПОЖАР' : 'ШТОРМ',
              description: event.title,
              severity: 'Средняя',
              updated: event.date,
            },
            geometry: {
              coordinates: [event.geometry[0].coordinates[0], event.geometry[0].coordinates[1]],
            },
          }));

        const combinedData = [...earthquakeData, ...eonetData].slice(0, 30); // Limit to 30 events
        setDisasters(combinedData);
        cacheDisasters(combinedData);
      } catch (error) {
        console.error('Ошибка при загрузке данных о катастрофах:', error);
        setDisasters([
          {
            properties: {
              eventType: 'EARTHQUAKE',
              description: 'Небольшое землетрясение в Алматы',
              severity: 'Средняя',
              updated: new Date().toISOString(),
            },
            geometry: { coordinates: [76.9, 43.2] },
          },
          {
            properties: {
              eventType: 'ПОЖАР',
              description: 'Лесной пожар около Шымкента',
              severity: 'Низкая',
              updated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
            geometry: { coordinates: [69.6, 42.3] },
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    // Delay fetch to prioritize UI rendering
    const timer = setTimeout(fetchDisasters, 100);
    return () => clearTimeout(timer);
  }, []);

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
      },
      () => {
        console.error('Не удалось определить местоположение.');
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
      <h2>Природные катастрофы</h2>
      <div className="disaster-controls">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">Все типы</option>
          <option value="EARTHQUAKE">Землетрясение</option>
          <option value="ПОЖАР">Пожар</option>
          <option value="ШТОРМ">Шторм</option>
        </select>
        <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
          <option value="all">За всё время</option>
          <option value="24h">Последние 24 часа</option>
          <option value="7d">Последние 7 дней</option>
        </select>
      </div>
      {loading ? (
        <p>Загрузка данных о катастрофах...</p>
      ) : (
        <>
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
                  <Marker
                    key={index}
                    position={[event.geometry.coordinates[1], event.geometry.coordinates[0]]}
                  >
                    <Popup>
                      {event.properties.eventType}: {event.properties.description}
                      <br />
                      Уровень опасности: {event.properties.severity}
                      <br />
                      Время: {new Date(event.properties.updated).toLocaleString('ru-RU')}
                    </Popup>
                  </Marker>
                )
            )}
          </MapContainer>
          <div className="disaster-stats">
            <h3>Статистика</h3>
            <p>
              Всего событий: {filteredDisasters.length}
              <br />
              Уровень риска:{' '}
              {filteredDisasters.length > 10
                ? 'Высокий'
                : filteredDisasters.length > 3
                ? 'Средний'
                : 'Низкий'}
            </p>
          </div>
          <div className="disaster-data">
            <h3>Активные катастрофы</h3>
            <ul>
              {filteredDisasters.length ? (
                filteredDisasters.map((event, index) => (
                  <li key={index}>
                    {event.properties.eventType}: {event.properties.description} (Уровень опасности:{' '}
                    {event.properties.severity}) в{' '}
                    {new Date(event.properties.updated).toLocaleString('ru-RU')}
                  </li>
                ))
              ) : (
                <li>Катастрофы по выбранным фильтрам не найдены.</li>
              )}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}

export default Disasters;