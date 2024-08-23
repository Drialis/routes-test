import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { decodePolyline, logPolyline, simplifyPolyline } from './polyline.utils';

dotenv.config();

interface PolylineResponse {
    polyline: string,
    coordinates: [number, number][],
    waypoints: [number, number][]
}

interface PolylinePayload {
    startLat: string,
    startLng: string,
    endLat: string,
    endLng: string,
    waypoints?: { lat: string, lng: string }[]
}

@Injectable()
export class RoutesService {
    async getPolyline(
        { startLat,
            startLng,
            endLat,
            endLng,
            waypoints = [] }: PolylinePayload
    ): Promise<PolylineResponse> {
        const apiKey = process.env.GRAPH_HOPPER_API_KEY;
        let url = `https://graphhopper.com/api/1/route?point=${startLat},${startLng}&vehicle=car&locale=es&key=${apiKey}`;
        if (waypoints.length > 0) {
            waypoints.forEach(waypoint => {
                url += `&point=${waypoint.lat},${waypoint.lng}`;
            });
        }
        url += `&point=${endLat},${endLng}`

        console.log('Request URL:', url);

        try {
            const response = await axios.get(url);
            const data = response.data;

            console.log('Response Data:', data);

            const encodedPolyline = data.paths[0].points;

            const cleanedPolyline = logPolyline(encodedPolyline);
            const decodedPolyline = decodePolyline(encodedPolyline);
            const waypointCoordinates = waypoints.map(wp => [parseFloat(wp.lat), parseFloat(wp.lng)] as [number, number]);
            const finalResponse: PolylineResponse = {
                polyline: cleanedPolyline,
                coordinates: decodedPolyline,
                waypoints: waypointCoordinates,
            };

            console.log('Postman Response:', finalResponse);

            return finalResponse;

        } catch (error) {
            console.log('Error al obtener la ruta:', error);
            throw new Error('No se pudo obtener la ruta');
        }
    }
}
