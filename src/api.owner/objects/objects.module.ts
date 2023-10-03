import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CObjectsController } from "./objects.controller";
import { CObjectsService } from "./objects.service";
import { cfg } from "src/app.config";
import { CAdmin } from "src/model/entities/admin";
import { CCommonModule } from "src/common/common.module";

@Module({
	imports: [		
		JwtModule.register(cfg.jwtAdmin),			
		TypeOrmModule.forFeature([CAdmin]),
		CCommonModule,
	],
	controllers: [CObjectsController],
	providers: [CObjectsService],
	exports: [CObjectsService],
})
export class CObjectsModule {}
