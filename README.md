# Travel Planning GraphQL API

This project implements a backend GraphQL API for a travel planning application, allowing consumers to retrieve dynamic city suggestions, weather forecasts, and activity rankings based on weather conditions.

## Architecture Overview and Technical Choices

### Core Components:

- **Node.js with Express:** Provides the basic HTTP server framework.
- **Apollo Server:** The GraphQL server implementation, providing a robust way to build and expose the GraphQL API.
- **GraphQL Schema-First Development:** The API is designed by defining the GraphQL schema first (`schema.js`), which clearly outlines the available data types and operations. This promotes clarity and a contract-first approach.
- **Resolvers (`resolvers.js`):** Contains the business logic for fetching and transforming data for each field in the GraphQL schema. This separates data fetching/processing from schema definition.
- **External API Service (`openMeteoService.js`):** A dedicated module for interacting with the `Open-Meteo.com` API. This abstracts external dependencies, making the core logic cleaner and easier to test/maintain. It uses `axios` for HTTP requests.
- **Environment Variables (`.env`):** Used to manage API URLs, ensuring sensitive information and configurations are not hardcoded and can be easily managed across environments.

### Data Flow:

1. **City Suggestions:**
   - User queries `citySuggestions(name: String!)`.
   - `citySuggestions` resolver calls `openMeteoService.getCitySuggestions()`.
   - `openMeteoService` makes an HTTP GET request to `geocoding-api.open-meteo.com/v1/search`.
   - Results are filtered and returned as `City` objects.
2. **Weather Forecast:**
   - User queries `weatherForecast(latitude: Float!, longitude: Float!)`.
   - `weatherForecast` resolver calls `openMeteoService.getWeatherForecast()`.
   - `openMeteoService` makes an HTTP GET request to `api.open-meteo.com/v1/forecast`.
   - Raw weather data is mapped to the `WeatherForecast` GraphQL type.
3. **Activity Ranking:**
   - User queries `activityRanking(temperature: Float!, weatherCode: Int!, precipitation: Float!, windSpeed: Float!)`.
   - `activityRanking` resolver contains the logic to score and rank predefined activities (Skiing, Surfing, Indoor/Outdoor Sightseeing) based on the provided weather parameters. This logic is self-contained and does not require external API calls.

### Clean Architecture Principles Applied:

- **Separation of Concerns:** Each module (schema, resolvers, API service) has a clear, single responsibility.
- **Modularity:** Components are independent and can be developed and tested in isolation.
- **Testability:** The clear separation makes it straightforward to write unit tests for resolvers and the API service.

## Omissions & Trade-offs

### Omissions:

- **Full Weather Code Mapping:** The `getWeatherDescription` helper in `resolvers.js` provides a simplified mapping of weather codes. A production-ready application would include a comprehensive mapping for all OpenMeteo weather codes.
- **Advanced Error Handling/Logging:** While basic `try/catch` is present, a real-world application would integrate a robust logging system (e.g., Winston, Pino) and more granular error types/responses.
- **Authentication/Authorization:** No security measures (like API keys for internal use, user authentication, or authorization for GraphQL queries) are implemented.
- **Rate Limiting:** No rate limiting is implemented for the external OpenMeteo API calls or for the GraphQL endpoint itself.
- **Caching:** No caching mechanism (e.g., Redis for API responses or GraphQL query results) is implemented to reduce redundant external API calls.
- **Database Persistence:** City or user preferences are not persisted in a database, as the focus was on the GraphQL API and external data fetching.
- **More Sophisticated Activity Ranking:** The ranking logic is basic. It could be enhanced with more nuanced rules, user preferences, or machine learning models.
- **Pagination/Filtering for City Suggestions:** For a large number of city suggestions, pagination or more advanced filtering might be needed.
- **Input Validation:** Basic validation for `name` length in `citySuggestions` is present, but more comprehensive input validation for all arguments would be required.

### Trade-offs:

