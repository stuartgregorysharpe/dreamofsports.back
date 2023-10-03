import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CLang } from "src/model/entities/lang";
import { CPage } from "src/model/entities/page";
import { CPagesController } from "./pages.controller";
import { CPagesService } from "./pages.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CPage, 
            CLang,           
        ]),
        CCommonModule,
    ],    
    providers: [CPagesService],
    controllers: [CPagesController],
})
export class CPagesModule {}
