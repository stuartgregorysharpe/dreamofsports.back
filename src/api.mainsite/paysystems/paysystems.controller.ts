import { Controller, Post, UseGuards } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CPaysystemsService } from "./paysystems.service";
import { IPaysystem } from "./dto/paysystem.interface";
import { CUserGuard } from "src/common/services/guards/user.guard";

@Controller('api/mainsite/paysystems')
export class CPaysystemsController {
    constructor (private paysystemsService: CPaysystemsService) {}        

    @UseGuards(CUserGuard)
    @Post("all")
    public all(): Promise<IResponse<IPaysystem[]>> {
        return this.paysystemsService.all();
    }
}
