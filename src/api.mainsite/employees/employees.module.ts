import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CLang } from "src/model/entities/lang";
import { CEmployee } from "src/model/entities/employee";
import { CEmployeesController } from "./employees.controller";
import { CEmployeesService } from "./employees.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CEmployee, 
            CLang,           
        ]),
        CCommonModule,
    ],    
    providers: [CEmployeesService],
    controllers: [CEmployeesController],
})
export class CEmployeesModule {}
