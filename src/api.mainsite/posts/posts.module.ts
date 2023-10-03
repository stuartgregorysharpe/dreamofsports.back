import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CPost } from "src/model/entities/posts";
import { CPostService } from "./posts.service";
import { CPostController } from "./posts.controller";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";
import { CUser } from "src/model/entities/user";
import { CPostComment } from "src/model/entities/posts.comment";
import { CPostLike } from "src/model/entities/posts.like";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CUser, 
            CPost,     
            CPostComment,
            CPostLike
        ]),
        CCommonModule,
        JwtModule.register(cfg.jwtUser),
    ],    
    providers: [CPostService],
    controllers: [CPostController],
})
export class CPostModule {}
