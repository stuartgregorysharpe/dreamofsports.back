import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { cfg } from "src/app.config";
import { CAdmin } from "src/model/entities/admin";
import { CModerableImagesController } from "./moderable.images.controller";
import { CModerableImagesModule as COwnerModerableImagesModule } from "src/api.owner/moderable.images/moderable.images.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([CAdmin]),
        JwtModule.register(cfg.jwtAdmin),
        COwnerModerableImagesModule,
    ],    
    controllers: [CModerableImagesController],
})
export class CModerableImagesModule {}
