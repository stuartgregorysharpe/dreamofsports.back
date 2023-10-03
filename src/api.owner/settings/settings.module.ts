import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CSetting } from "src/model/entities/setting";
import { cfg } from "src/app.config";
import { CSettingsController } from "./settings.controller";
import { CSettingsService } from "./settings.service";
import { CAdmin } from "src/model/entities/admin";
import { CCommonModule } from "src/common/common.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CSetting, 
            CAdmin,
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CSettingsService],
    controllers: [CSettingsController],
})
export class CSettingsModule {}
