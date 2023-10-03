import { Controller, Post, Body, Param, Req, UseGuards, Request } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { IGetList } from "src/model/dto/getlist.interface";
import { CFirmsService } from "./firms.service";
import { IFirmOut } from "./dto/firm.out.interface";
import { JwtService } from "@nestjs/jwt";
import { CUserGuard } from "src/common/services/guards/user.guard";

@Controller('api/mainsite/firms')
export class CFirmsController {
    constructor (
        private firmsService: CFirmsService,
        private jwtService: JwtService,
    ) {}        
    
    @UseGuards(CUserGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<IFirmOut[]>> {
        return this.firmsService.chunk(dto);
    }

    @UseGuards(CUserGuard)
    @Post("one/:id")
    public one(@Param("id") id: string, @Req() request: Request): Promise<IResponse<IFirmOut>> {
        const token = request.headers["token"] as string;
        const visitor_id = token ? this.jwtService.decode(token)["id"] as number : null;
        return this.firmsService.one(parseInt(id), visitor_id);
    }    
}
