import { Controller, Param, Post, Body, UseGuards, UseInterceptors } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CPaysystemsService } from "./paysystems.service";
import { CPaysystem } from "src/model/entities/paysystem";
import { IGetList } from "src/model/dto/getlist.interface";
import { COwnerGuard } from "src/common/services/guards/owner.guard";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Controller('api/owner/paysystems')
export class CPaysystemsController {
    constructor (private paysystemsService: CPaysystemsService) {}        
    
    @UseGuards(COwnerGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CPaysystem[]>> {
        return this.paysystemsService.chunk(dto);
    }
    
    @UseGuards(COwnerGuard)
    @Post("one/:id")
    public one(@Param("id") id: string): Promise<IResponse<CPaysystem>> {
        return this.paysystemsService.one(parseInt(id));
    }
    
    @UseGuards(COwnerGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.paysystemsService.delete(parseInt(id));
    }

    @UseGuards(COwnerGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.paysystemsService.deleteBulk(ids);
    }
    
    @UseGuards(COwnerGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @Post("create")
    public create(@Body() fd: IJsonFormData): Promise<IResponse<CPaysystem>> {
        return this.paysystemsService.create(fd);
    }
    
    @UseGuards(COwnerGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @Post("update")
    public update(@Body() fd: IJsonFormData): Promise<IResponse<CPaysystem>> {
        return this.paysystemsService.update(fd);
    }
}
