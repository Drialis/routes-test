export const validateCoordinates = (coordinates: [number, number][]): boolean => {
    return coordinates.every(([lng, lat]) =>
        !isNaN(lng) && !isNaN(lat) &&
        typeof lng === 'number' && typeof lat === 'number'
    );
}

export const validateRequestPayload = (payload: any): boolean => {
    const { points } = payload;

    if (!Array.isArray(points) || points.length < 2) {
        return false;
    }

    return validateCoordinates(points);
}
