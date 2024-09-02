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
````
## Use Diagram

```mermaid
flowchart TD
    A["Start"] --> B["Receive request with coordinates"]
    B --> C["Validate coordinates"]
    C --> D{"Are coordinates valid?"}
    D == No ==> E["Send validation error"]
    D == Yes ==> F["Call GraphHopper API"]
    F --> G["Receive API response"]
    G --> H{"Is response valid?"}
    H -- No --> I["Send API error"]
    H -- Yes --> J["Decode and process data"]
    J --> K["Format response"]
    K --> L["Send data to client"]
    L --> M["End"]
    style A fill:#004d00,stroke:333,stroke-width:4px,color:#FFFFFF
    style B fill:#000000,color:#FFFFFF
    style C fill:#000000,color:#FFFFFF
    style D fill:#000000,color:#FFFFFF
    style E fill:#004d11,stroke:#333,stroke-width:2px,color:#FFFFFF
    style F color:#FFFFFF,fill:#000000
    style G color:#FFFFFF,fill
