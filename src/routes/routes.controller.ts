import { Body, Controller, Post, Res } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { Response } from 'express';

export interface RoutesRequest {
    startLat: string,
    startLng: string,
    endLat: string,
    endLng: string,
    waypoints?: Waypoint[]
}

export interface Waypoint {
    lat: string,
    lng: string
}

@Controller('routes')
export class RoutesController {
    constructor(private readonly routesService: RoutesService) { }

    @Post()
    async getRoute(
        @Res() res: Response,
        @Body() body: RoutesRequest
    ): Promise<Response> {
        try {
            const {
                startLat,
                startLng,
                endLat,
                endLng,
                waypoints = []
            } = body;

            const polylineResponse = await this.routesService.getPolyline({ startLat, startLng, waypoints, endLat, endLng });
            if (!polylineResponse?.ok) {
                return res.status(400).send(polylineResponse?.error)
            }
            return res.status(200).send(polylineResponse.data)
        } catch (error) {
            console.log('new error in body', error);
            return res.status(500).send('controller error');
        }
    }
}

