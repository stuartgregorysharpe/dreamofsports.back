import { Module } from "@nestjs/common";
import { CLangsModule } from "./langs/langs.module";
import { CPagesModule } from "./pages/pages.module";
import { CSettingsModule } from "./settings/settings.module";
import { CWordsModule } from "./words/words.module";
import { CFilesModule } from "./files/files.module";
import { CEmployeesModule } from "./employees/employees.module";
import { CMessagesModule } from "./messages/messages.module";
import { CArticlesModule } from "./articles/articles.module";
import { CArticleCatsModule } from "./article.cats/article.cats.module";
import { CUsersModule } from "./users/users.module";
import { CCountriesModule } from "./countries/countries.module";
import { CSocialsModule } from "./socials/socials.module";
import { CCatsModule } from "./cats/cats.module";
import { CAthletsModule } from "./athlets/athlets.module";
import { CProxyModule } from "./proxy/proxy.module";
import { CFirmsModule } from "./firms/firms.module";
import { CChatsModule } from "./chats/chats.module";
import { CChatMessagesModule } from "./chat.messages/chat.messages.module";
import { CTariffsModule } from "./tariffs/tariffs.module";
import { CPaysystemsModule } from "./paysystems/paysystems.module";
import { CPaymentsModule } from "./payments/payments.module";
import { CComplaintsModule } from "./complaints/complaints.module";
import { CPostModule } from "./posts/posts.module";

@Module({
    imports: [    
        CProxyModule,    
        CSettingsModule,
        CLangsModule,
        CWordsModule,
        CFilesModule,    
        CPagesModule,    
        CEmployeesModule,
        CMessagesModule,
        CArticlesModule,
        CArticleCatsModule,
        CUsersModule,
        CCountriesModule,
        CSocialsModule,
        CCatsModule,
        CAthletsModule,
        CFirmsModule,
        CChatsModule,
        CChatMessagesModule,
        CTariffsModule,
        CPaysystemsModule,
        CPaymentsModule,
        CComplaintsModule,
        CPostModule,
    ],    
})
export class CApiMainsiteModule {}
