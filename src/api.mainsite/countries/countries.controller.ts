import { Controller, Post } from "@nestjs/common";
import { IResponse } from "src/model/dto/response.interface";
import { CCountriesService } from "./countries.service";
import { IKeyValue } from "src/model/keyvalue.interface";
import { ICountrySimple } from "./dto/country.simple.interface";

@Controller('api/mainsite/countries')
export class CCountriesController {
    constructor (private countriesService: CCountriesService) {}    
    
    @Post("all")
    public all(): Promise<IResponse<IKeyValue<ICountrySimple[]>>> {
        return this.countriesService.all();
    }    
}
