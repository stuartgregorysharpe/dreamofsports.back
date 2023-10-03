import { Controller, Param, Post, Body, UseGuards, UseInterceptors, UploadedFiles } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CComplaintsService } from "./complaints.service";
import { CComplaint } from "src/model/entities/complaint";
import { IGetList } from "src/model/dto/getlist.interface";
import { COwnerGuard } from "src/common/services/guards/owner.guard";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Controller('api/owner/complaints')
export class CComplaintsController {
    constructor (private complaintsService: CComplaintsService) {}        
    
    @UseGuards(COwnerGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CComplaint[]>> {
        return this.complaintsService.chunk(dto);
    }
    
    @UseGuards(COwnerGuard)
    @Post("one/:id")
    public one(@Param("id") id: string): Promise<IResponse<CComplaint>> {
        return this.complaintsService.one(parseInt(id));
    }
    
    @UseGuards(COwnerGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.complaintsService.delete(parseInt(id));
    }

    @UseGuards(COwnerGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.complaintsService.deleteBulk(ids);
    }    
    
    @UseGuards(COwnerGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @Post("update")
    public update(@Body() fd: IJsonFormData, @UploadedFiles() uploads: Express.Multer.File[]): Promise<IResponse<CComplaint>> {
        return this.complaintsService.update(fd, uploads);
    }
}
