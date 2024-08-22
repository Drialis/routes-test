import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { decodePolyline } from './polyline.utils';

dotenv.config();

@Injectable()
export class RoutesService {
    async getPolyline(
        startLat: string,
        startLng: string,
        endLat: string,
        endLng: string,
        waypointLat?: string,
        waypointLng?: string,
    ): Promise<string> {
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

            const waypoint = waypointLat && waypointLng ? [parseFloat(waypointLat), parseFloat(waypointLng)] : null;
            const highlightedPolyline = decodedPolyline.map((point) => {
                return waypoint && point[0] === waypoint[0] && point[1] === waypoint[1] ? point : point;
            });

            const simplifiedPolyline = highlightedPolyline.map(point => point);

            return JSON.stringify({
                polyline: simplifiedPolyline,
                waypoint: waypoint,
            });

        } catch (error) {
            console.error('Error al obtener la ruta:', error);
            throw new Error('No se pudo obtener la ruta');
        }
    }
}
