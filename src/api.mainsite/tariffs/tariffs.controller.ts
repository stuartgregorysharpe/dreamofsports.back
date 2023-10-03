import { Controller, Post, UseGuards } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CTariffsService } from "./tariffs.service";
import { ITariff } from "./dto/tariff.interface";
import { CUserGuard } from "src/common/services/guards/user.guard";

@Controller('api/mainsite/tariffs')
export class CTariffsController {
    constructor (private tariffsService: CTariffsService) {}        

    @UseGuards(CUserGuard)
    @Post("all")
    public all(): Promise<IResponse<ITariff[]>> {
        return this.tariffsService.all();
    }
}
