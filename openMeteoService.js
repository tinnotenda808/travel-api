require('dotenv').config();
const axios = require('axios');

const GEOCODING_API_URL =
  process.env.OPENMETEO_GEOCODING_API_URL ||
  'https://geocoding-api.open-meteo.com';
const WEATHER_API_URL =
  process.env.OPENMETEO_WEATHER_API_URL || 'https://api.open-meteo.com';

async function getCitySuggestions(name) {
  if (!name) return [];

  try {
    const response = await axios.get(`${GEOCODING_API_URL}/v1/search`, {
      params: {
        name: name,
        count: 10,
        language: 'en',
        format: 'json'
      }
    });
    return response.data.results
      ? response.data.results.filter(
          (city) =>
            city.name &&
            city.latitude &&
            city.longitude &&
            city.country &&
            city.admin1
        )
      : [];
  } catch (error) {
    console.error('Error fetching city suggestions:', error.message);
    throw new Error(
      'Failed to fetch city suggestions. Please try again later.'
    );
  }
}

async function getWeatherForecast(latitude, longitude) {
  try {
    const response = await axios.get(`${WEATHER_API_URL}/v1/forecast`, {
      params: {
        latitude: latitude,
        longitude: longitude,
        current: 'temperature_2m,weather_code,precipitation,wind_speed_10m',
        daily:
          'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
        timezone: 'auto',
        forecast_days: 1
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error.message);
    throw new Error(
      'Failed to fetch weather forecast. Please check the coordinates or try again later.'
    );
  }
}

module.exports = {
  getCitySuggestions,
  getWeatherForecast
};
