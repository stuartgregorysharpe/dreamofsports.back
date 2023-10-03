import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CLang } from "src/model/entities/lang";
import { CAthletsController } from "./athlets.controller";
import { CAthletsService } from "./athlets.service";
import { CUser } from "src/model/entities/user";
import { CCat } from "src/model/entities/cat";
import { JwtModule } from "@nestjs/jwt";
import { CFavorite } from "src/model/entities/favorite";
import { cfg } from "src/app.config";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CUser, 
            CLang,        
            CCat,   
            CFavorite,
        ]),
        CCommonModule,
        JwtModule.register(cfg.jwtUser),
    ],    
    providers: [CAthletsService],
    controllers: [CAthletsController],
})
export class CAthletsModule {}
