import { Controller, Post, Body, UseGuards, Param, Req, UseInterceptors, UploadedFiles, Request } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { IUserLogin } from "./dto/user.login.interface";
import { IUserAuthData } from "./dto/user.authdata.interface";
import { CUsersService } from "./users.service";
import { IUserVerify } from "./dto/user.verify.interface";
import { IUserRegister } from "./dto/user.register.interface";
import { IUserEnterByEmail } from "./dto/user.enterbyemail.interface";
import { IUserRecover } from "./dto/user.recover.interface";
import { IUserGetLinkedinEmail } from "./dto/user.getlinkedinemail.interface";
import { CUserGuard } from "src/common/services/guards/user.guard";
import { JwtService } from "@nestjs/jwt";
import { IUser } from "./dto/user.interface";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { IUserDelete } from "./dto/user.delete.interface";

@Controller('api/mainsite/users')
export class CUsersController {
    constructor (
        private usersService: CUsersService,
        private jwtService: JwtService,
    ) {}    

    @Post("login")
    public login(@Body() dto: IUserLogin): Promise<IResponse<IUserAuthData>> {                        
        return this.usersService.login(dto);
    } 

    @Post("verify")
    public verify(@Body() dto: IUserVerify): Promise<IResponse<void>> {        
        return this.usersService.verify(dto);
    }

    @Post("register")
    public register(@Body() dto: IUserRegister): Promise<IResponse<IUserAuthData>> {
        return this.usersService.register(dto);
    }

    @Post("enter-by-email")
    public enterByEmail(@Body() dto: IUserEnterByEmail): Promise<IResponse<IUserAuthData>> {
        return this.usersService.enterByEmail(dto);
    }

    @Post("recover")
    public recover(@Body() dto: IUserRecover): Promise<IResponse<void>> {
        return this.usersService.recover(dto);
    }

    @Post("linkedin-email")
    public linkedinToken(@Body() dto: IUserGetLinkedinEmail): Promise<IResponse<string>> {
        return this.usersService.linkedinEmail(dto);
    }

    @UseGuards(CUserGuard)
    @Post("me")
    public me(@Req() request: Request): Promise<IResponse<IUser>> {
        const id = this.jwtService.decode(request.headers["token"] as string)["id"] as number;
        return this.usersService.one(id);
    }

    @UseGuards(CUserGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @Post("update-me")
    public updateMe(@Body() fd: IJsonFormData, @UploadedFiles() uploads: Express.Multer.File[], @Req() request: Request): Promise<IResponse<void>> {
        const user_id = this.jwtService.decode(request.headers["token"] as string)["id"] as number;
        return this.usersService.update(user_id, fd, uploads);
    }

    @UseGuards(CUserGuard)
    @Post("delete-me")
    public deleteMe(@Body() dto: IUserDelete, @Req() request: Request): Promise<IResponse<void>> {
        const user_id = this.jwtService.decode(request.headers["token"] as string)["id"] as number;
        return this.usersService.delete(user_id, dto);
    }

    @UseGuards(CUserGuard)
    @Post("toggle-follow/:id")
    public follow(@Param("id") user:number, @Req() request: Request): Promise<IResponse<boolean>> {
        const user_id = this.jwtService.decode(request.headers["token"] as string)["id"] as number;
        return this.usersService.follow(user_id, user, "follow");
    }

    @UseGuards(CUserGuard)
    @Post("toggle-subscribe/:id")
    public subscribe(@Param("id") user:number, @Req() request: Request): Promise<IResponse<boolean>> {
        const user_id = this.jwtService.decode(request.headers["token"] as string)["id"] as number;
        return this.usersService.follow(user_id, user, "subscribe");
    }

    @UseGuards(CUserGuard)
    @Post("if-follow/:id")
    public ifFollow(@Param("id") user:number, @Body() dto, @Req() request: Request): Promise<IResponse<boolean>> {
        const token = request.headers["token"] as string;
        const user_id = this.jwtService.decode(token)["id"] as number;
        return this.usersService.ifFollow(user_id, user, dto.type);
    }
}
