import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CAdmin } from "src/model/entities/admin";
import { CLang } from "src/model/entities/lang";
import { cfg } from "src/app.config";
import { CLangsController } from "./langs.controller";
import { CLangsService } from "./langs.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CLang,
            CAdmin,  
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CLangsService],
    controllers: [CLangsController],
    exports: [CLangsService],
})
export class CLangsModule {}
