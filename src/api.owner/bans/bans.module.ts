import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CAdmin } from "src/model/entities/admin";
import { CBan } from "src/model/entities/ban";
import { CBansController } from "./bans.controller";
import { CBansService } from "./bans.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CBan,                 
            CAdmin,            
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CBansService],
    controllers: [CBansController],
    exports: [CBansService],
})
export class CBansModule {}
