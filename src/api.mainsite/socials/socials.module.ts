import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CSocial } from "src/model/entities/social";
import { CSocialsController } from "./socials.controller";
import { CSocialsService } from "./socials.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([CSocial]),
        CCommonModule,
    ],    
    providers: [CSocialsService],
    controllers: [CSocialsController],
})
export class CSocialsModule {}
