import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CAdmin } from "src/model/entities/admin";
import { cfg } from "src/app.config";
import { CCatsController } from "./cats.controller";
import { CCatsModule as COwnerCatsModule } from "src/api.owner/cats/cats.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([CAdmin]),
        JwtModule.register(cfg.jwtAdmin),
        COwnerCatsModule,
    ],    
    controllers: [CCatsController],
})
export class CCatsModule {}
