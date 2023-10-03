import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CUser } from "src/model/entities/user";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";
import { CChatMessage } from "src/model/entities/chat.message";
import { CChatMessagesService } from "./chat.messages.service";
import { CChatMessagesController } from "./chat.messages.controller";
import { CChat } from "src/model/entities/chat";
import { CSocketModule } from "src/socket/socket.module";
import { CLang } from "src/model/entities/lang";
import { CChatsModule } from "../chats/chats.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CUser, 
            CChatMessage,      
            CChat,   
            CLang,   
        ]),
        CCommonModule,
        CSocketModule,
        CChatsModule,
        JwtModule.register(cfg.jwtUser),
    ],    
    providers: [CChatMessagesService],
    controllers: [CChatMessagesController],
})
export class CChatMessagesModule {}
