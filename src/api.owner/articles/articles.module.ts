import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CAdmin } from "src/model/entities/admin";
import { CArticle } from "src/model/entities/article";
import { CArticlesController } from "./articles.controller";
import { CArticlesService } from "./articles.service";
import { cfg } from "src/app.config";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CArticle,   
            CAdmin,            
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CArticlesService],
    controllers: [CArticlesController],
    exports: [CArticlesService],
})
export class CArticlesModule {}
