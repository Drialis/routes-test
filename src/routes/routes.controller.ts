import { Controller, Get, Query, Res } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { Response } from 'express';

@Controller('routes')
export class RoutesController {
    constructor(private readonly routesService: RoutesService) { }


    //TODO: pasar a método post
    @Get()
    async getRoute(
        @Res() res: Response,
        @Query('startLat') startLat: string,
        @Query('startLng') startLng: string,
        @Query('endLat') endLat: string,
        @Query('endLng') endLng: string,
        @Query('waypointLat') waypointLat: string | string[],
        @Query('waypointLng') waypointLng: string | string[]
    ): Promise<Response> {

        try {

            const latArray = Array.isArray(waypointLat) ? waypointLat : [waypointLat];
            const lngArray = Array.isArray(waypointLng) ? waypointLng : [waypointLng];
            // Lógica para la lista de waypoints
            // Asegurarse de que latArray y lngArray tengan el mismo tamaño
            if (latArray.length !== lngArray.length) {
                throw new Error('Los arrays waypointLat y waypointLng deben tener la misma longitud.');
            }

            // Crear el array de waypoints
            const waypoints = latArray.map((lat, index) => ({
                lat,
                lng: lngArray[index]
            }));

            // Lógica para obtener la polyline entre A y B pasando por C
            const polyline = await this.routesService.getPolyline({ startLat, startLng, endLat, endLng, waypoints });
            return res.status(200).send(polyline);
        } catch (error) {
            console.log('new error in query', error)
            return res.status(500).send('controller error')
        }
    }
}