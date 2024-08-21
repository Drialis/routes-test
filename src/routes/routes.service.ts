import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { decodePolyline } from './polyline.utils';

dotenv.config();

@Injectable()
export class RoutesService {
    async getPolyline(startLat: string, startLng: string, endLat: string, endLng: string): Promise<string> {
        // Llamada a la API de GraphHopper para obtener la ruta
        const apiKey = process.env.GRAPH_HOPPER_API_KEY;
        const url = `https://graphhopper.com/api/1/route?point=${startLat},${startLng}&point=${endLat},${endLng}&vehicle=car&locale=es&key=${apiKey}`;
        try {
            const response = await axios.get(url);
            const data = response.data;

            const encodedPolyline = data.paths[0].points;
            const decodedPolyline = decodePolyline(encodedPolyline);


            return JSON.stringify(decodedPolyline);
        } catch (error) {
            console.error('Error al obtener la ruta:', error);
            throw new Error('No se pudo obtener la ruta');
        }
    }
}
