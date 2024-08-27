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
import { expandBBox, handleErrorResponse, parsedRoutes } from "./routes.utils";

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
    distance_to_POI = 1000
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
    /* if (requestPayload.points.length <= 2){
      
      requestPayload["alternative_route.max_paths"]= 2
      requestPayload['algorithm'] = "alternative_route"
    } */

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

      if (response.status !== 200) return handleErrorResponse(response);

      if (!data?.paths?.length) return { ok: false, error: "No routes found" };

          data.paths.forEach(path => {
      path.bbox = expandBBox(path.bbox, distance_to_POI);
    });

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
