import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CAdmin } from "src/model/entities/admin";
import { CFavorite } from "src/model/entities/favorite";
import { CFavoritesController } from "./favorites.controller";
import { CFavoritesService } from "./favorites.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CFavorite,                 
            CAdmin,            
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CFavoritesService],
    controllers: [CFavoritesController],
    exports: [CFavoritesService],
})
export class CFavoritesModule {}
