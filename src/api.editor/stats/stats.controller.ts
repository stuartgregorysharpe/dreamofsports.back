import { Controller, Param, Post, UseGuards } from "@nestjs/common";
import { IStatCats } from "src/api.owner/stats/dto/stat.cats.interface";
import { IStatTotals } from "src/api.owner/stats/dto/stat.totals.interface";
import { IStatUsersMonthly } from "src/api.owner/stats/dto/stat.users.monthly.interface";
import { CStatsService } from "src/api.owner/stats/stats.service";
import { CEditorGuard } from "src/common/services/guards/editor.guard";
import { IResponse } from "src/model/dto/response.interface";

@Controller('api/editor/stats')
export class CStatsController {
    constructor (private statsService: CStatsService) {}

    @UseGuards(CEditorGuard)
    @Post("users-monthly/:year")
    public usersMonthly(@Param("year") year: string): Promise<IResponse<IStatUsersMonthly>> {
        return this.statsService.usersMonthly(parseInt(year));
    }

    @UseGuards(CEditorGuard)
    @Post("cats")
    public cats(): Promise<IResponse<IStatCats>> {
        return this.statsService.cats();
    }    

    @UseGuards(CEditorGuard)
    @Post("totals")
    public totals(): Promise<IResponse<IStatTotals>> {
        return this.statsService.totals();
    }
}