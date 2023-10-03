import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CAdmin } from "src/model/entities/admin";
import { CArticleCat } from "src/model/entities/article.cat";
import { CArticleCatsController } from "./article.cats.controller";
import { CArticleCatsService } from "./article.cats.service";
import { cfg } from "src/app.config";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CArticleCat,                 
            CAdmin,            
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CArticleCatsService],
    controllers: [CArticleCatsController],
    exports: [CArticleCatsService],
})
export class CArticleCatsModule {}
