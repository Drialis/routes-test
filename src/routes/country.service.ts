import { Injectable } from '@nestjs/common';
import { europeCountriesISO } from '../assets/europeCountriesISO';

@Injectable()
export class CountryService {
    private europeCountriesISO = europeCountriesISO;

    getIso2FromIso3(iso3: string): string {
        return this.europeCountriesISO[iso3] || '';
    }
}
