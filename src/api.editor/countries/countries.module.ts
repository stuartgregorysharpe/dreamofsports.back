import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { cfg } from "src/app.config";
import { CAdmin } from "src/model/entities/admin";
import { CCountry } from "src/model/entities/country";
import { CCountriesController } from "./countries.controller";
import { CCountriesModule as COwnerCountriesModule } from "src/api.owner/countries/countries.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([CAdmin]),
        JwtModule.register(cfg.jwtAdmin),
        COwnerCountriesModule,
    ],    
    controllers: [CCountriesController],
})
export class CCountriesModule {}
