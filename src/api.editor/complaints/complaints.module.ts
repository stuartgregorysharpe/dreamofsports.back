import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CAdmin } from "src/model/entities/admin";
import { CComplaintsController } from "./complaints.controller";
import { cfg } from "src/app.config";
import { CComplaintsModule as COwnerComplaintsModule } from "src/api.owner/complaints/complaints.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([CAdmin]),
        JwtModule.register(cfg.jwtAdmin),
        COwnerComplaintsModule,
    ],    
    controllers: [CComplaintsController],
})
export class CComplaintsModule {}
