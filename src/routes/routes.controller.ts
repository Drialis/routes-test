import { Body, Controller, Post, Res } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { Response } from 'express';

interface RoutesRequest {
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
                waypoints = [],
            } = body

            const polyline = await this.routesService.getPolyline({ startLat, startLng, waypoints, endLat, endLng });
            return res.status(200).send(polyline);
        } catch (error) {
            console.log('new error in body', error)
            return res.status(500).send('controller error')
        }
    }
}