import { Body, Controller, Post, Req, UseGuards, Request } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { JwtService } from "@nestjs/jwt";
import { CUserGuard } from "src/common/services/guards/user.guard";
import { CChatMessagesService } from "./chat.messages.service";
import { IChatMessageCreate } from "./dto/chat.message.create.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CChatMessage } from "src/model/entities/chat.message";

@Controller('api/mainsite/chat-messages')
export class CChatMessagesController {
    constructor(
        private chatMessagesService: CChatMessagesService,
        private jwtService: JwtService,
    ) {}        
    
    @UseGuards(CUserGuard)
    @Post("create")
    public create(@Body() dto: IChatMessageCreate, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.chatMessagesService.create(visitor_id, dto);
    }   
    
    @UseGuards(CUserGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList, @Req() request: Request): Promise<IResponse<CChatMessage[]>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.chatMessagesService.chunk(visitor_id, dto);
    }
}
