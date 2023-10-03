import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CAdmin } from "src/model/entities/admin";
import { CArticleCatsController } from "./article.cats.controller";
import { cfg } from "src/app.config";
import { CArticleCatsModule as COwnerArticleCatsModule } from "src/api.owner/article.cats/article.cats.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([CAdmin]),
        JwtModule.register(cfg.jwtAdmin),
        COwnerArticleCatsModule,
    ],    
    controllers: [CArticleCatsController],
})
export class CArticleCatsModule {}
