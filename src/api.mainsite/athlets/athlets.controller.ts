import { Controller, Post, Body, Param, Req, UseGuards, Request } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { IGetList } from "src/model/dto/getlist.interface";
import { CAthletsService } from "./athlets.service";
import { IAthletOut } from "./dto/athlet.out.interface";
import { JwtService } from "@nestjs/jwt";
import { CUserGuard } from "src/common/services/guards/user.guard";

@Controller('api/mainsite/athlets')
export class CAthletsController {
    constructor (
        private athletsService: CAthletsService,
        private jwtService: JwtService,
    ) {}        
    
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<IAthletOut[]>> {
        return this.athletsService.chunk(dto);
    }
    
    @Post("one/:id")
    public one(@Param("id") id: string, @Req() request: Request): Promise<IResponse<IAthletOut>> {
        const token = request.headers["token"] as string;
        const visitor_id = token ? this.jwtService.decode(token)["id"] as number : null;
        return this.athletsService.one(parseInt(id), visitor_id);
    }

    @UseGuards(CUserGuard)
    @Post("favorites-create/:favorite_id")
    public favoritesCreate(@Param("favorite_id") favorite_id: string, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.athletsService.favoritesCreate(visitor_id, parseInt(favorite_id));
    }

    @UseGuards(CUserGuard)
    @Post("favorites-chunk")
    public favoritesChunk(@Body() dto: IGetList, @Req() request: Request): Promise<IResponse<IAthletOut[]>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"];
        return this.athletsService.favoritesChunk(dto, visitor_id);
    }

    @UseGuards(CUserGuard)
    @Post("favorites-delete/:favorite_id")
    public favoritesDelete(@Param("favorite_id") favorite_id: string, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.athletsService.favoritesDelete(visitor_id, parseInt(favorite_id));
    }
}
