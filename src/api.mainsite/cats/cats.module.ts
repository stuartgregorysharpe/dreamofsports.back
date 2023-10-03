import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CLang } from "src/model/entities/lang";
import { CCat } from "src/model/entities/cat";
import { CCatsController } from "./cats.controller";
import { CCatsService } from "./cats.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CCat, 
            CLang,           
        ]),
        CCommonModule,
    ],    
    providers: [CCatsService],
    controllers: [CCatsController],
})
export class CCatsModule {}
