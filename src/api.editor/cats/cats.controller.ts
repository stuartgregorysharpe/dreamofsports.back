import { Controller, Param, Post, Body, UseGuards, UseInterceptors } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CCat } from "src/model/entities/cat";
import { IGetList } from "src/model/dto/getlist.interface";
import { CEditorGuard } from "src/common/services/guards/editor.guard";
import { CCatsService } from "src/api.owner/cats/cats.service";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Controller('api/editor/cats')
export class CCatsController {
    constructor (private catsService: CCatsService) {}        
    
    @UseGuards(CEditorGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CCat[]>> {
        return this.catsService.chunk(dto);
    }
    
    @UseGuards(CEditorGuard)
    @Post("one/:id")
    public one(@Param("id") id: string): Promise<IResponse<CCat>> {
        return this.catsService.one(parseInt(id));
    }

    @UseGuards(CEditorGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.catsService.delete(parseInt(id));
    }

    @UseGuards(CEditorGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.catsService.deleteBulk(ids);
    }
    
    @UseGuards(CEditorGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @Post("create")
    public create(@Body() fd: IJsonFormData): Promise<IResponse<CCat>> {
        return this.catsService.create(fd);
    }
    
    @UseGuards(CEditorGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @Post("update")
    public update(@Body() fd: IJsonFormData): Promise<IResponse<CCat>> {
        return this.catsService.update(fd);
    }
}
