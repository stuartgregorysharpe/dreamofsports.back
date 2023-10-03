import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CAdmin } from "src/model/entities/admin";
import { CModerableImagesService } from "./moderable.images.service";
import { CModerableImagesController } from "./moderable.images.controller";
import { CUser } from "src/model/entities/user";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CUser,     
            CAdmin,            
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CModerableImagesService],
    controllers: [CModerableImagesController],
    exports: [CModerableImagesService],
})
export class CModerableImagesModule {}
