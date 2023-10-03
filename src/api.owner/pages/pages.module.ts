import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CAdmin } from "src/model/entities/admin";
import { CPage } from "src/model/entities/page";
import { cfg } from "src/app.config";
import { CPagesController } from "./pages.controller";
import { CPagesService } from "./pages.service";
import { CPageWord } from "src/model/entities/page.word";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CPage,   
            CPageWord,              
            CAdmin,            
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CPagesService],
    controllers: [CPagesController],
})
export class CPagesModule {}
