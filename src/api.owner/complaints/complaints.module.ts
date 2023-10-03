import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CAdmin } from "src/model/entities/admin";
import { CComplaint } from "src/model/entities/complaint";
import { CComplaintsController } from "./complaints.controller";
import { CComplaintsService } from "./complaints.service";
import { cfg } from "src/app.config";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CComplaint,   
            CAdmin,            
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CComplaintsService],
    controllers: [CComplaintsController],
    exports: [CComplaintsService],
})
export class CComplaintsModule {}
