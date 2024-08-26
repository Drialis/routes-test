import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { decodePolyline, logPolyline } from './polyline.utils';
import { RoutesRequest } from './routes.controller';
import { ParsedResponse, completePoint, GraphhopperResponse } from './routes.types';
import { CountryService } from './country.service';
import { validateRequestPayload } from '../routes/validation.utils';

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
                [parseFloat(startLng), parseFloat(startLat)] as [number, number],
                ...waypoints.map(wp => [parseFloat(wp.lng), parseFloat(wp.lat)] as [number, number]),
                [parseFloat(endLng), parseFloat(endLat)] as [number, number]
            ],
            profile: 'car',
            details: ['max_speed', 'toll', 'country'],
            instructions: true,
            calc_points: true
        };

        if (!validateRequestPayload(requestPayload)) {
            throw new Error('Invalid payload');
        }

        console.log('Request Payload:', requestPayload);

        try {
            const response = await fetch(`https://graphhopper.com/api/1/route?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestPayload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: GraphhopperResponse = await response.json();

            console.log('Response Data:', data);

            const encodedPolyline = data.paths[0].points;
            const cleanedPolyline = logPolyline(encodedPolyline);
            const decodedPolyline = decodePolyline(encodedPolyline);

            const speedDetails = data.paths[0].details?.max_speed || [];
            const tollDetails = data.paths[0].details?.toll || [];
            const countryDetails = data.paths[0].details?.country || [];

            const completeInfo: completePoint[] = decodedPolyline.map((coord: [number, number], index: number) => {
                const speed = speedDetails[index] !== undefined ? speedDetails[index] : null;
                const toll = tollDetails[index] !== undefined ? tollDetails[index] : null;
                const country = countryDetails[index] || '';

                return {
                    latitude: coord[1],                                 // formato Geojson
                    longitude: coord[0],
                    max_speed: Array.isArray(speed) ? speed : [speed],  // Si es un array, lo usa; si no, lo embebe en un array
                    avg_speed: 0,                                       // TODO: Default 0 hasta ver de dónde sacar el dato
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
            console.log('Error getting the route:', error);
            if (error.message.includes('Invalid payload')) {
                throw new Error('Invalid payload');
            }
            throw new Error('The route could not be obtained');
        }
    }
}