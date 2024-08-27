import { europeCountriesISO } from '../assets/europeCountriesISO';
import { decodePolyline, logPolyline, simplifyPolyline } from './polyline.utils';
import { generateRoutesDetails } from './routes.details.util';
import { IResponse, ParsedResponse, ParsedRoute, Path, Waypoint } from './routes.types';
import * as turf from '@turf/turf'

export const parsedRoutes = (
  path: Path,
  waypoints: Waypoint[],
): ParsedRoute => {
  const encodedPolyline = path.points;
  const decodedPolyline = decodePolyline(encodedPolyline);
  const simplifiedPolyline = simplifyPolyline(decodedPolyline, 17)
  const cleanedPolyline = logPolyline(simplifiedPolyline);

  const originalGeoJSON: { type: 'LineString'; coordinates: [number, number][] } = {
    type: 'LineString',
    coordinates: decodedPolyline.map(coord => [coord[1], coord[0]]) as [number, number][],
  };
  const simplifiedGeoJSON = simplifyGeoJSONLineString(originalGeoJSON, 0.01);

  const waypointCoordinates = waypoints.map(
    (wp) => [parseFloat(wp.lat), parseFloat(wp.lng)] as [number, number],
  );

  const finalResponse: ParsedRoute = {
    distance: path.distance || 0,
    time: path.time || 0,
    bbox: path.bbox,
    geojson: simplifiedGeoJSON,
    polyline: cleanedPolyline,
    elevation: {
      ascend: path.ascend || 0,
      descend: path.descend || 0,
    },
    waypoints: waypointCoordinates,
    //  complete_info: generateRoutesDetails(path, europeCountriesISO, decodedPolyline),  //descomentar también de parsedRoute
  };

  return finalResponse;
};

export const handleErrorResponse = (response: Response): IResponse<ParsedResponse> => {
  const errorMsg = `HTTP Error ${response.status}: ${response.statusText}`
  switch (response.status) {
    case 400:
      return { ok: false, error: `Bad Request: ${errorMsg}` };
    case 401:
      return { ok: false, error: `Unauthorized: ${errorMsg}` };
    case 429:
      return { ok: false, error: `Rate Limit Exceeded: ${errorMsg}` };
    case 500:
      return { ok: false, error: `Internal Server Error: ${errorMsg}` };
    default:
      return { ok: false, error: `HTTP Error ${response.status}: ${errorMsg}` };
  }
}

export const simplifyGeoJSONLineString = (
  geojsonLineString: { type: 'LineString'; coordinates: [number, number][] },
  tolerance: number
): ParsedRoute['geojson'] => {

  const lineString = turf.lineString(geojsonLineString.coordinates);
  const simplified = turf.simplify(lineString, { tolerance });

  return {
    type: simplified.geometry.type,
    coordinates: simplified.geometry.coordinates as [number, number][],
  };
};