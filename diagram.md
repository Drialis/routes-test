# Project Diagrams

## Modules Diagram

```mermaid
graph TD
    subgraph AppModule
        RoutesModule --> RoutesController
        RoutesModule --> RoutesService
        RoutesService --> RoutesDetailsUtil
        RoutesService --> PolylineUtils
        RoutesService --> ValidationUtils
        RoutesService --> RoutesUtils
    end

    RoutesController -->|calls| RoutesService

    RoutesService -->|Uses| getPolyline
    RoutesService -->|Uses| fetchRoute
    RoutesUtils -->|Uses| generateSegmentedRoutes
    RoutesUtils -->|Uses| parsedRoutes
    RoutesUtils -->|Uses| handleErrorResponse

    subgraph RouteFlow
        RoutesController -- calls --> RoutesService
        RoutesService -- calls --> fetchRoute
        RoutesService -- calls --> parsedRoutes
        parsedRoutes -- calls --> decodePolyline
        parsedRoutes -- calls --> simplifyPolyline
        parsedRoutes -- calls --> logPolyline
        parsedRoutes -- calls --> generateRoutesDetails
    end

    subgraph Descriptions
        PolylineUtils -->|decodePolyline| decodePolyline
        PolylineUtils -->|encodePolyline| encodePolyline
        PolylineUtils -->|simplifyPolyline| simplifyPolyline
        PolylineUtils -->|logPolyline| logPolyline

        RoutesDetailsUtil -->|generateRoutesDetails| generateRoutesDetails

        RoutesUtils -->|parsedRoutes| parsedRoutes
        RoutesUtils -->|generateSegmentedRoutes| generateSegmentedRoutes
        RoutesUtils -->|simplifyGeoJSONLineString| simplifyGeoJSONLineString
        RoutesUtils -->|expandBBox| expandBBox
        RoutesUtils -->|getPOIsWithinDistanceFromLine| getPOIsWithinDistanceFromLine

        ValidationUtils -->|validateCoordinates| validateCoordinates
        ValidationUtils -->|validateLandCoordinates| validateLandCoordinates
        ValidationUtils -->|validateRequestPayload| validateRequestPayload
        ValidationUtils -->|isVehicleValidForRoute| isVehicleValidForRoute
    end

