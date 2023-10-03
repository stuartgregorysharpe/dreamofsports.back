import { Controller, Param, Post, Body, UseGuards } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CCountry } from "src/model/entities/country";
import { IGetList } from "src/model/dto/getlist.interface";
import { CEditorGuard } from "src/common/services/guards/editor.guard";
import { CCountriesService } from "src/api.owner/countries/countries.service";

@Controller('api/editor/countries')
export class CCountriesController {
    constructor (private countriesService: CCountriesService) {}        
    
    @UseGuards(CEditorGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CCountry[]>> {
        return this.countriesService.chunk(dto);
    }
    
    @UseGuards(CEditorGuard)
    @Post("one/:id")
    public one(@Param("id") id: string): Promise<IResponse<CCountry>> {
        return this.countriesService.one(parseInt(id));
    }    
}
