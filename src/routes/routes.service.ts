import { Injectable } from "@nestjs/common";
import * as dotenv from "dotenv";
import { writeFileSync } from "fs";
import { validateRequestPayload } from "../routes/validation.utils";
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
  }: RoutesRequest): Promise<IResponse<ParsedResponse>> {
    const apiKey = process.env.GRAPH_HOPPER_API_KEY;

    const requestPayload = {
      points: [
        [parseFloat(startLng), parseFloat(startLat)] as [number, number],
        ...waypoints.map(
          (wp) => [parseFloat(wp.lng), parseFloat(wp.lat)] as [number, number]
        ),
        [parseFloat(endLng), parseFloat(endLat)] as [number, number],
      ],
      profile: "car",
      details: ["max_speed", "toll", "country"],
      instructions: false,
      calc_points: true,
    };

    //TODO

    //algoritmo ruta alternativa. si ve puntos intermedios que saque rutas alternativas. según la documentación no puede hacerse y al probar da 400 bad request
    //probar a pasarle más de un punto.más de dos puntos en principio no saca. confirmado, no se pueden meter waypoints
    //a. no sacar más waypoints
    //b. partirlas waypoints serian puntos finales e iniciales


    //pruebas. 
    //meter muchos puntos, hacer rutas muy largas, punto en el agua a ver qué devuelve ---->
    //punto de ruta no válido ---->
    //ruta imposible por medio de transporte ---->
    //aislar los máximos errores posibles ---->
    //qué inputs son sensibles al fallo ---->
    //si paso x me devuelve y  ---->

    // Configuración para rutas alternativas si hay dos puntos (inicio y fin) sin waypoints intermedios ----> sí funciona
    if (requestPayload.points.length <= 2){
      
      requestPayload["alternative_route.max_paths"]= 2
      requestPayload['algorithm'] = "alternative_route"
    } 

    if (!validateRequestPayload(requestPayload)) {
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

      //Lógica para obtener cleanedpoints en la terminal y así poder rescatar el string
      // if (data && data.paths.length > 0) {
      //   data.paths.forEach((path) => {
      //     if (path.points) {
      //       const cleanedPoints = logPolyline(path.points);
      //       console.log(`Points: `,cleanedPoints)
      //     }
      //   });
      // } else {
      //   console.error('No paths found in response');
      // }

      if (response.status !== 200) return handleErrorResponse(response);

      if (!data?.paths?.length) return { ok: false, error: "No routes found" };

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
