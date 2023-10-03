import { Injectable, CanActivate, ExecutionContext, HttpException, ForbiddenException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { CAdmin } from "src/model/entities/admin";
import { Repository } from "typeorm";

@Injectable()
export class CEditorGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        @InjectRepository(CAdmin) private adminRepository: Repository<CAdmin>,
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {        
        try {
            const token = context.switchToHttp().getRequest().headers["token"];        
            const data = this.jwtService.verify(token);      
            const id = data.id;
            const admin = await this.adminRepository.findOneBy({id});
            
            // admin must exists, be active and be in owners group or in editors group
            if (!admin || !admin.active || ![1,2].includes(admin.group_id)) {
                throw new ForbiddenException();
            }
            
            return true;
        } catch (err) {
            console.log("COwnerGuard: unauthorized");
            throw new HttpException({statusCode: 403, error: "unauthorized"}, 200);
        }        
    }
}