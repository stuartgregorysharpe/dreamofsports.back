import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CLang } from "src/model/entities/lang";
import { CArticle } from "src/model/entities/article";
import { CArticlesController } from "./articles.controller";
import { CArticlesService } from "./articles.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CArticle, 
            CLang,           
        ]),
        CCommonModule,
    ],    
    providers: [CArticlesService],
    controllers: [CArticlesController],
})
export class CArticlesModule {}
