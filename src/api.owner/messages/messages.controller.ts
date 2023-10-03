import { Controller, Param, Post, Body, UseGuards } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CMessagesService } from "./messages.service";
import { CMessage } from "src/model/entities/message";
import { IGetList } from "src/model/dto/getlist.interface";
import { COwnerGuard } from "src/common/services/guards/owner.guard";

@Controller('api/owner/messages')
export class CMessagesController {
    constructor (private messagesService: CMessagesService) {}        
    
    @UseGuards(COwnerGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CMessage[]>> {
        return this.messagesService.chunk(dto);
    }
    
    @UseGuards(COwnerGuard)
    @Post("one/:id")
    public one(@Param("id") id: string): Promise<IResponse<CMessage>> {
        return this.messagesService.one(parseInt(id));
    }
    
    @UseGuards(COwnerGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.messagesService.delete(parseInt(id));
    }

    @UseGuards(COwnerGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.messagesService.deleteBulk(ids);
    }
}
