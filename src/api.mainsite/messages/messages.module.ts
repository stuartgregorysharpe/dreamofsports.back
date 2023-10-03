import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CCommonModule } from "src/common/common.module";
import { CMessage } from "src/model/entities/message";
import { CMessagesController } from "./messages.controller";
import { CMessagesService } from "./messages.service";
import { CAdmin } from "src/model/entities/admin";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CMessage, 
            CAdmin,        
        ]),
        CCommonModule,
    ],    
    providers: [CMessagesService],
    controllers: [CMessagesController],
})
export class CMessagesModule {}
