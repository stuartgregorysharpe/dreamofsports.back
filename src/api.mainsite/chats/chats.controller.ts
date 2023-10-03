import { Controller, Post, Param, Req, UseGuards, Request } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { JwtService } from "@nestjs/jwt";
import { CChatsService } from "./chats.service";
import { CUserGuard } from "src/common/services/guards/user.guard";
import { IChat } from "./dto/chat.interface";

@Controller('api/mainsite/chats')
export class CChatsController {
    constructor(
        private chatsService: CChatsService,
        private jwtService: JwtService,
    ) {}        
    
    @Post("create/:companion_id")
    public create(@Param("companion_id") companion_id: string, @Req() request: Request): Promise<IResponse<number>> {
        const token = request.headers["token"] as string;
        const visitor_id = token ? this.jwtService.decode(token)["id"] as number : null;
        return this.chatsService.create(visitor_id, parseInt(companion_id));
    }   

    @UseGuards(CUserGuard)
    @Post("all")
    public all(@Req() request: Request): Promise<IResponse<IChat[]>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.chatsService.all(visitor_id);
    }

    @UseGuards(CUserGuard)
    @Post("one/:id")
    public one(@Param("id") id: string, @Req() request: Request): Promise<IResponse<IChat>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.chatsService.one(visitor_id, parseInt(id));
    }

    @UseGuards(CUserGuard)
    @Post("reset-unread/:id")
    public resetUnread(@Param("id") id: string, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.chatsService.resetUnread(visitor_id, parseInt(id));
    }

    @UseGuards(CUserGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.chatsService.delete(visitor_id, parseInt(id));
    }

    @UseGuards(CUserGuard)
    @Post("delete-and-ban/:id")
    public deleteAndBan(@Param("id") id: string, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.chatsService.deleteAndBan(visitor_id, parseInt(id));
    }

    @UseGuards(CUserGuard)
    @Post("unban/:banned_id")
    public unBan(@Param("banned_id") banned_id: string, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.chatsService.unBan(visitor_id, parseInt(banned_id));
    }
}
