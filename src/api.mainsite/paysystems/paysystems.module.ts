import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CPaysystem } from "src/model/entities/paysystem";
import { CPaysystemsController } from "./paysystems.controller";
import { CPaysystemsService } from "./paysystems.service";
import { CLang } from "src/model/entities/lang";
import { CUser } from "src/model/entities/user";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CPaysystem,
            CLang,
            CUser,
        ]),
        CCommonModule,
        JwtModule.register(cfg.jwtUser),
    ],    
    providers: [CPaysystemsService],
    controllers: [CPaysystemsController],
})
export class CPaysystemsModule {}
