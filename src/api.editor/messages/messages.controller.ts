import { Controller, Param, Post, Body, UseGuards } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CMessage } from "src/model/entities/message";
import { IGetList } from "src/model/dto/getlist.interface";
import { CEditorGuard } from "src/common/services/guards/editor.guard";
import { CMessagesService } from "src/api.owner/messages/messages.service";

@Controller('api/editor/messages')
export class CMessagesController {
    constructor (private messagesService: CMessagesService) {}        
    
    @UseGuards(CEditorGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CMessage[]>> {
        return this.messagesService.chunk(dto);
    }
    
    @UseGuards(CEditorGuard)
    @Post("one/:id")
    public one(@Param("id") id: string): Promise<IResponse<CMessage>> {
        return this.messagesService.one(parseInt(id));
    }
    
    @UseGuards(CEditorGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.messagesService.delete(parseInt(id));
    }

    @UseGuards(CEditorGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.messagesService.deleteBulk(ids);
    }
}
