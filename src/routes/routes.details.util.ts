import { completePoint, Path } from "./routes.types";

export const generateRoutesDetails = ( 
    path: Path,
    europeCountriesISO: { [key: string]: string },
    decodedPolyline: [number, number][],
): completePoint[] =>{
  const speedDetails = path.details?.max_speed || [];
  const tollDetails = path.details?.toll || [];
  const countryDetails = path.details?.country || [];

    return decodedPolyline.map(
    (coord: [number, number], index: number) => {
      const actualSpeedDetail = speedDetails[0];
      const actualTollDetail = tollDetails[0];
      const actualCountryDetail = countryDetails[0];
      if (index + 1 > actualSpeedDetail?.[1]) speedDetails?.shift();
      if (index + 1 > actualCountryDetail?.[1]) tollDetails?.shift();
      if (index + 1 > actualTollDetail?.[1]) countryDetails?.shift();
      
      const speed = actualSpeedDetail?.[2] || null;
      const toll = actualTollDetail?.[2] === 'yes';
      const country = actualCountryDetail?.[2];

      return {
        latitude: coord[1], // formato Geojson
        longitude: coord[0],
        max_speed: speed, // TODO: Default 0 hasta ver de dónde sacar el dato
        toll: toll,
        country: europeCountriesISO[country],
      } as completePoint;
    },
  );  
}