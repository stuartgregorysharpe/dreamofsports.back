import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CSetting } from "src/model/entities/setting";
import { CSettingsController } from "./settings.controller";
import { CSettingsService } from "./settings.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([CSetting]),  
        CCommonModule,      
    ],    
    providers: [CSettingsService],
    controllers: [CSettingsController],
})
export class CSettingsModule {}
