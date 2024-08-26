# 🗺 Graphhopper Route Service 🗺


This project provides a route service based on the Graphhopper API. 

It uses `NestJS` to manage routes and `fetch` to make requests to the Graphhopper API.


## Description

Simply provide starting and ending points, and optionally add waypoints, and we'll calculate the optimal route for you. You'll get detailed information like the fastest speed, toll, and even the countries you'll pass through.  

The response is provided in GeoJSON format and encoded polyline format.


## Installation

1. Clone the repository:

    ```bash
    git clone <repository-url>
    cd <project-name>
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file in the root of the project with the following configuration:

    ```plaintext
    GRAPH_HOPPER_API_KEY=<your-api-key>
    ```

## Usage

### Endpoints

- **POST /routes**

  This endpoint accepts a request to calculate a route between two points and optionally include intermediate waypoints.

  **Request**

  ```json
  {
    "startLat": "40.7128",
    "startLng": "-74.0060",
    "endLat": "34.0522",
    "endLng": "-118.2437",
    "waypoints": [
      {
        "lat": "37.7749",
        "lng": "-122.4194"
      }
    ]
  }


## 👨‍💻 About me

I'm a passionate developer with a deep love for geospatial technologies. I thrive on creating applications that leverage the power of maps to connect people with the world around them. From personalized routes to geographic data analysis, I enjoy exploring the endless possibilities that maps offer.

## Author

- [@Drialis](https://www.github.com/Drialis)
