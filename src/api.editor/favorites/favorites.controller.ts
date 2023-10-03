import { Controller, Param, Post, Body, UseGuards, UseInterceptors } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CFavorite } from "src/model/entities/favorite";
import { IGetList } from "src/model/dto/getlist.interface";
import { CEditorGuard } from "src/common/services/guards/editor.guard";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { CFavoritesService } from "src/api.owner/favorites/favorites.service";

@Controller('api/editor/favorites')
export class CFavoritesController {
    constructor (private favoritesService: CFavoritesService) {}        
    
    @UseGuards(CEditorGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CFavorite[]>> {
        return this.favoritesService.chunk(dto);
    }
        
    @UseGuards(CEditorGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.favoritesService.delete(parseInt(id));
    }

    @UseGuards(CEditorGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.favoritesService.deleteBulk(ids);
    }
    
    @UseGuards(CEditorGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @Post("create")
    public create(@Body() fd: IJsonFormData): Promise<IResponse<CFavorite>> {
        return this.favoritesService.create(fd);
    }    
}
