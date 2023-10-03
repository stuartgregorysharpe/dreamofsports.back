import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CLang } from "src/model/entities/lang";
import { CWordbook } from "src/model/entities/wordbook";
import { CWordsController } from "./words.controller";
import { CWordsService } from "./words.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CWordbook, 
            CLang,           
        ]),
        CCommonModule,
    ],    
    providers: [CWordsService],
    controllers: [CWordsController],
})
export class CWordsModule {}
