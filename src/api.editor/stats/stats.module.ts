import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CAdmin } from "src/model/entities/admin";
import { cfg } from "src/app.config";
import { CStatsController } from "./stats.controller";
import { CStatsModule as COwnerStatsModule } from "src/api.owner/stats/stats.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([CAdmin]),
        JwtModule.register(cfg.jwtAdmin),
        COwnerStatsModule,
    ],    
    controllers: [CStatsController],
})
export class CStatsModule {}
