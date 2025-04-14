import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';

function Weather({ showNotification }) {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [aqiData, setAqiData] = useState(null);
  const apiKey = '738a4b7cc6cd40d9512fad8b13d51299';
  const aqiList = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getWeatherDetails = async (name, lat, lon, country) => {
    try {
      const [weatherRes, forecastRes, aqiRes] = await Promise.all([
        axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`),
        axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`),
        axios.get(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`),
      ]);

      setWeatherData({ ...weatherRes.data, name, country });
      setForecastData(forecastRes.data.list);
      setAqiData(aqiRes.data.list[0]);

      const weather = weatherRes.data.weather[0].main;
      if (['Thunderstorm', 'Rain', 'Snow'].includes(weather) && document.querySelector('#notificationsToggle')?.checked) {
        showNotification(`Weather Alert: ${weather} in ${name}! Stay safe.`);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      showNotification('Unable to load weather data.');
    }
  };

  const getCityCoordinates = async () => {
    if (!city) {
      showNotification('Please enter a city name.');
      return;
    }
    try {
      const res = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
      if (res.data.length === 0) throw new Error('City not found');
      const { name, lat, lon, country } = res.data[0];
      setCity('');
      getWeatherDetails(name, lat, lon, country);
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      showNotification('City not found.');
    }
  };

  const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await axios.get(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`
          );
          const { name, country } = res.data[0];
          getWeatherDetails(name, latitude, longitude, country);
        } catch (error) {
          console.error('Error fetching location:', error);
          showNotification('Unable to fetch location.');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        showNotification('Unable to get location.');
      }
    );
  };

  useEffect(() => {
    getUserCoordinates();
    if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') console.log('Notifications allowed');
      });
    }
  }, []);

  const backgroundStyle = weatherData?.weather[0]?.main
    ? {
        backgroundImage: `url(/assets/bgweather/${
          weatherData.weather[0].main === 'Clear'
            ? 'sunny.jpg'
            : weatherData.weather[0].main === 'Clouds'
            ? 'cloudy.jpg'
            : weatherData.weather[0].main === 'Rain' || weatherData.weather[0].main === 'Drizzle'
            ? 'rainy.jpg'
            : 'default.jpg'
        })`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

  return (
    <section className="section weather-section">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && getCityCoordinates()}
        />
        <button onClick={getCityCoordinates}>
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>
        <button onClick={getUserCoordinates}>
          <i className="fa-solid fa-location-crosshairs"></i>
        </button>
      </div>
      <div className="weather-data">
        <div className="weather-left">
          <div className="card" style={backgroundStyle}>
            {weatherData ? (
              <>
                <div className="current-weather">
                  <div className="details">
                    <p>Now</p>
                    <h2>{(weatherData.main.temp - 273.15).toFixed(2)}°C</h2>
                    <p>{weatherData.weather[0].description}</p>
                  </div>
                  <div className="weather-icon">
                    <img
                      src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                      alt="weather icon"
                    />
                  </div>
                </div>
                <hr />
                <div className="card-footer">
                  <p>
                    <i className="fa-regular fa-calendar"></i>{' '}
                    {days[new Date().getDay()]}, {new Date().getDate()} {months[new Date().getMonth()]}
                  </p>
                  <p>
                    <i className="fa-solid fa-location-dot"></i> {weatherData.name}, {weatherData.country}
                  </p>
                </div>
              </>
            ) : (
              <p>Loading...</p>
            )}
          </div>
          <div className="card day-forecast">
            {forecastData
              .filter((_, index) => index % 8 === 0)
              .slice(0, 5)
              .map((forecast, index) => {
                const date = new Date(forecast.dt_txt);
                return (
                  <div className="forecast-item" key={index}>
                    <div className="icon-wrapper">
                      <img
                        src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`}
                        alt="weather icon"
                      />
                      <span>{(forecast.main.temp - 273.15).toFixed(2)}°C</span>
                    </div>
                    <p>
                      {date.getDate()} {months[date.getMonth()]}
                    </p>
                    <p>{days[date.getDay()]}</p>
                  </div>
                );
              })}
          </div>
        </div>
        <div className="weather-right">
          <h2>Today's Highlights</h2>
          <div className="highlights">
            <div className="card">
              {weatherData ? (
                <>
                  <div className="card-head">
                    <p>Sunrise & Sunset</p>
                  </div>
                  <div className="sunrise-sunset">
                    <div className="item">
                      <div className="icon">
                        <img src="/assets/Imgs/sunrise (1).png" alt="sunrise" />
                      </div>
                      <div>
                        <p>Sunrise</p>
                        <h2>{moment.unix(weatherData.sys.sunrise).tz(moment.tz.guess()).format('hh:mm A')}</h2>
                      </div>
                    </div>
                    <div className="item">
                      <div className="icon">
                        <img src="/assets/Imgs/sunset (1).png" alt="sunset" />
                      </div>
                      <div>
                        <p>Sunset</p>
                        <h2>{moment.unix(weatherData.sys.sunset).tz(moment.tz.guess()).format('hh:mm A')}</h2>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p>Loading...</p>
              )}
            </div>
            {weatherData && (
              <>
                <div className="card card-item">
                  <div>
                    <p>Humidity</p>
                    <h2>{weatherData.main.humidity}%</h2>
                  </div>
                  <i className="fa-solid fa-droplet"></i>
                </div>
                <div className="card card-item">
                  <div>
                    <p>Давление</p>
                    <h2>{weatherData.main.pressure}hPa</h2>
                  </div>
                  <i className="fa-solid fa-gauge"></i>
                </div>
                <div className="card card-item">
                  <div>
                    <p>Видимость</p>
                    <h2>{weatherData.visibility / 1000}Km</h2>
                  </div>
                  <i className="fa-solid fa-eye"></i>
                </div>
                <div className="card card-item">
                  <div>
                    <p>Скорость ветра</p>
                    <h2>{weatherData.wind.speed}m/s</h2>
                  </div>
                  <i className="fa-solid fa-wind"></i>
                </div>
                <div className="card card-item">
                  <div>
                    <p>Чувствуется как</p>
                    <h2>{(weatherData.main.feels_like - 273.15).toFixed(2)}°C</h2>
                  </div>
                  <i className="fa-solid fa-temperature-half"></i>
                </div>
              </>
            )}
          </div>
          <h2>Почасовой прогноз</h2>
          <div className="hourly-forecast">
            {forecastData.slice(0, 8).map((forecast, index) => {
              const hr = new Date(forecast.dt_txt).getHours();
              const period = hr < 12 ? 'AM' : 'PM';
              const hour = hr % 12 || 12;
              return (
                <div className="card" key={index}>
                  <p>{`${hour}${period}`}</p>
                  <img
                    src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`}
                    alt="weather icon"
                  />
                  <p>{(forecast.main.temp - 273.15).toFixed(2)}°C</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Weather;