import { Controller, Post, Body, UseGuards, Param } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CLang } from "src/model/entities/lang";
import { CEditorGuard } from "src/common/services/guards/editor.guard";
import { IGetList } from "src/model/dto/getlist.interface";
import { CLangsService } from "src/api.owner/langs/langs.service";

@Controller('api/editor/langs')
export class CLangsController {
    constructor (private langsService: CLangsService) {}    

    @UseGuards(CEditorGuard)
    @Post("all")
    public all(@Body() dto: IGetList): Promise<IResponse<CLang[]>> {
        return this.langsService.all(dto);
    }  

    @UseGuards(CEditorGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CLang[]>> {
        return this.langsService.chunk(dto);
    }    

    @UseGuards(CEditorGuard)
    @Post("one/:id")
    public one(@Param("id") id: string): Promise<IResponse<CLang>> {
        return this.langsService.one(parseInt(id));
    }
}
