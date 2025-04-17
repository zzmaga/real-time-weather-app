import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import 'moment/locale/ru';
import './Weather.css';

moment.locale('ru');

function Weather() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [aqiData, setAqiData] = useState(null);
  const apiKey = '738a4b7cc6cd40d9512fad8b13d51299';
  const aqiList = ['Хорошее', 'Удовлетворительное', 'Умеренное', 'Плохое', 'Очень плохое'];

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
    } catch (error) {
      console.error('Ошибка при загрузке данных о погоде:', error);
    }
  };

  const getCityCoordinates = async () => {
    if (!city) {
      console.error('Введите название города.');
      return;
    }
    try {
      const res = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
      if (res.data.length === 0) throw new Error('Город не найден');
      const { name, lat, lon, country } = res.data[0];
      setCity('');
      getWeatherDetails(name, lat, lon, country);
    } catch (error) {
      console.error('Ошибка при загрузке координат:', error);
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
          console.error('Ошибка при загрузке местоположения:', error);
        }
      },
      (error) => {
        console.error('Ошибка геолокации:', error);
      }
    );
  };

  useEffect(() => {
    getUserCoordinates();
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
    <section className="weather-section">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Введите название города"
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
      <div className="weather-container">
        {weatherData ? (
          <>
            <div className="main-weather-card" style={backgroundStyle}>
              <div className="main-weather-content">
                <h1>{weatherData.name}, {weatherData.country}</h1>
                <div className="weather-main">
                  <img
                    src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                    alt="иконка погоды"
                    className="weather-icon"
                  />
                  <div className="weather-details">
                    <h2>{(weatherData.main.temp - 273.15).toFixed(1)}°C</h2>
                    <p>{weatherData.weather[0].description}</p>
                    <p>Чувствуется как: {(weatherData.main.feels_like - 273.15).toFixed(1)}°C</p>
                  </div>
                </div>
                <p className="weather-date">{moment().format('dddd, D MMMM')}</p>
              </div>
            </div>
            <div className="weather-icons">
              <div className="icon-card">
                <i className="fa-solid fa-droplet"></i>
                <p>Влажность</p>
                <h3>{weatherData.main.humidity}%</h3>
              </div>
              <div className="icon-card">
                <i className="fa-solid fa-gauge"></i>
                <p>Давление</p>
                <h3>{weatherData.main.pressure} гПа</h3>
              </div>
              <div className="icon-card">
                <i className="fa-solid fa-eye"></i>
                <p>Видимость</p>
                <h3>{weatherData.visibility / 1000} км</h3>
              </div>
              <div className="icon-card">
                <i className="fa-solid fa-wind"></i>
                <p>Ветер</p>
                <h3>{weatherData.wind.speed} м/с</h3>
              </div>
              {aqiData && (
                <div className="icon-card">
                  <i className="fa-solid fa-smog"></i>
                  <p>Качество воздуха</p>
                  <h3>{aqiList[aqiData.main.aqi - 1]}</h3>
                </div>
              )}
            </div>
            <div className="sunrise-sunset">
              <div className="sun-card">
                <img src="/assets/Imgs/sunrise (1).png" alt="восход" />
                <p>Восход</p>
                <h3>{moment.unix(weatherData.sys.sunrise).tz(moment.tz.guess()).format('HH:mm')}</h3>
              </div>
              <div className="sun-card">
                <img src="/assets/Imgs/sunset (1).png" alt="закат" />
                <p>Закат</p>
                <h3>{moment.unix(weatherData.sys.sunset).tz(moment.tz.guess()).format('HH:mm')}</h3>
              </div>
              </div>
          </>
        ) : (
          <p>Загрузка данных о погоде...</p>
        )}
      </div>
      {weatherData && (
        <>
          <h2>Почасовой прогноз</h2>
          <div className="hourly-forecast">
            {forecastData.slice(0, 8).map((forecast, index) => {
              const hr = new Date(forecast.dt_txt).getHours();
              const period = hr < 12 ? 'AM' : 'PM';
              const hour = hr % 12 || 12;
              return (
                <div className="forecast-card" key={index}>
                  <p>{`${hour}${period}`}</p>
                  <img
                    src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`}
                    alt="иконка погоды"
                  />
                  <p>{(forecast.main.temp - 273.15).toFixed(1)}°C</p>
                </div>
              );
            })}
          </div>
          <h2>Прогноз на 5 дней</h2>
          <div className="daily-forecast">
            {forecastData
              .filter((_, index) => index % 8 === 0)
              .slice(0, 5)
              .map((forecast, index) => {
                const date = new Date(forecast.dt_txt);
                return (
                  <div className="forecast-card" key={index}>
                    <p>{moment(date).format('D MMMM')}</p>
                    <p>{moment(date).format('dddd')}</p>
                    <img
                      src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`}
                      alt="иконка погоды"
                    />
                    <p>{(forecast.main.temp - 273.15).toFixed(1)}°C</p>
                  </div>
                );
              })}
          </div>
        </>
      )}
    </section>
  );
}

export default Weather;