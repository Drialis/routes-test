import { Injectable } from '@nestjs/common';
import iso3ToIso2Data from '../assets/iso3_to_iso2.json';

@Injectable()
export class CountryService {
    private readonly iso3ToIso2Map: Record<string, string>;

    constructor() {
        this.iso3ToIso2Map = iso3ToIso2Data;
    }

    getIso2FromIso3(iso3: string): string {
        return this.iso3ToIso2Map[iso3] || '';
    }
}