import { Controller, Param, Post, UseGuards } from "@nestjs/common";
import { CStatsService } from "./stats.service";
import { COwnerGuard } from "src/common/services/guards/owner.guard";
import { IResponse } from "src/model/dto/response.interface";
import { IStatUsersMonthly } from "./dto/stat.users.monthly.interface";
import { IStatCats } from "./dto/stat.cats.interface";
import { IStatTotals } from "./dto/stat.totals.interface";

@Controller('api/owner/stats')
export class CStatsController {
    constructor (private statsService: CStatsService) {}

    @UseGuards(COwnerGuard)
    @Post("users-monthly/:year")
    public usersMonthly(@Param("year") year: string): Promise<IResponse<IStatUsersMonthly>> {
        return this.statsService.usersMonthly(parseInt(year));
    }

    @UseGuards(COwnerGuard)
    @Post("cats")
    public cats(): Promise<IResponse<IStatCats>> {
        return this.statsService.cats();
    }

    @UseGuards(COwnerGuard)
    @Post("payments-monthly/:year")
    public paymentsMonthly(@Param("year") year: string): Promise<IResponse<number[]>> {
        return this.statsService.paymentsMonthly(parseInt(year));
    }

    @UseGuards(COwnerGuard)
    @Post("totals")
    public totals(): Promise<IResponse<IStatTotals>> {
        return this.statsService.totals();
    }
}