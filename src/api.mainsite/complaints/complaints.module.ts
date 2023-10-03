import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CUser } from "src/model/entities/user";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";
import { CComplaint } from "src/model/entities/complaint";
import { CComplaintsService } from "./complaints.service";
import { CComplaintsController } from "./complaints.controller";
import { CAdmin } from "src/model/entities/admin";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CComplaint,
            CUser, 
            CAdmin,
        ]),
        CCommonModule,
        JwtModule.register(cfg.jwtUser),
    ],    
    providers: [CComplaintsService],
    controllers: [CComplaintsController],
})
export class CComplaintsModule {}
