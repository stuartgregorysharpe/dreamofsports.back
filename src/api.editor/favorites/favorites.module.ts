import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { cfg } from "src/app.config";
import { CAdmin } from "src/model/entities/admin";
import { CFavoritesController } from "./favorites.controller";
import { CFavoritesModule as COwnerFavoritesModule } from "src/api.owner/favorites/favorites.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([CAdmin]),
        JwtModule.register(cfg.jwtAdmin),
        COwnerFavoritesModule,
    ],    
    controllers: [CFavoritesController],
})
export class CFavoritesModule {}
