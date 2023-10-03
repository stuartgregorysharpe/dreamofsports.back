import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { cfg } from "src/app.config";
import { CAdmin } from "src/model/entities/admin";
import { CSocialsController } from "./socials.controller";
import { CSocialsModule as COwnerSocialsModule } from "src/api.owner/socials/socials.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([CAdmin]),
        JwtModule.register(cfg.jwtAdmin),
        COwnerSocialsModule,
    ],    
    controllers: [CSocialsController],
})
export class CSocialsModule {}
