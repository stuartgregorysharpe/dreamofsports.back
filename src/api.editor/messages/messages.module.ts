import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { cfg } from "src/app.config";
import { CAdmin } from "src/model/entities/admin";
import { CMessagesController } from "./messages.controller";
import { CMessagesModule as COwnerMessagesModule } from "src/api.owner/messages/messages.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([CAdmin]),
        JwtModule.register(cfg.jwtAdmin),
        COwnerMessagesModule,
    ],    
    controllers: [CMessagesController],
})
export class CMessagesModule {}
