import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CFile } from "../../model/entities/file";
import { CFilesController } from "./files.controller";
import { CFilesService } from "./files.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([CFile]),     
        CCommonModule,   
    ],    
    providers: [CFilesService],
    controllers: [CFilesController],
})
export class CFilesModule {}
