# Project Diagrams

## Modules Diagram

```mermaid


graph TD
    subgraph  AppModule
        RoutesModule --> RoutesController
        RoutesModule --> RoutesService
        RoutesService --> RoutesDetailsUtil
        RoutesService --> PolylineUtils
        RoutesService --> ValidationUtils
        RoutesService --> RoutesUtils
    end

    %% Relationships between controllers and services
    RoutesController -->|calls| RoutesService
    
    %% Components Diagram
    RoutesService -->|Uses| getPolyline
    RoutesService -->|Uses| fetchRoute
    RoutesUtils -->|Uses| generateSegmentedRoutes
    RoutesUtils -->|Uses| parsedRoutes
    RoutesUtils -->|Uses| handleErrorResponse
    
    %% Calls and data flow Diagram
    subgraph Route Flow
        RoutesController -.calls.-> RoutesService
        RoutesService -.calls.-> fetchRoute
        RoutesService -.calls.-> parsedRoutes
        parsedRoutes -.calls.-> decodePolyline
        parsedRoutes -.calls.-> simplifyPolyline
        parsedRoutes -.calls.-> logPolyline
        parsedRoutes -.calls.-> generateRoutesDetails
    end

    %% Description of each code 
    subgraph Descriptions
        %% Description of PolylineUtils functions
        PolylineUtils -->|decodePolyline| decodePolyline
        PolylineUtils -->|encodePolyline| encodePolyline
        PolylineUtils -->|simplifyPolyline| simplifyPolyline
        PolylineUtils -->|logPolyline| logPolyline

        %% Description of RoutesDetailsUtil functions
        RoutesDetailsUtil -->|generateRoutesDetails| generateRoutesDetails
        
        %% Description of RoutesUtils functions 
        RoutesUtils -->|parsedRoutes| parsedRoutes
        RoutesUtils -->|generateSegmentedRoutes| generateSegmentedRoutes
        RoutesUtils -->|simplifyGeoJSONLineString| simplifyGeoJSONLineString
        RoutesUtils -->|expandBBox| expandBBox



