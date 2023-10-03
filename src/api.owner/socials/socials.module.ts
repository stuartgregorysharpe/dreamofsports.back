import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CAdmin } from "src/model/entities/admin";
import { CSocial } from "src/model/entities/social";
import { CSocialsController } from "./socials.controller";
import { CSocialsService } from "./socials.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CSocial,                 
            CAdmin,            
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CSocialsService],
    controllers: [CSocialsController],
    exports: [CSocialsService],
})
export class CSocialsModule {}
