import { Controller, Param, Post, Body, UseGuards, UseInterceptors } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CFavoritesService } from "./favorites.service";
import { CFavorite } from "src/model/entities/favorite";
import { IGetList } from "src/model/dto/getlist.interface";
import { COwnerGuard } from "src/common/services/guards/owner.guard";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Controller('api/owner/favorites')
export class CFavoritesController {
    constructor (private favoritesService: CFavoritesService) {}        
    
    @UseGuards(COwnerGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CFavorite[]>> {
        return this.favoritesService.chunk(dto);
    }
        
    @UseGuards(COwnerGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.favoritesService.delete(parseInt(id));
    }

    @UseGuards(COwnerGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.favoritesService.deleteBulk(ids);
    }
    
    @UseGuards(COwnerGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @Post("create")
    public create(@Body() fd: IJsonFormData): Promise<IResponse<CFavorite>> {
        return this.favoritesService.create(fd);
    }    
}
