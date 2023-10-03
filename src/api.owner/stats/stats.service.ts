import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CErrorsService } from "src/common/services/errors.service";
import { CUser } from "src/model/entities/user";
import { Repository } from "typeorm";
import { IResponse } from "src/model/dto/response.interface";
import { CAppService } from "src/common/services/app.service";
import { CCat } from "src/model/entities/cat";
import { IStatUsersMonthly } from "./dto/stat.users.monthly.interface";
import { IStatCat, IStatCats } from "./dto/stat.cats.interface";
import { CPayment } from "src/model/entities/payment";
import { IStatTotals } from "./dto/stat.totals.interface";

@Injectable()
export class CStatsService {
    constructor(
        @InjectRepository(CUser) private userRepository: Repository<CUser>,
        @InjectRepository(CCat) private catRepository: Repository<CCat>,
        @InjectRepository(CPayment) private paymentRepository: Repository<CPayment>,
        private appService: CAppService,
        private errorsService: CErrorsService,
    ) {}

    public async usersMonthly(year: number): Promise<IResponse<IStatUsersMonthly>> {
        try {
            const data: IStatUsersMonthly = {
                users: [],
                athlets: [],
                firms: [],
            };

            for (let month = 0; month < 12; month++) {
                const daysInMonth = this.appService.daysInMonth(month, year);
                const dateFilter = `users.created_at >= '${year}-${month+1}-01 00:00:00.000000' AND users.created_at <= '${year}-${month+1}-${daysInMonth} 23:59:59.999999'`;
                const users = await this.userRepository.createQueryBuilder("users").where(dateFilter).getCount();
                const athlets = await this.userRepository.createQueryBuilder("users").where(`${dateFilter} AND users.type = 'athlet'`).getCount();
                const firms = await this.userRepository.createQueryBuilder("users").where(`${dateFilter} AND users.type = 'firm'`).getCount();
                data.users.push(users);
                data.athlets.push(athlets);
                data.firms.push(firms);
            }

            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CStatsService.usersMonthly", err);
            return {statusCode: 500, error};
        }
    }

    public async cats(): Promise<IResponse<IStatCats>> {
        try {
            const cats = await this.catRepository.find({relations: ["translations", "children"]}); 
            const leaves = cats.filter(c => !c.children.length);
            const statCats: IStatCat[] = [];

            for (let cat of leaves) {
                const filter = `users.type = 'athlet' AND athlet.cat_id = '${cat.id}'`;
                const q = await this.userRepository.createQueryBuilder("users").leftJoin("users.athlet", "athlet").where(filter).getCount();
                
                if (q) {
                    const name = cat.translations.find(t => t.lang_id === 1).name;
                    statCats.push({name, q, percent: 0});
                }
            }

            const total = statCats.reduce((acc, x) => acc + x.q, 0);

            if (statCats.length) {
                let acc = 0; // мы округляем проценты, но сумма может не сойтись, поэтому последний процент получим как 100 минус предыдущие

                for (let i = 0; i < statCats.length; i++) {                    
                    statCats[i].percent = i < statCats.length - 1 ? Math.round(statCats[i].q * 100 / total) : 100 - acc;
                    acc += statCats[i].percent;
                }

                statCats.sort((a, b) => b.percent - a.percent);
            } 
            
            
            const data = {cats: statCats, total};
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CStatsService.usersCats", err);
            return {statusCode: 500, error};
        }
    }

    public async paymentsMonthly(year: number): Promise<IResponse<number[]>> {
        try {
            const data: number[] = [];

            for (let month = 0; month < 12; month++) {
                const daysInMonth = this.appService.daysInMonth(month, year);
                const dateFilter = `payments.created_at >= '${year}-${month+1}-01 00:00:00.000000' AND payments.created_at <= '${year}-${month+1}-${daysInMonth} 23:59:59.999999' AND payments.completed = '1'`;
                const payments = await this.paymentRepository.createQueryBuilder("payments").where(dateFilter).getMany();
                const amount = payments.reduce((acc, x) => acc + x.amount, 0);
                data.push(amount);
            }

            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CStatsService.paymentsMonthly", err);
            return {statusCode: 500, error};
        }
    }

    public async totals(): Promise<IResponse<IStatTotals>> {
        try {
            const users = await this.userRepository.count();
            const athlets = await this.userRepository.count({where: {type: "athlet"}});
            const firms = await this.userRepository.count({where: {type: "firm"}});
            const payments_q = await this.paymentRepository.count({where: {completed: true}});
            const payments_amount = (await this.paymentRepository.createQueryBuilder("payments").select("SUM(payments.amount)", "total_amount").where("payments.completed='1'").getRawOne())["total_amount"] || 0;
            const data = {users, athlets, firms, payments_q, payments_amount};
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CStatsService.totals", err);
            return {statusCode: 500, error};
        }
    }
}