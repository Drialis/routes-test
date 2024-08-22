import { Controller, Get, Query } from '@nestjs/common';
import { RoutesService } from './routes.service';

@Controller('routes')
export class RoutesController {
    constructor(private readonly routesService: RoutesService) { }

    @Get()
    async getRoute(
        @Query('startLat') startLat: string,
        @Query('startLng') startLng: string,
        @Query('endLat') endLat: string,
        @Query('endLng') endLng: string,
        @Query('waypointLat') waypointLat?: string,
        @Query('waypointLng') waypointLng?: string,
    ): Promise<{ polyline: string }> {
        // Lógica para obtener la polyline entre A y B pasando por C
        const polyline = await this.routesService.getPolyline(startLat, startLng, endLat, endLng, waypointLat, waypointLng);
        return { polyline };
    }
}
