import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { decodePolyline, logPolyline } from './polyline.utils';
import { RoutesRequest, Waypoint } from './routes.controller';

dotenv.config();

interface GeoJsonLineString {
    type: "Feature";
    geometry: {
        type: "LineString";
        coordinates: [number, number][];
    };
    properties: Record<string, any>;
}

@Injectable()
export class RoutesService {
    async getPolyline(
        { startLat,
            startLng,
            endLat,
            endLng,
            waypoints = [],
        }: RoutesRequest
    ): Promise<GeoJsonLineString> {
        const apiKey = process.env.GRAPH_HOPPER_API_KEY;

        const requestPayload = {
            points: [
                [parseFloat(startLng), parseFloat(startLat)],
                ...waypoints.map(wp => [parseFloat(wp.lng), parseFloat(wp.lat)]),
                [parseFloat(endLng), parseFloat(endLat)]
            ],
            profile: 'car',
            details: ['max_speed'],
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
            const waypointCoordinates = waypoints.map(wp => [parseFloat(wp.lat), parseFloat(wp.lng)] as [number, number]);


            const speeds = data.paths[0].details?.max_speed || [];

            const finalResponse: GeoJsonLineString = {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: decodedPolyline.map(coord => [coord[1], coord[0]])
                },
                properties: {
                    waypoints: waypointCoordinates,
                    ...(speeds.length > 0 && { speeds })
                }
            };

            console.log('Postman Response:', finalResponse, cleanedPolyline);

            return finalResponse;

        } catch (error) {
            console.log('Error al obtener la ruta:', error);
            throw new Error('No se pudo obtener la ruta');
        }
    }
}
