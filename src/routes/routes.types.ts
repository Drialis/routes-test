export interface ParsedResponse {
    distance: number;
    time: number;
    geojson: { type: 'LineString', coordinates: [number, number][] };
    polyline: string;
    elevation: {
        ascend: number;
        descend: number;
    },
    waypoints: [number, number][];
    complete_info: completePoint[];
}

export interface completePoint {
    latitude: number;
    longitude: number;
    max_speed: number;
    avg_speed: number;
    toll: boolean;
    country: string;
}

export interface GraphhopperResponse {
    paths: Path[];
}

export interface Path {
    distance: number;
    time: number;
    points: string;
    details?: PathDetails;
    ascend?: number;
    descend?: number;
}

export interface PathDetails {
    max_speed: number[];
    toll: boolean[];
    country: string[];
}
