import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CAdmin } from "src/model/entities/admin";
import { cfg } from "src/app.config";
import { CUsersController } from "./users.controller";
import { CUsersModule as COwnerUsersModule } from "src/api.owner/users/users.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([CAdmin]),
        JwtModule.register(cfg.jwtAdmin),
        COwnerUsersModule,
    ],    
    controllers: [CUsersController],
})
export class CUsersModule {}
