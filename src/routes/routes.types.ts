export interface ParsedResponse {
    distance: number;
    time: number;
    geojson: { type: 'LineString', coordinates: [number, number][] };
    polyline: string;
    elevation: {
        ascend: number;
        descend: number;
    }
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