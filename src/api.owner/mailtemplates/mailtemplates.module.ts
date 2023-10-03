import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CAdmin } from "src/model/entities/admin";
import { CMailtemplate } from "src/model/entities/mailtemplate";
import { CMailtemplatesController } from "./mailtemplates.controller";
import { CMailtemplatesService } from "./mailtemplates.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CMailtemplate,                 
            CAdmin,            
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CMailtemplatesService],
    controllers: [CMailtemplatesController],
})
export class CMailtemplatesModule {}
