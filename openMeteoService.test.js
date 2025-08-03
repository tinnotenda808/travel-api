const {
  getCitySuggestions,
  getWeatherForecast
} = require('./openMeteoService');
const axios = require('axios');

jest.mock('axios');

describe('OpenMeteo Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCitySuggestions', () => {
    it('should return an empty array if no city name is provided', async () => {
      axios.get.mockResolvedValue({ data: { results: [] } });
      const result = await getCitySuggestions('');
      expect(result).toEqual([]);
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should fetch city suggestions successfully', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              id: 1,
              name: 'London',
              latitude: 51.5,
              longitude: -0.1,
              country: 'United Kingdom',
              admin1: 'England'
            },
            {
              id: 2,
              name: 'London',
              latitude: 42.9,
              longitude: -81.2,
              country: 'Canada',
              admin1: 'Ontario'
            }
          ]
        }
      };
      axios.get.mockResolvedValue(mockResponse);

      const suggestions = await getCitySuggestions('London');
      expect(suggestions).toEqual([
        {
          id: 1,
          name: 'London',
          latitude: 51.5,
          longitude: -0.1,
          country: 'United Kingdom',
          admin1: 'England'
        },
        {
          id: 2,
          name: 'London',
          latitude: 42.9,
          longitude: -81.2,
          country: 'Canada',
          admin1: 'Ontario'
        }
      ]);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/v1/search'),
        expect.any(Object)
      );
    });

    it('should throw an error if API call fails', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));
      await expect(getCitySuggestions('Invalid')).rejects.toThrow(
        'Failed to fetch city suggestions'
      );
    });
  });

  describe('getWeatherForecast', () => {
    it('should fetch weather forecast successfully', async () => {
      const mockResponse = {
        data: {
          latitude: 51.5,
          longitude: -0.1,
          timezone: 'Europe/London',
          current: {
            temperature_2m: 15.0,
            weather_code: 0,
            precipitation: 0.0,
            wind_speed_10m: 10.0
          },
          daily: {
            time: ['2025-07-30'],
            weather_code: [0],
            temperature_2m_max: [20.0],
            temperature_2m_min: [10.0],
            precipitation_sum: [0.0],
            wind_speed_10m_max: [15.0]
          }
        }
      };
      axios.get.mockResolvedValue(mockResponse);

      const forecast = await getWeatherForecast(51.5, -0.1);
      expect(forecast).toEqual(mockResponse.data);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/v1/forecast'),
        expect.any(Object)
      );
    });

    it('should throw an error if API call fails', async () => {
      axios.get.mockRejectedValue(new Error('API limit exceeded'));
      await expect(getWeatherForecast(0, 0)).rejects.toThrow(
        'Failed to fetch weather forecast'
      );
    });
  });
});
