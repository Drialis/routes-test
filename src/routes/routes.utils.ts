import { europeCountriesISO } from '../assets/europeCountriesISO';
import { decodePolyline, logPolyline, simplifyPolyline } from './polyline.utils';
import { generateRoutesDetails } from './routes.details.util';
import { ErrorResponse, IResponse, ParsedResponse, ParsedRoute, Path, Waypoint } from './routes.types';

export const parsedRoutes = (
  path: Path,
  waypoints: Waypoint[],
): ParsedRoute => {
  const encodedPolyline = path.points;
  const decodedPolyline = decodePolyline(encodedPolyline);
  const simplifiedPolyline = simplifyPolyline(decodedPolyline, 10)
  const cleanedPolyline = logPolyline(simplifiedPolyline);

  const waypointCoordinates = waypoints.map(
    (wp) => [parseFloat(wp.lat), parseFloat(wp.lng)] as [number, number],
  );

  const finalResponse: ParsedRoute = {
    distance: path.distance || 0,
    time: path.time || 0,
    bbox: path.bbox,
    geojson: {
      type: 'LineString',
      coordinates: decodedPolyline.map((coord) => [coord[1], coord[0]]),
    },
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

export  const handleErrorResponse = (response: Response): IResponse<ParsedResponse> => {
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