import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CLang } from "src/model/entities/lang";
import { CArticleCat } from "src/model/entities/article.cat";
import { CArticleCatsService } from "./article.cats.service";
import { CArticleCatsController } from "./article.cats.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CArticleCat, 
            CLang,           
        ]),
        CCommonModule,
    ],    
    providers: [CArticleCatsService],
    controllers: [CArticleCatsController],
})
export class CArticleCatsModule {}
