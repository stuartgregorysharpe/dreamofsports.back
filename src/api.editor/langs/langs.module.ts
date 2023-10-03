import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CAdmin } from "src/model/entities/admin";
import { cfg } from "src/app.config";
import { CLangsController } from "./langs.controller";
import { CLangsModule as COwnerLangsModule } from "src/api.owner/langs/langs.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([CAdmin]),
        JwtModule.register(cfg.jwtAdmin),
        COwnerLangsModule,
    ],    
    controllers: [CLangsController],
})
export class CLangsModule {}
