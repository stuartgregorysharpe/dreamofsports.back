import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CVerification } from "src/model/entities/verification";
import { JwtModule } from "@nestjs/jwt";
import { CCommonModule } from "src/common/common.module";
import { CUser } from "src/model/entities/user";
import { CUsersService } from "./users.service";
import { CUsersController } from "./users.controller";
import { CLang } from "src/model/entities/lang";
import { CAthlet } from "src/model/entities/athlet";
import { CFirm } from "src/model/entities/firm";
import { CSetting } from "src/model/entities/setting";
import { CUserImage } from "src/model/entities/user.image";
import { CUserVideo } from "src/model/entities/user.video";
import { CUserOther } from "src/model/entities/user.other";
import { CUserPhone } from "src/model/entities/user.phone";
import { CUserEmail } from "src/model/entities/user.email";
import { CUserLink } from "src/model/entities/user.link";
import { CUserSocial } from "src/model/entities/user.social";
import { CReward } from "src/model/entities/reward";
import { cfg } from "src/app.config";
import { CUserFollow } from "src/model/entities/user.follow";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CUser,
            CAthlet,
            CFirm,
            CVerification,
            CLang,
            CSetting,
            CUserImage,
            CUserVideo,
            CUserOther,
            CUserPhone,
            CUserEmail,
            CUserLink,
            CUserSocial,
            CReward,
            CUserFollow
        ]),
        JwtModule.register(cfg.jwtUser),
        CCommonModule,
    ],    
    providers: [CUsersService],
    controllers: [CUsersController],    
})
export class CUsersModule {}
