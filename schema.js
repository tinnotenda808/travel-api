const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type City {
    id: ID!
    name: String!
    latitude: Float!
    longitude: Float!
    country: String!
    admin1: String
    timezone: String
  }

  type CurrentWeather {
    temperature: Float!
    weatherCode: Int!
    precipitation: Float!
    windSpeed: Float!
  }

  type DailyWeather {
    date: String!
    weatherCode: Int!
    temperatureMax: Float!
    temperatureMin: Float!
    precipitationSum: Float!
    windSpeedMax: Float!
  }

  type WeatherForecast {
    latitude: Float!
    longitude: Float!
    timezone: String!
    current: CurrentWeather
    daily: [DailyWeather]
  }

  type Activity {
    name: String!
    score: Float!
    reason: String
  }

  type Query {
    """
    Provides dynamic city suggestions based on user input.
    """
    citySuggestions(name: String!): [City!]!

    """
    Retrieves the weather forecast for a specific geographical location.
    Requires latitude and longitude, typically obtained from citySuggestions.
    """
    weatherForecast(latitude: Float!, longitude: Float!): WeatherForecast!

    """
    Ranks activities based on the provided weather forecast.
    """
    activityRanking(
      temperature: Float!
      weatherCode: Int!
      precipitation: Float!
      windSpeed: Float!
    ): [Activity!]!
  }
`;

module.exports = typeDefs;
