import { Body, Controller, Post, Req, UseGuards, Request } from "@nestjs/common";
import { CComplaintsService } from "./complaints.service";
import { JwtService } from "@nestjs/jwt";
import { CUserGuard } from "src/common/services/guards/user.guard";
import { IComplaintCreate } from "./dto/complaint.create.interface";
import { IResponse } from "src/model/dto/response.interface";

@Controller('api/mainsite/complaints')
export class CComplaintsController {
    constructor(
        private complaintsService: CComplaintsService,
        private jwtService: JwtService,
    ) {}  

    @UseGuards(CUserGuard)
    @Post("create")
    public create(@Body() dto: IComplaintCreate, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.complaintsService.create(visitor_id, dto);
    } 
}
