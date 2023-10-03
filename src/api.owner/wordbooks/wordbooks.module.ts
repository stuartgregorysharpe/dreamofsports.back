import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CAdmin } from "src/model/entities/admin";
import { CWord } from "src/model/entities/word";
import { CWordbook } from "src/model/entities/wordbook";
import { cfg } from "src/app.config";
import { CWordbooksController } from "./wordbooks.controller";
import { CWordbooksService } from "./wordbooks.service";
import { CCommonModule } from "src/common/common.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CWordbook,  
            CWord,   
            CAdmin,       
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CWordbooksService],
    controllers: [CWordbooksController],
})
export class CWordbooksModule {}
