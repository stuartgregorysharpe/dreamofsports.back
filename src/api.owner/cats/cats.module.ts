import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CAdmin } from "src/model/entities/admin";
import { CCat } from "src/model/entities/cat";
import { cfg } from "src/app.config";
import { CCatsController } from "./cats.controller";
import { CCatsService } from "./cats.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CCat,   
            CAdmin,            
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CCatsService],
    controllers: [CCatsController],
    exports: [CCatsService],
})
export class CCatsModule {}
