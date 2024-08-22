import { Controller, Get, Query, Res } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { Response } from 'express';

@Controller('routes')
export class RoutesController {
    constructor(private readonly routesService: RoutesService) { }

    @Get()
    async getRoute(
        @Res() res: Response,
        @Query('startLat') startLat: string,
        @Query('startLng') startLng: string,
        @Query('endLat') endLat: string,
        @Query('endLng') endLng: string,
        @Query('waypointLat') waypointLat?: string,
        @Query('waypointLng') waypointLng?: string,
    ): Promise<Response> {

        try {
            // Lógica para obtener la polyline entre A y B pasando por C
            const polyline = await this.routesService.getPolyline({ startLat, startLng, endLat, endLng, waypointLat, waypointLng });
            return res.status(200).send(polyline);
        } catch (error) {
            console.log('new error in query', error)
            return res.status(500).send('controller error')
        }
    }
}
