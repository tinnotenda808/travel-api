const {
  getCitySuggestions,
  getWeatherForecast
} = require('./openMeteoService');

const getWeatherDescription = (weatherCode) => {
  if (weatherCode >= 0 && weatherCode <= 3) return 'Clear or partly cloudy';
  if (weatherCode >= 45 && weatherCode <= 48) return 'Foggy';
  if (weatherCode >= 51 && weatherCode <= 55) return 'Drizzle';
  if (weatherCode >= 61 && weatherCode <= 65) return 'Rain';
  if (weatherCode >= 71 && weatherCode <= 75) return 'Snow fall';
  if (weatherCode >= 80 && weatherCode <= 82) return 'Rain showers';
  if (weatherCode >= 85 && weatherCode <= 86) return 'Snow showers';
  if (weatherCode === 95) return 'Thunderstorm';
  return 'Unknown weather';
};

const resolvers = {
  Query: {
    citySuggestions: async (parent, { name }) => {
      if (!name || name.length < 2) {
        return [];
      }
      return getCitySuggestions(name);
    },
    weatherForecast: async (parent, { latitude, longitude }) => {
      const data = await getWeatherForecast(latitude, longitude);
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        current: data.current
          ? {
              temperature: data.current.temperature_2m,
              weatherCode: data.current.weather_code,
              precipitation: data.current.precipitation,
              windSpeed: data.current.wind_speed_10m
            }
          : null,
        daily: data.daily
          ? data.daily.time.map((time, index) => ({
              date: time,
              weatherCode: data.daily.weather_code[index],
              temperatureMax: data.daily.temperature_2m_max[index],
              temperatureMin: data.daily.temperature_2m_min[index],
              precipitationSum: data.daily.precipitation_sum[index],
              windSpeedMax: data.daily.wind_speed_10m_max[index]
            }))
          : []
      };
    },
    activityRanking: (
      parent,
      { temperature, weatherCode, precipitation, windSpeed }
    ) => {
      const activities = [];
      const weatherDesc = getWeatherDescription(weatherCode);

      if (
        temperature < 0 &&
        precipitation > 0.1 &&
        (weatherDesc.includes('Snow') ||
          (weatherCode >= 71 && weatherCode <= 75))
      ) {
        activities.push({
          name: 'Skiing',
          score: 10,
          reason: 'Ideal for skiing: below freezing with snow.'
        });
      } else if (
        temperature < 5 &&
        precipitation === 0 &&
        weatherDesc.includes('Clear')
      ) {
        activities.push({
          name: 'Skiing',
          score: 7,
          reason: 'Good for skiing: cold and clear, but no fresh snow.'
        });
      } else {
        activities.push({
          name: 'Skiing',
          score: 1,
          reason: 'Not suitable for skiing: too warm or no snow.'
        });
      }

      if (windSpeed > 15 && temperature > 15 && precipitation === 0) {
        activities.push({
          name: 'Surfing',
          score: 9,
          reason: 'Great for surfing: good wind, warm, and no rain.'
        });
      } else if (windSpeed > 10 && temperature > 10 && precipitation === 0) {
        activities.push({
          name: 'Surfing',
          score: 7,
          reason: 'Good for surfing: decent wind and mild conditions.'
        });
      } else {
        activities.push({
          name: 'Surfing',
          score: 2,
          reason: 'Not ideal for surfing: low wind, cold, or rainy.'
        });
      }

      if (precipitation > 0.5 || temperature < 5 || temperature > 30) {
        activities.push({
          name: 'Indoor Sightseeing',
          score: 9,
          reason:
            'Excellent for indoor sightseeing: bad weather or extreme temperatures outside.'
        });
      } else if (precipitation > 0 || weatherDesc.includes('cloudy')) {
        activities.push({
          name: 'Indoor Sightseeing',
          score: 7,
          reason: 'Good for indoor sightseeing: some rain or cloudy skies.'
        });
      } else {
        activities.push({
          name: 'Indoor Sightseeing',
          score: 5,
          reason:
            'Moderate for indoor sightseeing: nice weather might tempt you outside.'
        });
      }

      if (
        temperature >= 10 &&
        temperature <= 25 &&
        precipitation === 0 &&
        !weatherDesc.includes('Fog')
      ) {
        activities.push({
          name: 'Outdoor Sightseeing',
          score: 10,
          reason: 'Perfect for outdoor sightseeing: mild, clear, and no rain.'
        });
      } else if (temperature >= 5 && temperature <= 30 && precipitation < 0.1) {
        activities.push({
          name: 'Outdoor Sightseeing',
          score: 7,
          reason:
            'Good for outdoor sightseeing: pleasant temperature, light or no rain.'
        });
      } else {
        activities.push({
          name: 'Outdoor Sightseeing',
          score: 3,
          reason:
            'Not ideal for outdoor sightseeing: extreme temperatures, heavy rain, or fog.'
        });
      }

      return activities.sort((a, b) => b.score - a.score);
    }
  }
};

module.exports = resolvers;
