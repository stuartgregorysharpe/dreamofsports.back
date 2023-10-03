import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CAdmin } from "src/model/entities/admin";
import { CAdminsController } from "./admins.controller";
import { CCommonModule } from "src/common/common.module";
import { CVerification } from "src/model/entities/verification";
import { cfg } from "src/app.config";
import { CAdminsService } from "./admins.service";
import { CAdminsModule as COwnerAdminsModule } from "src/api.owner/admins/admins.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CAdmin,
            CVerification,
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
        COwnerAdminsModule,
    ],    
    providers: [CAdminsService],
    controllers: [CAdminsController],    
})
export class CAdminsModule {}
