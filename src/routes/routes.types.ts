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
    //max_speed: number;
    max_speed: number[];
    avg_speed: number;
    toll: boolean;
    country: string;
}



export interface GraphhopperResponse {
    hints: {
        "visited_nodes.sum": number; //170,
        "visited_nodes.average": number; //85
    },
    info: {
        copyrights: string[];
        took: number; //1,
        road_data_timestamp: string
    },
    paths: Path[];
}

export interface Path {
    distance: number;
    weight: number;
    time: number;
    transfers: number;
    points_encoded:boolean;
    points_encoded_multiplier: number;
    bbox: [number, number, number, number];
    points: string;
    legs: unknown[]; //TODO: hay que ver qué viene en la doc
    details: PathDetails;
    ascend: number;
    descend: number;
    snapped_waypoints: string;
}

export interface PathDetails {
    country: [number, number, string | null][];
    max_speed: [number, number, number | null][];
    toll: [number, number, string | null][]; //TODO: Definir el tipo según la doc
}

export interface IResponse<T = any> {
    ok: boolean;
    data?: T;
    error?: string
}