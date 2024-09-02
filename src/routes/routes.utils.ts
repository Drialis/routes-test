import { europeCountriesISO } from '../assets/europeCountriesISO';
import { mockedPOIs } from '../assets/mockedPOIs';
import { decodePolyline, logPolyline, simplifyPolyline } from './polyline.utils';
import { generateRoutesDetails } from './routes.details.util';
import { GenerateSegmentedRoutes, GeoJsonLineString, IResponse, ParsedResponse, ParsedRoute, Path, Waypoint } from './routes.types';
import * as turf from '@turf/turf'

export const parsedRoutes = (
  path: Path,
  waypoints: Waypoint[],
  distanceToPOI: number = 1000
): ParsedRoute => {
  const encodedPolyline = path.points;
  const decodedPolyline = decodePolyline(encodedPolyline);
  const simplifiedPolyline = simplifyPolyline(decodedPolyline, 17)
  const cleanedPolyline = logPolyline(encodedPolyline);

  const originalGeoJSON: GeoJsonLineString = {
    type: 'LineString',
    coordinates: decodedPolyline.map(coord => [coord[1], coord[0]]) as [number, number][],
  };
  const simplifiedGeoJSON = simplifyGeoJSONLineString(originalGeoJSON, 0.01);
  // Ampliar el bbox
  let bbox = path.bbox;
  bbox = expandBBox(bbox, distanceToPOI);
  // Obtener puntos de interés dentro del bbox
  const POIsWithinBBox = getPOIsWithinDistanceFromLine(simplifiedGeoJSON, mockedPOIs, distanceToPOI);
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
    POIs: POIsWithinBBox,
    complete_info: generateRoutesDetails(path, europeCountriesISO, decodedPolyline),  //descomentar también de parsedRoute
  };

  return finalResponse;
};

export const handleErrorResponse = (response: Response): IResponse<ParsedRoute> => {
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
  geojsonLineString: GeoJsonLineString,
  tolerance: number
): GeoJsonLineString => {
  const lineString = turf.lineString(geojsonLineString.coordinates);
  const simplified = turf.simplify(lineString, { tolerance });

  return {
    type: simplified.geometry.type,
    coordinates: simplified.geometry.coordinates as [number, number][],
  };
};

export const expandBBox = (bbox: [number, number, number, number], distance: number): [number, number, number, number]=> {
 
  const bboxPolygon = turf.bboxPolygon(bbox);
  const expandedPolygon = turf.buffer(bboxPolygon, distance, { units: 'meters' });
  const expandedBBox = turf.bbox(expandedPolygon);

  return expandedBBox as [number, number, number, number];
}

const getPOIsWithinDistanceFromLine = (
  route: GeoJsonLineString,
  poIsArray: { latitude: number, longitude: number }[],
  maxDistance: number
): { latitude: number, longitude: number }[] => {
  return poIsArray.filter(POI => {
    const point = turf.point([POI.longitude, POI.latitude]);
    const lineString = turf.lineString(route.coordinates);
    const distanceFromLine = turf.pointToLineDistance(point, lineString, { units: 'meters' });
    return distanceFromLine <= maxDistance;
  });
}


export const generateSegmentedRoutes = (
{   start,
    end,
    waypoints} : GenerateSegmentedRoutes
   ): [number, number][][] => {
 const segments: [number, number][][] = [] 

 if(waypoints.length === 0){
  segments.push([start, end])
 } else {
  let previousPoint = start
  
  waypoints.forEach(waypoint => {
    const currentPoint: [number, number] = [parseFloat(waypoint.lng), parseFloat(waypoint.lat)]
    segments.push([previousPoint, currentPoint])
    previousPoint = currentPoint
  })
  segments.push([previousPoint, end])
 }

  return segments
  }
