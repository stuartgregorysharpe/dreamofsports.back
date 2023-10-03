import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CChatsController } from "./chats.controller";
import { CChatsService } from "./chats.service";
import { CUser } from "src/model/entities/user";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";
import { CChat } from "src/model/entities/chat";
import { CLang } from "src/model/entities/lang";
import { CSocketModule } from "src/socket/socket.module";
import { CBan } from "src/model/entities/ban";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CUser, 
            CChat,            
            CLang,
            CBan,
        ]),
        CCommonModule,
        CSocketModule,
        JwtModule.register(cfg.jwtUser),
    ],    
    providers: [CChatsService],
    controllers: [CChatsController],
    exports: [CChatsService]
})
export class CChatsModule {}
