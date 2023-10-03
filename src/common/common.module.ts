import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CMailtemplate } from "src/model/entities/mailtemplate";
import { CSetting } from "src/model/entities/setting";
import { CAppService } from "./services/app.service";
import { CErrorsService } from "./services/errors.service";
import { CMailService } from "./services/mail.service";
import { CSlugService } from "./services/slug.service";
import { CUploadsService } from "./services/uploads.service";
import { CError } from "src/model/entities/error";
import { CResizeService } from "./services/resize.service";
import { CSupabaseService } from "./services/supabase/supabase.service";
import { CPasswordsService } from "./services/passwords.service";
import { CNetworkService } from "./services/network.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CSetting,
            CError,
            CMailtemplate,
        ]),            
        HttpModule,
    ],
    providers: [
        CAppService,     
        CErrorsService,    
        CUploadsService,
        CMailService, 
        CSlugService,
        CResizeService,
        CPasswordsService,
        CNetworkService,
        CSupabaseService,
    ],
    exports: [
        CAppService,   
        CErrorsService,                
        CUploadsService,
        CMailService,  
        CSlugService,
        CResizeService,
        CPasswordsService,
        CNetworkService,
        CSupabaseService,
    ],
})
export class CCommonModule {}
