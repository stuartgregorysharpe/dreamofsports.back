import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { CAppModule } from './app.module';
import { cfg } from './app.config';

async function bootstrap() {
	const app = await NestFactory.create(CAppModule, {rawBody: true});
	app.enableCors({origin: cfg.corsedUrls});	
	app.useWebSocketAdapter(new WsAdapter(app)); // чтобы Gateway использовали библиотеку ws
	await app.listen(cfg.appPort);
}

bootstrap();
