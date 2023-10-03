import { Controller, Param, Post, Body, UseGuards, Req, Request } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CAdmin } from "src/model/entities/admin";
import { IAdminLogin } from "src/model/dto/admin.login.interface";
import { IAdminAuthData } from "src/model/dto/admin.authdata.interface";
import { IAdminVerify } from "src/model/dto/admin.verify.interface";
import { IAdminRecovery } from "src/model/dto/admin.recovery.interface";
import { JwtService } from "@nestjs/jwt";
import { CEditorGuard } from "src/common/services/guards/editor.guard";
import { CAdminsService } from "./admins.service";

@Controller('api/editor/admins')
export class CAdminsController {
    constructor (
        private adminsService: CAdminsService,
        private jwtService: JwtService,
    ) {}    
    
    @Post("login")
    public login(@Body() dto: IAdminLogin): Promise<IResponse<IAdminAuthData>> {
        return this.adminsService.login(dto);
    } 

    @Post("verify")
    public verify(@Body() dto: IAdminVerify): Promise<IResponse<void>> {
        return this.adminsService.verify(dto);
    }

    @Post("recover")
    public recover(@Body() dto: IAdminRecovery): Promise<IResponse<void>> {
        return this.adminsService.recover(dto);
    }    

    @UseGuards(CEditorGuard)
    @Post("me")
    public me(@Req() request: Request): Promise<IResponse<CAdmin>> {
        const id = this.jwtService.decode(request.headers["token"] as string)["id"] as number;
        return this.adminsService.one(id);
    }
}
