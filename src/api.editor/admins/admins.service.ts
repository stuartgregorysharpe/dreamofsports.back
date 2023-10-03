import { Injectable } from "@nestjs/common";
import { CAdminsService as COwnerAdminsService } from "src/api.owner/admins/admins.service";

@Injectable()
export class CAdminsService extends COwnerAdminsService {
    /////////////////
    // utils
    /////////////////
    
    protected async authorize(email: string, password: string): Promise<number> {
        const admin = await this.adminRepository
            .createQueryBuilder("admin")
            .addSelect("admin.password")
            .where({email})
            .getOne();      

        if (admin?.active && [1,2].includes(admin.group_id) && await this.passwordsService.compareHash(password, admin.password)) {            
            return admin.id;
        } 
            
        return null;        
    }
}
