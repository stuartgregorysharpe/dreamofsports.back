import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CAdmin } from "src/model/entities/admin";
import { CAdminsController } from "./admins.controller";
import { CAdminsService } from "./admins.service";
import { CCommonModule } from "src/common/common.module";
import { CVerification } from "src/model/entities/verification";
import { cfg } from "src/app.config";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CAdmin,
            CVerification,
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CAdminsService],
    controllers: [CAdminsController],    
    exports: [CAdminsService],
})
export class CAdminsModule {}
