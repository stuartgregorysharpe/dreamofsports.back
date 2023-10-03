import { Controller, Param, Post, Body, UseGuards, UseInterceptors } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CCatsService } from "./cats.service";
import { CCat } from "src/model/entities/cat";
import { IGetList } from "src/model/dto/getlist.interface";
import { COwnerGuard } from "src/common/services/guards/owner.guard";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Controller('api/owner/cats')
export class CCatsController {
    constructor (private catsService: CCatsService) {}        
    
    @UseGuards(COwnerGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CCat[]>> {
        return this.catsService.chunk(dto);
    }
    
    @UseGuards(COwnerGuard)
    @Post("one/:id")
    public one(@Param("id") id: string): Promise<IResponse<CCat>> {
        return this.catsService.one(parseInt(id));
    }
    
    @UseGuards(COwnerGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.catsService.delete(parseInt(id));
    }

    @UseGuards(COwnerGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.catsService.deleteBulk(ids);
    }
    
    @UseGuards(COwnerGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @Post("create")
    public create(@Body() fd: IJsonFormData): Promise<IResponse<CCat>> {
        return this.catsService.create(fd);
    }
    
    @UseGuards(COwnerGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @Post("update")
    public update(@Body() fd: IJsonFormData): Promise<IResponse<CCat>> {
        return this.catsService.update(fd);
    }
}
