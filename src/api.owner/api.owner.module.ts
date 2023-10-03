import { Module } from "@nestjs/common";
import { CAdminGroupsModule } from "./admin.groups/admin.groups.module";
import { CAdminsModule } from "./admins/admins.module";
import { CBackupsModule } from "./backups/backups.module";
import { CLangsModule } from "./langs/langs.module";
import { CMailtemplatesModule } from "./mailtemplates/mailtemplates.module";
import { CObjectsModule } from "./objects/objects.module";
import { CPagesModule } from "./pages/pages.module";
import { CSettingsModule } from "./settings/settings.module";
import { CFilesModule } from "./files/files.module";
import { CWordbooksModule } from "./wordbooks/wordbooks.module";
import { CEmployeesModule } from "./employees/employees.module";
import { CMessagesModule } from "./messages/messages.module";
import { CArticlesModule } from "./articles/articles.module";
import { CArticleCatsModule } from "./article.cats/article.cats.module";
import { CCountriesModule } from "./countries/countries.module";
import { CCatsModule } from "./cats/cats.module";
import { CUsersModule } from "./users/users.module";
import { CSocialsModule } from "./socials/socials.module";
import { CFavoritesModule } from "./favorites/favorites.module";
import { CBansModule } from "./bans/bans.module";
import { CTariffsModule } from "./tariffs/tariffs.module";
import { CPaysystemsModule } from "./paysystems/paysystems.module";
import { CPaymentsModule } from "./payments/payments.module";
import { CStatsModule } from "./stats/stats.module";
import { CComplaintsModule } from "./complaints/complaints.module";
import { CModerableImagesModule } from "./moderable.images/moderable.images.module";

@Module({
    imports: [   
        CObjectsModule,
        CAdminsModule,
        CAdminGroupsModule,
        CSettingsModule,      
        CLangsModule,      
        CWordbooksModule,   
        CFilesModule,
        CBackupsModule,
        CPagesModule,
        CMailtemplatesModule,
        CEmployeesModule,
        CMessagesModule,
        CArticlesModule,
        CArticleCatsModule,
        CCountriesModule,
        CCatsModule,
        CUsersModule,
        CSocialsModule,
        CFavoritesModule,
        CBansModule,
        CTariffsModule,
        CPaysystemsModule,
        CPaymentsModule,
        CStatsModule,
        CComplaintsModule,
        CModerableImagesModule,
    ],    
})
export class CApiOwnerModule {}
