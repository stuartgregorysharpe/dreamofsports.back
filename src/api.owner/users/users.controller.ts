import { Controller, Param, Post, Body, UseGuards, UseInterceptors, UploadedFiles } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CUsersService } from "./users.service";
import { CUser } from "src/model/entities/user";
import { IGetList } from "src/model/dto/getlist.interface";
import { COwnerGuard } from "src/common/services/guards/owner.guard";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Controller('api/owner/users')
export class CUsersController {
    constructor (private usersService: CUsersService) {}        
    
    @UseGuards(COwnerGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CUser[]>> {
        return this.usersService.chunk(dto);
    }
    
    @UseGuards(COwnerGuard)
    @Post("one/:id")
    public one(@Param("id") id: string): Promise<IResponse<CUser>> {
        return this.usersService.one(parseInt(id));
    }
    
    @UseGuards(COwnerGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.usersService.delete(parseInt(id));
    }

    @UseGuards(COwnerGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.usersService.deleteBulk(ids);
    }

    @UseGuards(COwnerGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @Post("create")
    public create(@Body() fd: IJsonFormData, @UploadedFiles() uploads: Express.Multer.File[]): Promise<IResponse<CUser>> {
        return this.usersService.create(fd, uploads);
    }

    @UseGuards(COwnerGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @Post("update")
    public update(@Body() fd: IJsonFormData, @UploadedFiles() uploads: Express.Multer.File[]): Promise<IResponse<CUser>> {
        return this.usersService.update(fd, uploads);
    }
}
