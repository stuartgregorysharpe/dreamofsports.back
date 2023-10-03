import { Controller, Param, Post, Body, UseGuards, UseInterceptors, UploadedFiles } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CSocial } from "src/model/entities/social";
import { IGetList } from "src/model/dto/getlist.interface";
import { CEditorGuard } from "src/common/services/guards/editor.guard";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { CSocialsService } from "src/api.owner/socials/socials.service";

@Controller('api/editor/socials')
export class CSocialsController {
    constructor (private socialsService: CSocialsService) {}        
    
    @UseGuards(CEditorGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CSocial[]>> {
        return this.socialsService.chunk(dto);
    }
    
    @UseGuards(CEditorGuard)
    @Post("one/:id")
    public one(@Param("id") id: string): Promise<IResponse<CSocial>> {
        return this.socialsService.one(parseInt(id));
    }
    
    @UseGuards(CEditorGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.socialsService.delete(parseInt(id));
    }

    @UseGuards(CEditorGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.socialsService.deleteBulk(ids);
    }
    
    @UseGuards(CEditorGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @Post("create")
    public create(@Body() fd: IJsonFormData, @UploadedFiles() uploads: Express.Multer.File[]): Promise<IResponse<CSocial>> {
        return this.socialsService.create(fd, uploads);
    }
    
    @UseGuards(CEditorGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @Post("update")
    public update(@Body() fd: IJsonFormData, @UploadedFiles() uploads: Express.Multer.File[]): Promise<IResponse<CSocial>> {
        return this.socialsService.update(fd, uploads);
    }
}
