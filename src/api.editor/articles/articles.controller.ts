import { Controller, Param, Post, Body, UseGuards, UseInterceptors, UploadedFiles } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CArticle } from "src/model/entities/article";
import { IGetList } from "src/model/dto/getlist.interface";
import { CEditorGuard } from "src/common/services/guards/editor.guard";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { CArticlesService } from "src/api.owner/articles/articles.service";

@Controller('api/editor/articles')
export class CArticlesController {
    constructor (private articlesService: CArticlesService) {}        
    
    @UseGuards(CEditorGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CArticle[]>> {
        return this.articlesService.chunk(dto);
    }
    
    @UseGuards(CEditorGuard)
    @Post("one/:id")
    public one(@Param("id") id: string): Promise<IResponse<CArticle>> {
        return this.articlesService.one(parseInt(id));
    }
    
    @UseGuards(CEditorGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.articlesService.delete(parseInt(id));
    }

    @UseGuards(CEditorGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.articlesService.deleteBulk(ids);
    }
    
    @UseGuards(CEditorGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @Post("create")
    public create(@Body() fd: IJsonFormData, @UploadedFiles() uploads: Express.Multer.File[]): Promise<IResponse<CArticle>> {
        return this.articlesService.create(fd, uploads);
    }
    
    @UseGuards(CEditorGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @Post("update")
    public update(@Body() fd: IJsonFormData, @UploadedFiles() uploads: Express.Multer.File[]): Promise<IResponse<CArticle>> {
        return this.articlesService.update(fd, uploads);
    }
}
