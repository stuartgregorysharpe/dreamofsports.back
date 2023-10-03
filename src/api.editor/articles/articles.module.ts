import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CAdmin } from "src/model/entities/admin";
import { CArticlesController } from "./articles.controller";
import { cfg } from "src/app.config";
import { CArticlesModule as COwnerArticlesModule } from "src/api.owner/articles/articles.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([CAdmin]),
        JwtModule.register(cfg.jwtAdmin),
        COwnerArticlesModule,
    ],    
    controllers: [CArticlesController],
})
export class CArticlesModule {}
