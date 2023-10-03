import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CAdmin } from "src/model/entities/admin";
import { cfg } from "src/app.config";
import { CCommonModule } from "src/common/common.module";
import { CUser } from "src/model/entities/user";
import { CStatsService } from "./stats.service";
import { CStatsController } from "./stats.controller";
import { CCat } from "src/model/entities/cat";
import { CPayment } from "src/model/entities/payment";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CUser,      
            CCat,      
            CPayment,
            CAdmin,       
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CStatsService],
    controllers: [CStatsController],
    exports: [CStatsService],
})
export class CStatsModule {}
