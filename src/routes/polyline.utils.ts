import * as polyline from '@mapbox/polyline';


export const decodePolyline = (encoded: string): [number, number][] => {
    return polyline.decode(encoded);
};


export const encodePolyline = (coordinates: [number, number][]): string => {
    return polyline.encode(coordinates);
};

export const simplifyPolyline = (
    coordinates: [number, number][],
    precision: number,
): string => {
    const simplified: [number, number][] = [];
    coordinates.forEach((pair, i) => {
        if (i % precision === 0) {
            simplified.push(pair);
        }
    });
    return encodePolyline(simplified);
};
