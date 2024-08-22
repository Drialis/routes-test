import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { decodePolyline, simplifyPolyline } from './polyline.utils';

dotenv.config();

interface PolylineResponse {
    polyline: string,
    coordinates: [number, number][],
    waypoint: [number, number]
}

interface PolylinePayload {
    startLat: string,
    startLng: string,
    endLat: string,
    endLng: string,
    waypointLat?: string,
    waypointLng?: string,
}

@Injectable()
export class RoutesService {
    async getPolyline(
        { startLat,
            startLng,
            endLat,
            endLng,
            waypointLat,
            waypointLng }: PolylinePayload
    ): Promise<PolylineResponse> {
        const apiKey = process.env.GRAPH_HOPPER_API_KEY;
        let url = `https://graphhopper.com/api/1/route?point=${startLat},${startLng}&point=${endLat},${endLng}&vehicle=car&locale=es&key=${apiKey}`;

        if (waypointLat && waypointLng) {
            url += `&point=${waypointLat},${waypointLng}`;
        }
        console.log('Request URL:', url);

        try {
            const response = await axios.get(url);
            const data = response.data;

            console.log('Response Data:', data);

            const encodedPolyline = data.paths[0].points;
            const decodedPolyline = decodePolyline(encodedPolyline);

            const waypoint: [number, number] | null = waypointLat && waypointLng
                ? [parseFloat(waypointLat), parseFloat(waypointLng)]
                : null;

            // const simplifiedPolyline = simplifyPolyline(decodedPolyline, 2);
            // const simplifiedCoordinates = decodePolyline(simplifiedPolyline);

            return {
                polyline: encodedPolyline,
                coordinates: decodedPolyline,
                //coordinates: simplifiedCoordinates,
                waypoint: waypoint,
            };

        } catch (error) {
            console.log('Error al obtener la ruta:', error);
            throw new Error('No se pudo obtener la ruta');
        }
    }
}
