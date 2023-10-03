import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CAdmin } from "src/model/entities/admin";
import { CCountry } from "src/model/entities/country";
import { CCountriesController } from "./countries.controller";
import { CCountriesService } from "./countries.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CCountry,                 
            CAdmin,            
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CCountriesService],
    controllers: [CCountriesController],
    exports: [CCountriesService],
})
export class CCountriesModule {}
