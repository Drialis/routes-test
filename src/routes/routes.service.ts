import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { decodePolyline, logPolyline } from './polyline.utils';
import { RoutesRequest } from './routes.controller';
import { ParsedResponse, completePoint } from './routes.types';
import { CountryService } from './country.service';

dotenv.config();

@Injectable()
export class RoutesService {
    constructor(private readonly countryService: CountryService) { }

    async getPolyline(
        { startLat, startLng, endLat, endLng, waypoints = [] }: RoutesRequest
    ): Promise<ParsedResponse> {
        const apiKey = process.env.GRAPH_HOPPER_API_KEY;

        const requestPayload = {
            points: [
                [parseFloat(startLng), parseFloat(startLat)],
                ...waypoints.map(wp => [parseFloat(wp.lng), parseFloat(wp.lat)]),
                [parseFloat(endLng), parseFloat(endLat)]
            ],
            profile: 'car',
            details: ['max_speed', 'toll', 'country'],
            instructions: true,
            calc_points: true
        };

        console.log('Request Payload:', requestPayload);

        try {
            const response = await axios.post(`https://graphhopper.com/api/1/route?key=${apiKey}`, requestPayload);
            const data = response.data;

            console.log('Response Data:', data);

            const encodedPolyline = data.paths[0].points;
            const cleanedPolyline = logPolyline(encodedPolyline);
            const decodedPolyline = decodePolyline(encodedPolyline);

            const speedDetails = data.paths[0].details?.max_speed || [];
            const tollDetails = data.paths[0].details?.toll || [];
            const countryDetails = data.paths[0].details?.country || [];

            const completeInfo: completePoint[] = decodedPolyline.map((coord: [number, number], index: number) => {
                const speed = speedDetails[index] || 0;
                const toll = tollDetails[index] || null;
                const country = countryDetails[index] || '';

                return {
                    latitude: coord[1], // formato Geojson
                    longitude: coord[0],
                    max_speed: speed,
                    avg_speed: 0, // TODO: Default 0 hasta ver de dónde sacar el dato
                    toll: toll,
                    country: this.countryService.getIso2FromIso3(country)
                };
            });

            const waypointCoordinates = waypoints.map(wp => [parseFloat(wp.lat), parseFloat(wp.lng)] as [number, number]);

            const finalResponse: ParsedResponse = {
                distance: data.paths[0].distance || 0,
                time: data.paths[0].time || 0,
                geojson: {
                    type: 'LineString',
                    coordinates: decodedPolyline.map(coord => [coord[1], coord[0]])
                },
                polyline: cleanedPolyline,
                elevation: {
                    ascend: data.paths[0].ascend || 0,
                    descend: data.paths[0].descend || 0,
                },
                waypoints: waypointCoordinates,
                complete_info: completeInfo
            };

            console.log('Postman Response:', finalResponse, cleanedPolyline);

            return finalResponse;

        } catch (error) {
            console.log('Error al obtener la ruta:', error);
            throw new Error('No se pudo obtener la ruta');
        }
    }
}
