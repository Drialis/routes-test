export const validateCoordinates = (coordinates: [number, number][]): boolean => {
    return coordinates.every(([lng, lat]) =>
        !isNaN(lng) && !isNaN(lat) &&
        typeof lng === 'number' && typeof lat === 'number' &&
        lng >= -180 && lng <= 180 &&
        lat >= -90 && lat <= 90
    );
}

export const validateLandCoordinates = async (latLand: number, lngLand: number): Promise<boolean> => {

const urlNominatim = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latLand}&lon=${lngLand}&addressdetails=1`

try {
    const response = await fetch(urlNominatim);
    const data = await response.json();
    return !(data.error || !data.address || data.address.country === undefined);
  } catch (error) {
    console.log('Error fetching location data:', error);
    return false;
  }
}

export const validateRequestPayload = (payload: {
    points: [number, number][],
    profile?: string,
    details?: string[],
    instructions?: boolean,
    calc_points?: boolean
}): boolean => {
    const { points, profile, details, instructions, calc_points } = payload;
    if (!Array.isArray(points) || points.length < 2) {
        return false;
    }
    if (!validateCoordinates(points)) {
        return false;
    }
    if (profile !== undefined && typeof profile !== 'string') {                 //TODO: el medio de transporte utilizado, se puede revisar Graph Hopper para ver cómo sacar la lista
        return false;
    }
    if (details !== undefined && (!Array.isArray(details) || !details.every(detail => typeof detail === 'string'))) {
        return false;
    }
    if (instructions !== undefined && typeof instructions !== 'boolean') {      //si se incluyen o no las instrucciones de navegación (ej.gira a la dcha)
        return false;
    }
    if (calc_points !== undefined && typeof calc_points !== 'boolean') {        //son los waypoints
        return false;
    }
    return true;
}

