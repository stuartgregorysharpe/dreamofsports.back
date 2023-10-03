import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CPayment } from "src/model/entities/payment";
import { CPaysystem } from "src/model/entities/paysystem";
import { CTariff } from "src/model/entities/tariff";
import { CUser } from "src/model/entities/user";
import { CPaymentsService } from "./payments.service";
import { CPaymentsController } from "./payments.controller";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CPayment,
            CPaysystem,
            CTariff,
            CUser,
        ]),
        CCommonModule,
        JwtModule.register(cfg.jwtUser),
    ],    
    providers: [CPaymentsService],
    controllers: [CPaymentsController],
})
export class CPaymentsModule {}
