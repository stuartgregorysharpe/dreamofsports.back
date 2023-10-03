import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CAdmin } from "src/model/entities/admin";
import { CTariff } from "src/model/entities/tariff";
import { CTariffsController } from "./tariffs.controller";
import { CTariffsService } from "./tariffs.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CTariff,                 
            CAdmin,            
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CTariffsService],
    controllers: [CTariffsController],
})
export class CTariffsModule {}
