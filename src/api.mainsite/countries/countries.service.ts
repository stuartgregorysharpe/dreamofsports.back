import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CErrorsService } from "src/common/services/errors.service";
import { CCountry } from "src/model/entities/country";
import { CLang } from "src/model/entities/lang";
import { IKeyValue } from "src/model/keyvalue.interface";
import { Repository } from "typeorm";
import { IResponse } from "src/model/dto/response.interface";
import { ICountrySimple } from "./dto/country.simple.interface";

@Injectable()
export class CCountriesService{
    constructor(
        @InjectRepository(CCountry) private countryRepository: Repository<CCountry>,
        @InjectRepository(CLang) private langRepository: Repository<CLang>,
        private errorsService: CErrorsService,
    ) {}

    public async all(): Promise<IResponse<IKeyValue<ICountrySimple[]>>> {
        try {
            const countries = await this.countryRepository.find({relations: ["translations"]});
            const langs = await this.langRepository.find({where: {active: true}});
            const data = this.buildCountries(countries, langs);
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CCountriesService.all", err);
            return {statusCode: 500, error};
        }
    }

    /////////////////
    // utils
    /////////////////

    private buildCountries(countries: CCountry[], langs: CLang[]): IKeyValue<ICountrySimple[]> {
        const data: IKeyValue<ICountrySimple[]> = {};

        for (let lang of langs) {
            data[lang.slug] = countries.map(country => ({
                id: country.id,
                name: country.translations.find(t => t.lang_id === lang.id).name,
            }));
            data[lang.slug].sort((a, b) => a.name.localeCompare(b.name));
        }

        return data;
    }
}
