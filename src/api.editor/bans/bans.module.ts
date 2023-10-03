import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { cfg } from "src/app.config";
import { CAdmin } from "src/model/entities/admin";
import { CBansController } from "./bans.controller";
import { CBansModule as COwnerBansModule } from "src/api.owner/bans/bans.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([CAdmin]),
        JwtModule.register(cfg.jwtAdmin),
        COwnerBansModule,
    ],    
    controllers: [CBansController],
})
export class CBansModule {}
