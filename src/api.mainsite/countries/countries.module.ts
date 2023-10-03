import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CCountry } from "src/model/entities/country";
import { CCountriesController } from "./countries.controller";
import { CCountriesService } from "./countries.service";
import { CLang } from "src/model/entities/lang";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CCountry,
            CLang,
        ]),
        CCommonModule,
    ],    
    providers: [CCountriesService],
    controllers: [CCountriesController],
})
export class CCountriesModule {}
