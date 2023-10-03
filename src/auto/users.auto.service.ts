import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { CAppService } from "src/common/services/app.service";
import { CErrorsService } from "src/common/services/errors.service";
import { CMailService } from "src/common/services/mail.service";
import { CUser } from "src/model/entities/user";
import { Repository } from "typeorm";

@Injectable()
export class CUsersAutoService {
    constructor(
        @InjectRepository(CUser) private userRepository: Repository<CUser>,
        private mailService: CMailService,
        private appService: CAppService,
        private errorsService: CErrorsService,
    ) {}

    @Cron('0 8 11 * * *') // every date at 0:00
    private async notifyAboutEndingSubscription(): Promise<void> {
        try {
            const date = new Date();
            const now = this.appService.mysqlDate(date, "datetime");
            date.setDate(date.getDate() + 3); // now + 3 days
            const nowPlus3 = this.appService.mysqlDate(date, "datetime");
            const filter = `users.active='1' AND users.payed_until IS NOT NULL AND users.payed_until > '${now}' AND users.payed_until < '${nowPlus3}'`;
            const users = await this.userRepository
                .createQueryBuilder("users")
                .where(filter)
                .getMany();
            
            for (let u of users) {
                await this.mailService.userSubscriptionEnds(u.email, u.lang_id, this.appService.humanDate(u.payed_until, true));
            }
        } catch (err) {
            await this.errorsService.log("CUsersAutoService.notifyAboutEndingSubscription", err);
        }
    }
}