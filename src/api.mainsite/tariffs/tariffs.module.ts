import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CTariff } from "src/model/entities/tariff";
import { CTariffsController } from "./tariffs.controller";
import { CTariffsService } from "./tariffs.service";
import { CLang } from "src/model/entities/lang";
import { CUser } from "src/model/entities/user";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CTariff,
            CLang,
            CUser,
        ]),
        CCommonModule,
        JwtModule.register(cfg.jwtUser),
    ],    
    providers: [CTariffsService],
    controllers: [CTariffsController],
})
export class CTariffsModule {}
