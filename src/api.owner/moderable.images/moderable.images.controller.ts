import { Controller, Param, Post, Body, UseGuards } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CModerableImagesService } from "./moderable.images.service";
import { IGetList } from "src/model/dto/getlist.interface";
import { COwnerGuard } from "src/common/services/guards/owner.guard";
import { IModerableImage } from "./dto/moderable.image.interface";

@Controller('api/owner/moderable-images')
export class CModerableImagesController {
    constructor (private moderableImagesService: CModerableImagesService) {}        
    
    @UseGuards(COwnerGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<IModerableImage[]>> {
        return this.moderableImagesService.chunk(dto);
    }    
}
