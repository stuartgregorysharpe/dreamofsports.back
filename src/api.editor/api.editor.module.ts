import { Module } from "@nestjs/common";
import { CAdminsModule } from "./admins/admins.module";
import { CStatsModule } from "./stats/stats.module";
import { CObjectsModule } from "./objects/objects.module";
import { CUsersModule } from "./users/users.module";
import { CLangsModule } from "./langs/langs.module";
import { CCountriesModule } from "./countries/countries.module";
import { CCatsModule } from "./cats/cats.module";
import { CFavoritesModule } from "./favorites/favorites.module";
import { CBansModule } from "./bans/bans.module";
import { CSocialsModule } from "./socials/socials.module";
import { CArticleCatsModule } from "./article.cats/article.cats.module";
import { CArticlesModule } from "./articles/articles.module";
import { CMessagesModule } from "./messages/messages.module";
import { CComplaintsModule } from "./complaints/complaints.module";
import { CModerableImagesModule } from "./moderable.images/moderable.images.module";

@Module({
    imports: [   
        CObjectsModule,
        CAdminsModule,   
        CLangsModule,
        CStatsModule,     
        CUsersModule, 
        CCountriesModule,   
        CCatsModule,   
        CFavoritesModule, 
        CBansModule,
        CSocialsModule,
        CArticleCatsModule,
        CArticlesModule,
        CMessagesModule,
        CComplaintsModule,
        CModerableImagesModule,
    ],    
})
export class CApiEditorModule {}
