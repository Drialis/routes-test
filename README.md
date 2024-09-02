# Project Diagrams

## Modules Diagram

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

