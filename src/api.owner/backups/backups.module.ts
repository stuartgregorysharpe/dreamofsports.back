import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CAdmin } from "src/model/entities/admin";
import { CBackup } from "src/model/entities/backup";
import { CBackupsController } from "./backups.controller";
import { CBackupsService } from "./backups.service";
import { CSetting } from "src/model/entities/setting";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CBackup,                 
            CAdmin,       
            CSetting,     
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CBackupsService],
    controllers: [CBackupsController],
    exports: [CBackupsService]
})
export class CBackupsModule {}
