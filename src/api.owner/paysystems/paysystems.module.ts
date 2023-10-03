import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CAdmin } from "src/model/entities/admin";
import { CPaysystem } from "src/model/entities/paysystem";
import { CPaysystemsController } from "./paysystems.controller";
import { CPaysystemsService } from "./paysystems.service";
import { CPaysystemParam } from "src/model/entities/paysystem.param";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CPaysystem,   
            CPaysystemParam,              
            CAdmin,            
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CPaysystemsService],
    controllers: [CPaysystemsController],
})
export class CPaysystemsModule {}
