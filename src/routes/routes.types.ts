export interface ParsedRoute {
  distance: number;
  time: number;
  bbox: [number, number, number, number];
  geojson: GeoJsonLineString;
  polyline: string;
  elevation: {
    ascend: number;
    descend: number;
  };
  waypoints: [number, number][];
  //complete_info: completePoint[];

  //hay que añadir aquí también los cargadores:
  POIs?: { latitude: number; longitude: number }[]
}

export interface ParsedResponse {
  routes: ParsedRoute[];
}

export interface completePoint {
  latitude: number;
  longitude: number;
  max_speed: number;
  toll: boolean;
  country: string;
}

export interface ErrorResponse {
  message?: string;
}

export interface GraphhopperResponse {
  hints: {
    'visited_nodes.sum': number; //170,
    'visited_nodes.average': number; //85
  };
  info: {
    copyrights: string[];
    took: number; //1,
    road_data_timestamp: string;
  };
  paths: Path[];
}

export interface Path {
  distance: number;
  weight: number;
  time: number;
  transfers: number;
  points_encoded: boolean;
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
  error?: string;
}


export interface RoutesRequest {
    startLat: string,
    startLng: string,
    endLat: string,
    endLng: string,
    waypoints?: Waypoint[],
    distance_to_POI?: number;
}

export interface Waypoint {
    lat: string,
    lng: string
}

export interface GeoJsonLineString {
  type: 'LineString';
  coordinates: [number, number][];
};