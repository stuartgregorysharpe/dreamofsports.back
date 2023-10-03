import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CObjectsController } from "./objects.controller";
import { cfg } from "src/app.config";
import { CAdmin } from "src/model/entities/admin";
import { CObjectsModule as COwnerObjectsModule } from "src/api.owner/objects/objects.module"; 

@Module({
	imports: [		
		JwtModule.register(cfg.jwtAdmin),			
		TypeOrmModule.forFeature([CAdmin]),
		COwnerObjectsModule,
	],
	controllers: [CObjectsController],
})
export class CObjectsModule {}
