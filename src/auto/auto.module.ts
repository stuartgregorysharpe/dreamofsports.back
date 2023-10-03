import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CBackupsAutoService } from "./backups.auto.service";
import { CBackup } from "src/model/entities/backup";
import { CBackupsModule } from "src/api.owner/backups/backups.module";
import { CUsersAutoService } from "./users.auto.service";
import { CUser } from "src/model/entities/user";

@Module({
    imports: [
        CCommonModule,
        TypeOrmModule.forFeature([
            CBackup,
            CUser,
        ]), 
        CBackupsModule,  
    ],    
    providers: [
        CBackupsAutoService,
        CUsersAutoService,
    ],  
})
export class CAutoModule {}
