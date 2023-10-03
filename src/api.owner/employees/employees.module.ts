import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CAdmin } from "src/model/entities/admin";
import { CEmployee } from "src/model/entities/employee";
import { CEmployeesController } from "./employees.controller";
import { CEmployeesService } from "./employees.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CEmployee,                 
            CAdmin,            
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CEmployeesService],
    controllers: [CEmployeesController],
    exports: [CEmployeesService],
})
export class CEmployeesModule {}
