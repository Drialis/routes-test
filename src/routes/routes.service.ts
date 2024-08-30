import { Injectable } from "@nestjs/common";
import * as dotenv from "dotenv";
import { writeFileSync } from "fs";
import { isVehicleValidForRoute, validateCoordinates, validateLandCoordinates, validateRequestPayload } from "../routes/validation.utils";
import {
  GraphhopperResponse,
  IResponse,
  ParsedResponse,
  ParsedRoute,
  RoutePayload,
  RoutesRequest,
} from "./routes.types";
import { handleErrorResponse, parsedRoutes } from "./routes.utils";
import { distance } from "@turf/turf";

dotenv.config();

@Injectable()
export class RoutesService {
  constructor() {}

  async getPolyline({
    startLat,
    startLng,
    endLat,
    endLng,
    waypoints = [],
    profile = "car"
  }: RoutesRequest): Promise<IResponse<ParsedResponse>> {
    const apiKey = process.env.GRAPH_HOPPER_API_KEY;

    const coordinates: [number, number][] = [
        [parseFloat(startLat), parseFloat(startLng)],
        [parseFloat(endLat), parseFloat(endLng)],
        ...waypoints.map((wp) => [parseFloat(wp.lng), parseFloat(wp.lat)] as [number, number])
    ];

    if (!validateCoordinates(coordinates)) {
      return { ok: false, error: "400: Invalid coordinates provided" };
    }

    for (const [lat, lng] of coordinates) {
      const onLand = await validateLandCoordinates(lat, lng);
      if (!onLand) {
        return { ok: false, error: "400: One or more coordinates are not on land" };
      }
    }

    const validTransportProfiles = [
      "car", 
      "car_avoid_motorway", 
      "car_avoid_ferry", 
      "car_avoid_toll", 
      "small_truck", 
      "truck", 
      "scooter", 
      "foot", 
      "hike", 
      "bike", 
      "mtb", 
      "racingbike"
    ];

    if (!validTransportProfiles.includes(profile)) {
      return { ok: false, error: `400: Invalid profile ${profile}` };
    }

    try {
      // Generar las rutas individuales
      const segments: ParsedRoute[] = (await this.generateSegmentedRoutes(
        [parseFloat(startLng), parseFloat(startLat)],
        [parseFloat(endLng), parseFloat(endLat)],
        waypoints,
        profile,
        apiKey
      ));

      return { ok: true, data: { routes: segments } };

    } catch (error) {
      console.log("Error getting the route:", error);
      return { ok: false, error: error.message };
    }
  }

  // Nueva función para manejar la generación de rutas por segmentos
  private async generateSegmentedRoutes(
    start: [number, number],
    end: [number, number],
    waypoints: { lat: string, lng: string }[],
    profile: string,
    apiKey: string
  ): Promise<ParsedRoute[]> {
    const segments: ParsedRoute[] = [];
    let currentStart: [number, number] = start;

    for (let i = 0; i <= waypoints.length; i++) {
      const currentEnd: [number, number] = i < waypoints.length ? 
        [parseFloat(waypoints[i].lng), parseFloat(waypoints[i].lat)] : 
        end;

      const requestPayload: RoutePayload = {
        points: [currentStart, currentEnd],
        profile,
        details: ["max_speed", "toll", "country"],
        instructions: false,
        calc_points: true,
      };

      const response = await this.fetchRoute(requestPayload, apiKey);

      if (response.ok && response.data) {
        segments.push(response.data);
      } else {
        throw new Error("Failed to fetch route for segment");
      }

      currentStart = currentEnd;
    }

    return segments;
  }

  // Función para hacer la llamada a la API
  private async fetchRoute(
    requestPayload: RoutePayload,
    apiKey: string
  ): Promise<IResponse<ParsedRoute>> {
    const response = await fetch(
      `https://graphhopper.com/api/1/route?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      }
    );

    if (response.status !== 200) {
      return handleErrorResponse(response);
    }

    const data: GraphhopperResponse | null = await response
    .json()
    .catch(console.error);

     writeFileSync("response.json", JSON.stringify(data));

    if (data && data.paths && data.paths.length > 0) {
      const parsedRoute: ParsedRoute =  parsedRoutes(data.paths[0], []);
      return { ok: true, data: parsedRoute };
    } else {
      return { ok: false, error: "No routes found in the response." };
    }
  }
}

//TODO

    //algoritmo ruta alternativa. si ve puntos intermedios que saque rutas alternativas. ---> según la documentación no puede hacerse con waypoints solo con inicio y fin y al probar da 400 bad request
    //probar a pasarle más de un punto.más de dos puntos en principio no saca.           ---> confirmado, no se pueden meter waypoints

    //a. no sacar más waypoints
    
    //TODO: TEST
    //meter muchos puntos, 
    //hacer rutas muy largas ----> ahora no devuelve points sino una polyline y no genera varios paths
    //        requestPayload['alternative_route.max_share_factor'] = 0.6; ----> modificando el max_share tampoco varía
    
    
    //aislar los máximos errores posibles    ---->
    //punto en el agua a ver qué devuelve    ----> función de validación a través de la api nominatim.openstreetmap: ok (la precisión no es exacta, se puede mejorar buscando otra api)
    //punto de ruta no válido                ----> función de validación de coordenadas: ok
    //ruta imposible por medio de transporte ----> en principio necesitaríamos un custom model profile que todavía está en desarrollo en la api de graphhopper, solo disponible actualmente en profile car y para clientes premium
    //                                       ----> condicional para verificar que la ruta sea válida con cada vehículo

    //qué inputs son sensibles al fallo      ----> rutas cuya separación entre un path y otro graph hopper considera que no debe ejecutar porque son demasiado similares
    //si paso x me devuelve y                ----> aquí suele dar un 200 y se queda tan ancho
    
    // Configuración para rutas alternativas si hay dos puntos (inicio y fin) sin waypoints intermedios 
    //         ----> no funciona a no ser que sean dos puntos muy cercanos
    
    //b. partir las waypoints serian puntos finales e iniciales
    //b.1 hacer que cada waypoint sea una ruta independiente      ----> ok
    //b.2 longitud de ruta máxima y waypoints máximos             ----> 