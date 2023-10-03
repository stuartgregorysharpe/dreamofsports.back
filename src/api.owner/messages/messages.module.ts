import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CAdmin } from "src/model/entities/admin";
import { CMessage } from "src/model/entities/message";
import { CMessagesController } from "./messages.controller";
import { CMessagesService } from "./messages.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CMessage,                 
            CAdmin,            
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CMessagesService],
    controllers: [CMessagesController],
    exports: [CMessagesService],
})
export class CMessagesModule {}