- **Simplicity over Scalability (for some parts):** For the given time constraint, some aspects (like activity ranking logic) are kept simple. Scaling this logic would involve externalizing rules or using a dedicated rules engine.
- **Direct API Calls in Service:** The `openMeteoService` makes direct HTTP calls. For very large-scale applications, a dedicated data layer or a more abstract `DataSource` pattern (like Apollo's `RESTDataSource`) could be considered for better integration with Apollo Server's caching features. However, for this test, a simple service is sufficient and clear.

## How to Run the Project Locally

1. **Prerequisites**

   - Node.js (version 18.x or later recommended)
   - npm (usually comes with Node.js)

1. **Clone The Repository**
   First, clone the project repository to your local machine.

   ```
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Install Dependencies**
   Install all the necessary npm packages defined in package.json.
   `npm install`

3. **Set Up Environment Variables**
   This project requires environment variables to connect to the external Open-Meteo APIs.
   Create a new file named .env in the root directory of the project. Then, copy and paste the following content into it:

   ```
   OPENMETEO_GEOCODING_API_URL=https://geocoding-api.open-meteo.com
   OPENMETEO_WEATHER_API_URL=https://api.open-meteo.com
   ```

4. **Run the Development Server**
   Start the application in development mode. This will use nodemon to automatically restart the server when you make changes to the code.
   `npm run dev`

   You should see a confirmation message in your terminal once the server is running, similar to:
   `🚀 Server ready at http://localhost:4000/graphql`

   You can now open your browser and navigate to `http://localhost:4000/graphql` to access the Apollo Server Sandbox and start making queries!

## How I Would Improve or Extend the Project with More Time

1.  **Comprehensive Testing:**
    - Add more extensive unit tests for all resolvers and the `openMeteoService`.
    - Implement integration tests for the GraphQL API using `apollo-server-testing` or `Supertest` to ensure the entire API works as expected.
    - Add end-to-end tests if a simple frontend were to be integrated.
2.  **Robust Error Handling:**
    - Define custom GraphQL error types for better client-side error handling.
    - Implement centralized error logging and monitoring.
3.  **Caching Layer:**
    - Introduce a caching mechanism (e.g., Redis) for frequently requested weather forecasts or city suggestions to reduce external API calls and improve response times.
4.  **Authentication and Authorization:**
    - Implement a basic authentication system (e.g., JWT) to secure the API.
    - Add authorization checks to control access to specific queries.
5.  **Enhanced Activity Ranking:**
    - Allow users to define their preferences (e.g., "prefer warmer weather for outdoor activities").
    - Integrate more detailed weather parameters (e.g., humidity, UV index) into the ranking logic.
    - Potentially use a configurable rules engine or a simple machine learning model for more dynamic ranking.
6.  **GraphQL Subscriptions:**
    - For real-time updates (e.g., "notify me if the weather changes significantly for my planned activity"), implement GraphQL Subscriptions.
7.  **Deployment Automation:**
    - Set up a more complete CI/CD pipeline (e.g., using GitHub Actions, as mentioned in Collinson's typical stack) to automate testing, building, and deployment to AWS/Azure.
8.  **Infrastructure as Code Refinement:**
    - Further refine Terraform scripts for deploying the application and its dependencies (e.g., databases, load balancers, Kubernetes clusters if moving to containerized deployment).

## Use of AI Tools

AI tools like ChatGPT and GitHub Copilot were used to:

- **Generate boilerplate code:** For example, initial Express server setup, basic `axios` request structure, and `jest` test file structure.
- **Suggest common GraphQL schema patterns:** For defining types and relationships.
- **Refine `README.md` structure and content:** To ensure clarity and cover all requested sections.
- **Brainstorm activity ranking logic:** Proposing initial conditions and scoring ideas for different activities based on weather.

My judgment was applied to:

- **Validate correctness:** Carefully reviewing all generated code for logical errors, syntax issues, and adherence to best practices.
- **Adapt to specific requirements:** Modifying generic code to fit the `OpenMeteo` API structure, specific query requirements, and the desired activity ranking logic.
- **Ensure architectural integrity:** Making sure the code adheres to the clean architecture principles (separation of concerns, modularity) even if the AI suggested a more monolithic approach.
- **Maintain consistency:** Ensuring naming conventions, code style, and error handling patterns are consistent across the codebase.
- **Prioritize and simplify:** Deciding which features to fully implement within the time constraint and which to mention as future improvements, based on the "Quality > quantity" tip.
