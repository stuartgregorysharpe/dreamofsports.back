import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CEditorGuard } from "src/common/services/guards/editor.guard";
import { IUpdateParam } from "src/model/dto/updateparam.interface";
import { CObjectsService } from "src/api.owner/objects/objects.service";

@Controller('api/editor/objects')
export class CObjectsController {
    constructor (private objectsService: CObjectsService) {}

    // update parameter of any object    
    @UseGuards(CEditorGuard)
    @Post("update-param")    
    public updateParam (@Body() dto: IUpdateParam): Promise<IResponse<void>> {
        return this.objectsService.updateParam(dto);
    }

    // update "egoistic" parameter of any object ("egoistic" means that only one can be true in table)   
    @UseGuards(CEditorGuard)
    @Post("update-egoistic-param")    
    public updateEgoisticParam (@Body() dto: IUpdateParam): Promise<IResponse<void>> {
        return this.objectsService.updateEgoisticParam(dto);
    }   
}
