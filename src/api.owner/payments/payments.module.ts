import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CAdmin } from "src/model/entities/admin";
import { CPayment } from "src/model/entities/payment";
import { CPaymentsController } from "./payments.controller";
import { CPaymentsService } from "./payments.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CPayment,                 
            CAdmin,            
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CPaymentsService],
    controllers: [CPaymentsController],
})
export class CPaymentsModule {}
