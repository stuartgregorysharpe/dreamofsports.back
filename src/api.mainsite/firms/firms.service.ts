import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CAppService } from "src/common/services/app.service";
import { CErrorsService } from "src/common/services/errors.service";
import { IGetList } from "src/model/dto/getlist.interface";
import { IResponse } from "src/model/dto/response.interface";
import { CLang } from "src/model/entities/lang";
import { CUser } from "src/model/entities/user";
import { Repository } from "typeorm";
import { IFirmOut } from "./dto/firm.out.interface";
import { CCountry } from "src/model/entities/country";
import { ICountry } from "../countries/dto/country.interface";

@Injectable()
export class CFirmsService {
    constructor(
        @InjectRepository(CUser) private userRepository: Repository<CUser>,
        @InjectRepository(CLang) private langRepository: Repository<CLang>,
        private appService: CAppService,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<IFirmOut[]>> {
        try {      
            const filter = await this.buildFilter(dto.filter);
            const sortBy = `users.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            // из-за фильтрации по присоединенной таблице translations будем делать выборку в два этапа, 
            // сначала найдем id с учетом фильтра, потом полные объекты из id без фильтра,
            // иначе в выборку не попадут присоединенные translations, не отвечающие фильтру
            const preusers = await this.userRepository
                .createQueryBuilder("users")
                .leftJoin("users.firm", "firm")
                .leftJoin("firm.translations", "firm_translations")
                .leftJoin("firm.reg_country", "reg_country")
                .leftJoin("reg_country.translations", "reg_country_translations")
                .leftJoin("firm.fact_country", "fact_country")
                .leftJoin("fact_country.translations", "fact_country_translations")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const ids = preusers.map(x => x.id);
            const users = await this.userRepository
                .createQueryBuilder("users")
                .leftJoinAndSelect("users.firm", "firm")
                .leftJoinAndSelect("firm.translations", "firm_translations")
                .leftJoinAndSelect("firm.reg_country", "reg_country")
                .leftJoinAndSelect("reg_country.translations", "reg_country_translations")
                .leftJoinAndSelect("firm.fact_country", "fact_country")
                .leftJoinAndSelect("fact_country.translations", "fact_country_translations")
                .whereInIds(ids)
                .orderBy({[sortBy]: sortDir})
                .getMany();
            const elementsQuantity = await this.userRepository
                .createQueryBuilder("users")
                // join to apply filter
                .leftJoin("users.firm", "firm") 
                .leftJoin("firm.translations", "firm_translations") 
                .leftJoin("firm.reg_country", "reg_country")
                .leftJoin("reg_country.translations", "reg_country_translations")
                .leftJoin("firm.fact_country", "fact_country")
                .leftJoin("fact_country.translations", "fact_country_translations")
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            const langs = await this.langRepository.find({where: {active: true}});
            const data = users.map(u => this.buildFirmoForList(u, langs));
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CFirmsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number, visitor_id: number): Promise<IResponse<IFirmOut>> {
        try {
            let visitor = null;            

            if (visitor_id) {
                visitor = await this.userRepository.findOne({where: {id: visitor_id}});
            }
            
            const user = await this.userRepository
                .createQueryBuilder("user")
                .where(`user.id = '${id}'`)
                .leftJoinAndSelect("user.firm", "firm")
                .leftJoinAndSelect("firm.translations", "firm_translations")
                .leftJoinAndSelect("firm.reg_country", "reg_country")
                .leftJoinAndSelect("reg_country.translations", "reg_country_translations")
                .leftJoinAndSelect("firm.fact_country", "fact_country")
                .leftJoinAndSelect("fact_country.translations", "fact_country_translations")                
                .leftJoinAndSelect("user.phones", "phones")
                .leftJoinAndSelect("user.emails", "emails")
                .leftJoinAndSelect("user.links", "links")
                .leftJoinAndSelect("user.socials", "socials")
                .leftJoinAndSelect("socials.social", "socials_social")
                .leftJoinAndSelect("user.images", "images")
                .leftJoinAndSelect("user.videos", "videos")
                .leftJoinAndSelect("user.others", "others")
                .orderBy({
                    "phones.pos": "ASC", 
                    "emails.pos": "ASC", 
                    "links.pos": "ASC", 
                    "socials.pos": "ASC", 
                    "images.pos": "ASC", 
                    "videos.pos": "ASC", 
                    "others.pos": "ASC",                
                })
                .getOne();
            const langs = await this.langRepository.find({where: {active: true}});            
            return user ? {statusCode: 200, data: this.buildFirmoSingle(user, langs, visitor)} : {statusCode: 404, error: "user not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CFirmsService.one", err);
            return {statusCode: 500, error};
        }
    }

    //////////////////////
    // utils
    //////////////////////    

    private buildFirmoForList(user: CUser, langs: CLang[]): IFirmOut {
        const data: IFirmOut = {
            id: user.id,            
            img_s: user.firm.img_s,
            name: {},
            reg_country: user.firm.reg_country ? this.buildCountry(user.firm.reg_country, langs) : null,
        };

        for (let l of langs) {
            const t = user.firm.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
        }

        return data;
    }

    private buildFirmoSingle(user: CUser, langs: CLang[], visitor: CUser): IFirmOut {
        // const full = visitor && visitor.payed_until && visitor.payed_until.getTime() > new Date().getTime();
        const full = false;
        const data: IFirmOut = {
            id: user.id,
            img: user.firm.img,
            img_s: user.firm.img_s,
            name: {},
            branch: {},
            founder: {},
            reg_no: user.firm.reg_no,
            reg_date: this.appService.mysqlDateToHumanDate(user.firm.reg_date),
            reg_addr: {},
            fact_addr: {},
            about: {},
            reg_country: user.firm.reg_country ? this.buildCountry(user.firm.reg_country, langs) : null,
            fact_country: user.firm.fact_country ? this.buildCountry(user.firm.fact_country, langs) : null,
            phones: full ? user.phones.map(x => ({id: x.id, value: x.value})) : null,
            emails: full ? user.emails.map(x => ({id: x.id, value: x.value})) : null,
            links: full ? user.links.map(x => ({id: x.id, value: x.value})) : null,
            socials: full ? user.socials.map(x => ({id: x.id, value: x.value, img: x.social.img})) : null,
            images: user.images.map(x => ({id: x.id, url: x.url})),
            videos: user.videos.map(x => ({id: x.id, url: x.url})),
            others: user.others.map(x => ({id: x.id, url: x.url, name: x.name})),
        };

        for (let l of langs) {
            const t = user.firm.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
            data.branch[l.slug] = t.branch;
            data.founder[l.slug] = t.founder;
            data.reg_addr[l.slug] = t.reg_addr;
            data.fact_addr[l.slug] = t.fact_addr;
            data.about[l.slug] = t.about.replace(/\n/g, '<br>');
        }

        return data;
    }

    private buildCountry(country: CCountry, langs: CLang[]): ICountry {
        const data: ICountry = {
            id: country.id,            
            name: {},
        }

        for (let l of langs) {
            const t = country.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
        }

        return data;
    }
    
    private async buildFilter(dtoFilter: any): Promise<string> {
        let filter = "users.type = 'firm' AND users.active='1' AND users.filled='1'";

        if (dtoFilter.search) {
            filter += ` AND (
                LOWER(firm_translations.name) LIKE LOWER('%${dtoFilter.search}%') OR 
                LOWER(firm_translations.branch) LIKE LOWER('%${dtoFilter.search}%') OR 
                LOWER(firm_translations.reg_addr) LIKE LOWER('%${dtoFilter.search}%') OR 
                LOWER(firm_translations.fact_addr) LIKE LOWER('%${dtoFilter.search}%') OR 
                LOWER(reg_country_translations.name) LIKE LOWER('%${dtoFilter.search}%') OR 
                LOWER(fact_country_translations.name) LIKE LOWER('%${dtoFilter.search}%')
            )`;
        }
        
        if (dtoFilter.created_at_less !== undefined) {
            filter += ` AND users.created_at <= '${this.appService.mysqlDate(new Date(dtoFilter.created_at_less), "datetime")}'`;
        }

        return filter;
    }
}