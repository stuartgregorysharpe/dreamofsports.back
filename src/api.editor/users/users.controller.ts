import { Controller, Param, Post, Body, UseGuards, UseInterceptors, UploadedFiles } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CUser } from "src/model/entities/user";
import { IGetList } from "src/model/dto/getlist.interface";
import { CEditorGuard } from "src/common/services/guards/editor.guard";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { CUsersService } from "src/api.owner/users/users.service";

@Controller('api/editor/users')
export class CUsersController {
    constructor (private usersService: CUsersService) {}        
    
    @UseGuards(CEditorGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CUser[]>> {
        return this.usersService.chunk(dto);
    }
    
    @UseGuards(CEditorGuard)
    @Post("one/:id")
    public one(@Param("id") id: string): Promise<IResponse<CUser>> {
        return this.usersService.one(parseInt(id));
    }
    
    @UseGuards(CEditorGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.usersService.delete(parseInt(id));
    }

    @UseGuards(CEditorGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.usersService.deleteBulk(ids);
    }

    @UseGuards(CEditorGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @Post("create")
    public create(@Body() fd: IJsonFormData, @UploadedFiles() uploads: Express.Multer.File[]): Promise<IResponse<CUser>> {
        return this.usersService.create(fd, uploads);
    }

    @UseGuards(CEditorGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @Post("update")
    public update(@Body() fd: IJsonFormData, @UploadedFiles() uploads: Express.Multer.File[]): Promise<IResponse<CUser>> {
        return this.usersService.update(fd, uploads);
    }
}
