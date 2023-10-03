import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CLang } from "src/model/entities/lang";
import { CFirmsController } from "./firms.controller";
import { CFirmsService } from "./firms.service";
import { CUser } from "src/model/entities/user";
import { CCat } from "src/model/entities/cat";
import { JwtModule } from "@nestjs/jwt";
import { CFavorite } from "src/model/entities/favorite";
import { cfg } from "src/app.config";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CUser, 
            CLang,        
            CCat,   
            CFavorite,
        ]),
        CCommonModule,
        JwtModule.register(cfg.jwtUser),
    ],    
    providers: [CFirmsService],
    controllers: [CFirmsController],
})
export class CFirmsModule {}
