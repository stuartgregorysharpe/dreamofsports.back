import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CAdminGroupsService } from "./admin.groups.service";
import { CAdminGroupsController } from "./admin.groups.controller";
import { CAdmin } from "src/model/entities/admin";
import { CAdminGroup } from "src/model/entities/admin.group";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CAdminGroup,
            CAdmin,
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CAdminGroupsService],
    controllers: [CAdminGroupsController],
})
export class CAdminGroupsModule {}
