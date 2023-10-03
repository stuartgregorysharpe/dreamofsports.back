import { Injectable, CanActivate, ExecutionContext, HttpException, ForbiddenException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { CAdmin } from "src/model/entities/admin";
import { CUser } from "src/model/entities/user";
import { Repository } from "typeorm";

@Injectable()
export class CUserGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        @InjectRepository(CUser) private userRepository: Repository<CUser>,
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {        
        try {
            const token = context.switchToHttp().getRequest().headers["token"];        
            const data = this.jwtService.verify(token);      
            const id = data.id;
            const user = await this.userRepository.findOneBy({id});

            // admin must exists, be active and be in owners group
            if (!user || !user.active) {
                throw new ForbiddenException();
            }
            
            return true;
        } catch (err) {
            throw new HttpException({statusCode: 403, error: "unauthorized"}, 200);
        }        
    }
}