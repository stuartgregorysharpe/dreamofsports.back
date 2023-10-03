import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { IGetList } from "src/model/dto/getlist.interface";
import { CEditorGuard } from "src/common/services/guards/editor.guard";
import { IModerableImage } from "src/api.owner/moderable.images/dto/moderable.image.interface";
import { CModerableImagesService } from "src/api.owner/moderable.images/moderable.images.service";

@Controller('api/editor/moderable-images')
export class CModerableImagesController {
    constructor (private moderableImagesService: CModerableImagesService) {}        
    
    @UseGuards(CEditorGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<IModerableImage[]>> {
        return this.moderableImagesService.chunk(dto);
    }    
}
