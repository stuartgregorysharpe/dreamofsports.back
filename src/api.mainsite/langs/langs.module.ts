import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CLang } from "src/model/entities/lang";
import { CLangsController } from "./langs.controller";
import { CLangsService } from "./langs.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([CLang]),
        CCommonModule,
    ],    
    providers: [CLangsService],
    controllers: [CLangsController],
})
export class CLangsModule {}
