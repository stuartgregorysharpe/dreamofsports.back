import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CFile } from "src/model/entities/file";
import { cfg } from "src/app.config";
import { CFilesController } from "./files.controller";
import { CFilesService } from "./files.service";
import { CAdmin } from "src/model/entities/admin";
import { CCommonModule } from "src/common/common.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CFile,
            CAdmin,
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CFilesService],
    controllers: [CFilesController],    
})
export class CFilesModule {}
