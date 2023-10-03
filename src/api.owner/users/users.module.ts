import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CAdmin } from "src/model/entities/admin";
import { CUser } from "src/model/entities/user";
import { cfg } from "src/app.config";
import { CUsersController } from "./users.controller";
import { CUsersService } from "./users.service";
import { CUserImage } from "src/model/entities/user.image";
import { CUserVideo } from "src/model/entities/user.video";
import { CUserOther } from "src/model/entities/user.other";
import { CUserPhone } from "src/model/entities/user.phone";
import { CUserEmail } from "src/model/entities/user.email";
import { CUserLink } from "src/model/entities/user.link";
import { CUserSocial } from "src/model/entities/user.social";
import { CReward } from "src/model/entities/reward";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CUser,   
            CUserImage,
            CUserVideo,
            CUserOther,
            CUserPhone,
            CUserEmail,
            CUserLink,
            CUserSocial,
            CReward,
            CAdmin,            
        ]),
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CUsersService],
    controllers: [CUsersController],
    exports: [CUsersService],
})
export class CUsersModule {}
