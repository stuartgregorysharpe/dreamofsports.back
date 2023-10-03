import { Controller, Post, Body, UseGuards } from "@nestjs/common";

import { CObjectsService } from "./objects.service";
import { IResponse } from 'src/model/dto/response.interface';
import { COwnerGuard } from "src/common/services/guards/owner.guard";
import { IUpdateParam } from "src/model/dto/updateparam.interface";

@Controller('api/owner/objects')
export class CObjectsController {
    constructor (private objectsService: CObjectsService) {}

    // update parameter of any object    
    @UseGuards(COwnerGuard)
    @Post("update-param")    
    public updateParam (@Body() dto: IUpdateParam): Promise<IResponse<void>> {
        return this.objectsService.updateParam(dto);
    }

    // update "egoistic" parameter of any object ("egoistic" means that only one can be true in table)   
    @UseGuards(COwnerGuard)
    @Post("update-egoistic-param")    
    public updateEgoisticParam (@Body() dto: IUpdateParam): Promise<IResponse<void>> {
        return this.objectsService.updateEgoisticParam(dto);
    }   
}
