import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { RoutesRequest } from './routes.controller';
import { ParsedResponse, completePoint, GraphhopperResponse, IResponse } from './routes.types';
import { CountryService } from './country.service';
import { validateRequestPayload } from '../routes/validation.utils';
import { parsedRoutes } from './routes.utils';

dotenv.config();

@Injectable()
export class RoutesService {
    constructor(private readonly countryService: CountryService) { }

    async getPolyline(
        { startLat, startLng, endLat, endLng, waypoints = [] }: RoutesRequest
    ): Promise<IResponse<ParsedResponse>> {
        const apiKey = process.env.GRAPH_HOPPER_API_KEY;

        const requestPayload = {
            points: [
                [parseFloat(startLng), parseFloat(startLat)] as [number, number],
                ...waypoints.map(wp => [parseFloat(wp.lng), parseFloat(wp.lat)] as [number, number]),
                [parseFloat(endLng), parseFloat(endLat)] as [number, number]
            ],
            profile: 'car',
            details: ['max_speed', 'toll', 'country'],
            instructions: false,
            calc_points: true
        };

        if (!validateRequestPayload(requestPayload)) {
            return { ok: false, error: 'Invalid payload' }
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

            console.log(response.status, response.statusText)

            const data: GraphhopperResponse | null = await response.json().catch(console.error);

            if (response.status !== 200 || !data?.paths?.length) {
                return { ok: false };

                //TODO: handle error con las opciones de graph hopper
            }

            console.log('Response Data:', data);

     

            return { ok: true, data: {routes: data.paths.map((path) => parsedRoutes(path, waypoints))}};


        } catch (error) {
            console.log('Error getting the route:', error);
            return { ok: false }
        }
    }
}