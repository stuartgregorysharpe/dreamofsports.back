import { Controller, Post, Body } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CMessagesService } from "./messages.service";
import { IMessageCreate } from "./dto/message.create.interface";

@Controller('api/mainsite/messages')
export class CMessagesController {
    constructor (private messagesService: CMessagesService) {}        
    
    @Post("create")
    public create(@Body() dto: IMessageCreate): Promise<IResponse<void>> {
        return this.messagesService.create(dto);
    }
}
