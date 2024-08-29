import { Injectable } from "@nestjs/common";
import * as dotenv from "dotenv";
import { writeFileSync } from "fs";
import { validateCoordinates, validateLandCoordinates, validateRequestPayload } from "../routes/validation.utils";
import {
  GraphhopperResponse,
  IResponse,
  ParsedResponse,
  RoutesRequest,
} from "./routes.types";
import { handleErrorResponse, parsedRoutes } from "./routes.utils";
import { logPolyline } from "./polyline.utils";

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

    //Validación de coordenadas antes de requestPayload ---> testeado, ok
    const coordinates: [number, number][] = [
        [parseFloat(startLat), parseFloat(startLng)],
        [parseFloat(endLat), parseFloat(endLng)],
        ...waypoints.map((wp) => [parseFloat(wp.lng), parseFloat(wp.lat)] as [number, number])
    ];

if(!validateCoordinates(coordinates)){
 return { ok: false, error: "400: Invalid coordinates provided" }
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

    const requestPayload: any = {
      points: [
        [parseFloat(startLng), parseFloat(startLat)] as [number, number],
        ...waypoints.map(
          (wp) => [parseFloat(wp.lng), parseFloat(wp.lat)] as [number, number]
        ),
        [parseFloat(endLng), parseFloat(endLat)] as [number, number],
      ],
      profile,
      details: ["max_speed", "toll", "country"],
      instructions: false,
      calc_points: true,
    };


//TODO

    //algoritmo ruta alternativa. si ve puntos intermedios que saque rutas alternativas. ---> según la documentación no puede hacerse con waypoints solo con inicio y fin y al probar da 400 bad request
    //probar a pasarle más de un punto.más de dos puntos en principio no saca. ---> confirmado, no se pueden meter waypoints

    //a. no sacar más waypoints
    
    //TODO: TEST
    //meter muchos puntos, 
    //hacer rutas muy largas ----> ahora no devuelve points sino una polyline y no genera varios paths
    //        requestPayload['alternative_route.max_share_factor'] = 0.6; ----> modificando el max_share tampoco varía
    
    
    //aislar los máximos errores posibles    ---->
    //punto en el agua a ver qué devuelve    ----> función de validación a través de la api nominatim.openstreetmap: ok (la precisión no es exacta, se puede mejorar buscando otra api)
    //punto de ruta no válido                ----> función de validación de coordenadas: ok
    //ruta imposible por medio de transporte ----> en principio necesitaríamos un custom model profile que todavía está en desarrollo en la api de graphhopper, solo disponible actualmente en profile car y para clientes premium


    //qué inputs son sensibles al fallo      ----> rutas cuya separación entre un path y otro graph hopper considera que no debe ejecutar porque son demasiado similares
    //si paso x me devuelve y                ----> aquí suele dar un 200 y se queda tan ancho
    
    // Configuración para rutas alternativas si hay dos puntos (inicio y fin) sin waypoints intermedios ----> no funciona a no ser que sean dos puntos muy cercanos
    
    //b. partir las waypoints serian puntos finales e iniciales

    if (requestPayload.points.length <= 2){
      
      requestPayload["alternative_route.max_paths"]= 2
      requestPayload['algorithm'] = "alternative_route"
      requestPayload['alternative_route.max_share_factor'] = 0.6;
    } 

    if (!validateRequestPayload(requestPayload)) {
      console.log("Invalid Payload:", requestPayload);
      return { ok: false, error: "Invalid payload" };
    }

    console.log("Request Payload:", requestPayload);

    try {
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
      console.log(response.status, response.statusText);

      const data: GraphhopperResponse | null = await response
        .json()
        .catch(console.error);

      writeFileSync("response.json", JSON.stringify(data));

      // lógica para implementar los points en la terminal ya limpios de escapes. 
      // if (data && data.paths.length > 0) {
      //   data.paths.forEach((path) => {
      //     if (path.points) {
      //       const cleanedPoints = logPolyline(path.points);
      //       console.log(`Points:`,cleanedPoints)
      //     }
      //   });
      // } else {
      //   console.error('No paths found in response');
      // }

      if (response.status !== 200) {
        return handleErrorResponse(response)
      }

      if (!data?.paths?.length) {
        if (validTransportProfiles.includes(profile)) {
          return { 
            ok: false, 
            error: `400: Route is not possible with profile ${profile}. Consider checking coordinates or selecting a different profile.` };
        } else{
          return{
            ok:false,
            error: `400: Route is not possible with profile ${profile}.`
          }
        }
      }
        return {
        ok: true,
        data: {
          routes: data.paths.map((path) => parsedRoutes(path, waypoints)),
        },
      };
    } catch (error) {
      console.log("Error getting the route:", error);
      return { ok: false };
    }
  }
}
