import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { cfg } from './app.config';
import { CAutoModule } from './auto/auto.module';
import { CAdmin } from './model/entities/admin';
import { CAdminGroup } from './model/entities/admin.group';
import { CVerification } from './model/entities/verification';
import { CSetting } from './model/entities/setting';
import { CLang } from './model/entities/lang';
import { CWordbook } from './model/entities/wordbook';
import { CWord } from './model/entities/word';
import { CWordTranslation } from './model/entities/word.translation';
import { CFile } from './model/entities/file';
import { CBackup } from './model/entities/backup';
import { CPage } from './model/entities/page';
import { CPageTranslation } from './model/entities/page.translation';
import { CMailtemplate } from './model/entities/mailtemplate';
import { CMailtemplateTranslation } from './model/entities/mailtemplate.translation';
import { CApiMainsiteModule } from './api.mainsite/api.mainsite.module';
import { CError } from './model/entities/error';
import { CPageWord } from './model/entities/page.word';
import { CPageWordTranslation } from './model/entities/page.word.translation';
import { CEmployee } from './model/entities/employee';
import { CEmployeeTranslation } from './model/entities/employee.translation';
import { CMessage } from './model/entities/message';
import { CArticle } from './model/entities/article';
import { CArticleTranslation } from './model/entities/article.translation';
import { CArticleCat } from './model/entities/article.cat';
import { CArticleCatTranslation } from './model/entities/article.cat.translation';
import { CCountry } from './model/entities/country';
import { CCountryTranslation } from './model/entities/country.translation';
import { CUser } from './model/entities/user';
import { CAthlet } from './model/entities/athlet';
import { CFirm } from './model/entities/firm';
import { CCat } from './model/entities/cat';
import { CCatTranslation } from './model/entities/cat.translation';
import { CAthletTranslation } from './model/entities/athlet.translation';
import { CFirmTranslation } from './model/entities/firm.translation';
import { CUserImage } from './model/entities/user.image';
import { CUserVideo } from './model/entities/user.video';
import { CUserOther } from './model/entities/user.other';
import { CSocial } from './model/entities/social';
import { CUserPhone } from './model/entities/user.phone';
import { CUserEmail } from './model/entities/user.email';
import { CUserLink } from './model/entities/user.link';
import { CUserSocial } from './model/entities/user.social';
import { CReward } from './model/entities/reward';
import { CRewardTranslation } from './model/entities/reward.translation';
import { CFavorite } from './model/entities/favorite';
import { CChat } from './model/entities/chat';
import { CChatMessage } from './model/entities/chat.message';
import { CSocketModule } from './socket/socket.module';
import { CBan } from './model/entities/ban';
import { CTariff } from './model/entities/tariff';
import { CPaysystem } from './model/entities/paysystem';
import { CPaysystemTranslation } from './model/entities/paysystem.translation';
import { CPaysystemParam } from './model/entities/paysystem.param';
import { CTariffTranslation } from './model/entities/tariff.translation';
import { CPayment } from './model/entities/payment';
import { CApiOwnerModule } from './api.owner/api.owner.module';
import { CApiEditorModule } from './api.editor/api.editor.module';
import { CComplaint } from './model/entities/complaint';
import { CPost } from './model/entities/posts';
import { CPostAttachment } from './model/entities/posts.attachment';
import { CPostComment } from './model/entities/posts.comment';
import { CPostLike } from './model/entities/posts.like';
import { CUserFollow } from './model/entities/user.follow';

@Module({
	imports: [	
		ScheduleModule.forRoot(),	
		TypeOrmModule.forRoot({
			type: "mysql",
			host: cfg.dbHost,
			port: cfg.dbPort,
			username: cfg.dbLogin,
			password: cfg.dbPassword,
			database: cfg.dbName,
			entities: [
				CAdmin, 
				CAdminGroup,
				CVerification,
				CSetting,	
				CLang,
				CWordbook,
				CWord, 
				CWordTranslation,
				CFile,
				CError,
				CBackup,		
				CPage, 
				CPageTranslation, 
				CPageWord, 
				CPageWordTranslation,
				CMailtemplate, 
				CMailtemplateTranslation,	
				CEmployee, 
				CEmployeeTranslation,	
				CMessage,
				CArticle, 
				CArticleTranslation,		
				CArticleCat, 
				CArticleCatTranslation,
				CCountry,
				CCountryTranslation,
				CCat,
				CCatTranslation,
				CUser,
				CUserImage,
				CUserVideo,
				CUserOther,
				CAthlet,
				CAthletTranslation,
				CFirm,
				CFirmTranslation,
				CUserPhone,
				CUserEmail,
				CUserLink,
				CUserSocial,
				CSocial,
				CReward,
				CRewardTranslation,
				CFavorite,
				CChat,
				CChatMessage,
				CBan,
				CTariff,
				CTariffTranslation,
				CPaysystem,
				CPaysystemTranslation,
				CPaysystemParam,
				CPayment,
				CComplaint,
				CPost,
				CPostAttachment,
				CPostComment,
				CPostLike,
				CUserFollow
			],
			synchronize: true,
		}),			
		CApiOwnerModule,
		CApiEditorModule,
		CApiMainsiteModule,
		CAutoModule,
		CSocketModule,
	],	
})
export class CAppModule {}
