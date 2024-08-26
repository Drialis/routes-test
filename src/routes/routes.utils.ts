import { europeCountriesISO } from "../assets/europeCountriesISO";
import { decodePolyline, logPolyline } from "./polyline.utils";
import { Waypoint } from "./routes.controller";
import { completePoint, ParsedRoute, Path } from "./routes.types";

export const parsedRoutes = (path: Path, waypoints: Waypoint[]): ParsedRoute => {

       const encodedPolyline = path.points;
            const cleanedPolyline = logPolyline(encodedPolyline);
            const decodedPolyline = decodePolyline(encodedPolyline);

            const speedDetails = path.details?.max_speed || [];
            const tollDetails = path.details?.toll || [];
            const countryDetails = path.details?.country || [];

            const completeInfo: completePoint[] = decodedPolyline.map((coord: [number, number], index: number) => {
                const actualSpeedDetail = speedDetails[0]
                  const actualTollDetail = tollDetails[0]
                  const actualCountryDetail = countryDetails[0]
                if(index + 1 > actualSpeedDetail?.[1]) actualSpeedDetail?.shift()
                if(index + 1 > actualCountryDetail?.[1]) actualCountryDetail?.shift()
                if(index + 1 > actualTollDetail?.[1]) actualTollDetail?.shift()

                const speed = actualSpeedDetail?.[2] || null
                const toll = actualTollDetail?.[2] === 'yes'
                const country = actualCountryDetail?.[2] 

                return {
                    latitude: coord[1],                                    // formato Geojson
                    longitude: coord[0],
                    max_speed: speed,                                      // TODO: Default 0 hasta ver de dónde sacar el dato
                    toll: toll,
                    country: europeCountriesISO[country]
                };
            });

            const waypointCoordinates = waypoints.map(wp => [parseFloat(wp.lat), parseFloat(wp.lng)] as [number, number]);

            const finalResponse: ParsedRoute = {
                distance: path.distance || 0,
                time: path.time || 0,
                geojson: {
                    type: 'LineString',
                    coordinates: decodedPolyline.map(coord => [coord[1], coord[0]])
                },
                polyline: cleanedPolyline,
                elevation: {
                    ascend: path.ascend || 0,
                    descend: path.descend || 0,
                },
                waypoints: waypointCoordinates,
                complete_info: completeInfo
            };

            console.log('Postman Response:', finalResponse, cleanedPolyline);
            return finalResponse
}