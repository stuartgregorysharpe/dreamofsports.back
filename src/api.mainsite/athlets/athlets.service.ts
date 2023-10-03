import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CAppService } from "src/common/services/app.service";
import { CErrorsService } from "src/common/services/errors.service";
import { IGetList } from "src/model/dto/getlist.interface";
import { IResponse } from "src/model/dto/response.interface";
import { CUser } from "src/model/entities/user";
import { Repository } from "typeorm";
import { IAthletOut, IAthletOutReward } from "./dto/athlet.out.interface";
import { CLang } from "src/model/entities/lang";
import { CCat } from "src/model/entities/cat";
import { ICat } from "../cats/dto/cat.interface";
import { CCountry } from "src/model/entities/country";
import { ICountry } from "../countries/dto/country.interface";
import { CReward } from "src/model/entities/reward";
import { CFavorite } from "src/model/entities/favorite";

@Injectable()
export class CAthletsService {
    constructor(
        @InjectRepository(CUser) private userRepository: Repository<CUser>,
        @InjectRepository(CLang) private langRepository: Repository<CLang>,
        @InjectRepository(CCat) private catRepository: Repository<CCat>,
        @InjectRepository(CFavorite) private favoriteRepository: Repository<CFavorite>,
        private appService: CAppService,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<IAthletOut[]>> {
        try {      
            const filter = await this.buildFilter(dto.filter);
            const sortBy = `users.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            // из-за фильтрации по присоединенной таблице translations будем делать выборку в два этапа, 
            // сначала найдем id с учетом фильтра, потом полные объекты из id без фильтра,
            // иначе в выборку не попадут присоединенные translations, не отвечающие фильтру
            const preusers = await this.userRepository
                .createQueryBuilder("users")
                .leftJoin("users.athlet", "athlet")
                .leftJoin("athlet.translations", "athlet_translations")
                .leftJoin("athlet.cat", "cat")
                .leftJoin("cat.translations", "cat_translations")
                .leftJoin("athlet.country", "country")
                .leftJoin("country.translations", "country_translations")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const ids = preusers.map(x => x.id);
            const users = await this.userRepository
                .createQueryBuilder("users")
                .leftJoinAndSelect("users.athlet", "athlet")
                .leftJoinAndSelect("athlet.translations", "athlet_translations")
                .leftJoinAndSelect("athlet.cat", "cat")
                .leftJoinAndSelect("cat.translations", "cat_translations")
                .leftJoinAndSelect("athlet.country", "country")
                .leftJoinAndSelect("country.translations", "country_translations")
                .whereInIds(ids)
                .orderBy({[sortBy]: sortDir})
                .getMany();
            const elementsQuantity = await this.userRepository
                .createQueryBuilder("users")
                // join to apply filter
                .leftJoin("users.athlet", "athlet") 
                .leftJoin("athlet.translations", "athlet_translations") 
                .leftJoin("athlet.cat", "cat")
                .leftJoin("cat.translations", "cat_translations")
                .leftJoin("athlet.country", "country")
                .leftJoin("country.translations", "country_translations")
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            const langs = await this.langRepository.find({where: {active: true}});
            const data = users.map(u => this.buildAthletoForList(u, langs));
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CAthletsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number, visitor_id: number): Promise<IResponse<IAthletOut>> {
        try {
            let visitor = null;            

            if (visitor_id) {
                visitor = await this.userRepository.findOne({where: {id: visitor_id, active: true}, relations: ["favorites"]});
            }
            
            const user = await this.userRepository
                .createQueryBuilder("user")
                .where(`user.id = '${id}'`)
                .leftJoinAndSelect("user.athlet", "athlet")
                .leftJoinAndSelect("athlet.translations", "athlet_translations")
                .leftJoinAndSelect("athlet.cat", "cat")
                .leftJoinAndSelect("cat.translations", "cat_translations")
                .leftJoinAndSelect("athlet.country", "country")
                .leftJoinAndSelect("country.translations", "country_translations")
                .leftJoinAndSelect("user.phones", "phones")
                .leftJoinAndSelect("user.emails", "emails")
                .leftJoinAndSelect("user.links", "links")
                .leftJoinAndSelect("user.socials", "socials")
                .leftJoinAndSelect("socials.social", "socials_social")
                .leftJoinAndSelect("user.images", "images")
                .leftJoinAndSelect("user.videos", "videos")
                .leftJoinAndSelect("user.others", "others")
                .leftJoinAndSelect("athlet.rewards", "rewards")
                .leftJoinAndSelect("rewards.translations", "rewards_translations")
                .orderBy({
                    "phones.pos": "ASC", 
                    "emails.pos": "ASC", 
                    "links.pos": "ASC", 
                    "socials.pos": "ASC", 
                    "images.pos": "ASC", 
                    "videos.pos": "ASC", 
                    "others.pos": "ASC",
                    "rewards.date": "DESC"
                })
                .getOne();
            const langs = await this.langRepository.find({where: {active: true}});            
            return user ? {statusCode: 200, data: this.buildAthletoSingle(user, langs, visitor)} : {statusCode: 404, error: "user not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CAthletsService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async favoritesCreate(visitor_id: number, favorite_id: number): Promise<IResponse<void>> {
        try {
            const visitor = await this.userRepository.findOne({where: {id: visitor_id, active: true}, relations: ["favorites"]});
            
            // if (!visitor || !visitor.payed_until || visitor.payed_until.getTime() < new Date().getTime()) {
            //     return {statusCode: 401, error: "only paid"};
            // }

            if (!visitor.favorites.map(f => f.favorite_id).includes(favorite_id)) {
                const favorite = this.favoriteRepository.create({user_id: visitor_id, favorite_id});
                await this.favoriteRepository.save(favorite);    
            }
            
            return {statusCode: 201};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CAthletsService.favoritesCreate", err);
            return {statusCode: 500, error};
        }
    }

    public async favoritesDelete(visitor_id: number, favorite_id: number): Promise<IResponse<void>> {
        try {
            const favorite = await this.favoriteRepository.findOne({where: {user_id: visitor_id, favorite_id}});

            if (!favorite) {
                return {statusCode: 404, error: "favorite not found"};
            }

            await this.favoriteRepository.remove(favorite);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CAthletsService.favoritesDelete", err);
            return {statusCode: 500, error};
        }
    }

    public async favoritesChunk(dto: IGetList, visitor_id: number): Promise<IResponse<IAthletOut[]>> {
        try {
            const filter = this.buildFavoritesFilter(dto.filter, visitor_id);
            const sortBy = `favorites.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            const favorites = await this.favoriteRepository
                .createQueryBuilder("favorites")
                .leftJoinAndSelect("favorites.favorite", "favorite")
                .leftJoinAndSelect("favorite.athlet", "athlet")
                .leftJoinAndSelect("athlet.translations", "athlet_translations")
                .leftJoinAndSelect("athlet.cat", "cat")
                .leftJoinAndSelect("cat.translations", "cat_translations")
                .leftJoinAndSelect("athlet.country", "country")
                .leftJoinAndSelect("country.translations", "country_translations")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const elementsQuantity = await this.favoriteRepository
                .createQueryBuilder("favorites")
                .leftJoin("favorites.favorite", "favorite") // to apply filter
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            const langs = await this.langRepository.find({where: {active: true}});
            const data = favorites.map(f => this.buildAthletoForList(f.favorite, langs));
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};            
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CAthletsService.favoritesChunk", err);
            return {statusCode: 500, error};
        }
    }

    //////////////////////
    // utils
    //////////////////////    

    private buildAthletoForList(user: CUser, langs: CLang[]): IAthletOut {
        const data: IAthletOut = {
            id: user.id,
            // top: user.payed_until && user.payed_until.getTime() > new Date().getTime(),
            top: false,
            img_s: user.athlet.img_s,
            birthdate: user.athlet.birthdate ? this.appService.mysqlDateToHumanDate(user.athlet.birthdate) : "",
            age: this.appService.age(new Date(user.athlet.birthdate)),
            gender: user.athlet.gender,
            height_meter: user.athlet.height_meter,
            height_foot: user.athlet.height_foot,
            weight_kg: user.athlet.weight_kg,
            weight_pound: user.athlet.weight_pound,
            firstname: {},
            lastname: {},
            cat: user.athlet.cat ? this.buildCat(user.athlet.cat, langs) : null,
            country: user.athlet.country ? this.buildCountry(user.athlet.country, langs) : null,
        };

        for (let l of langs) {
            const t = user.athlet.translations.find(t => t.lang_id === l.id);
            data.firstname[l.slug] = t.firstname;
            data.lastname[l.slug] = t.lastname;
        }

        return data;
    }

    private buildAthletoSingle(user: CUser, langs: CLang[], visitor: CUser): IAthletOut {
        // const full = visitor && visitor.payed_until && visitor.payed_until.getTime() > new Date().getTime();
        const full = false;
        const data: IAthletOut = {
            id: user.id,
            // top: user.payed_until && user.payed_until.getTime() > new Date().getTime(),
            top: false,
            favorite: visitor && visitor.favorites.map(f => f.favorite_id).includes(user.id),
            img: user.athlet.img,
            img_s: user.athlet.img_s,
            birthdate: user.athlet.birthdate ? this.appService.mysqlDateToHumanDate(user.athlet.birthdate) : "",
            age: this.appService.age(new Date(user.athlet.birthdate)),
            gender: user.athlet.gender,
            height_meter: user.athlet.height_meter,
            height_foot: user.athlet.height_foot,
            weight_kg: user.athlet.weight_kg,
            weight_pound: user.athlet.weight_pound,
            no: user.athlet.no,
            firstname: {},
            lastname: {},
            region: {},
            city: {},
            bio: {},
            team: {},
            role: {},
            cat: user.athlet.cat ? this.buildCat(user.athlet.cat, langs) : null,
            country: user.athlet.country ? this.buildCountry(user.athlet.country, langs) : null,
            phones: full ? user.phones.map(x => ({id: x.id, value: x.value})) : null,
            emails: full ? user.emails.map(x => ({id: x.id, value: x.value})) : null,
            links: full ? user.links.map(x => ({id: x.id, value: x.value})) : null,
            socials: full ? user.socials.map(x => ({id: x.id, value: x.value, img: x.social.img})) : null,
            images: user.images.map(x => ({id: x.id, url: x.url})),
            videos: user.videos.map(x => ({id: x.id, url: x.url})),
            others: user.others.map(x => ({id: x.id, url: x.url, name: x.name})),
            rewards: user.athlet.rewards.map(r => this.buildReward(r, langs)),
        };

        for (let l of langs) {
            const t = user.athlet.translations.find(t => t.lang_id === l.id);
            data.firstname[l.slug] = t.firstname;
            data.lastname[l.slug] = t.lastname;
            data.region[l.slug] = t.region;
            data.city[l.slug] = t.city;
            data.bio[l.slug] = t.bio.replace(/\n/g, '<br>');
            data.team[l.slug] = t.team;
            data.role[l.slug] = t.role;
        }

        return data;
    }

    private buildReward(reward: CReward, langs: CLang[]): IAthletOutReward {
        const data: IAthletOutReward = {
            id: reward.id,
            date: reward.date ? this.appService.mysqlDateToHumanDate(reward.date) : "",
            img: reward.img,
            name: {},
        };

        for (let l of langs) {
            const t = reward.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
        }

        return data;
    }

    private buildCat(cat: CCat, langs: CLang[]): ICat {
        const data: ICat = {
            id: cat.id,
            slug: cat.slug,
            name: {},
        }

        for (let l of langs) {
            const t = cat.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
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
        let filter = "users.type = 'athlet' AND users.active='1' AND users.filled='1'";

        if (dtoFilter.search) {
            filter += ` AND (
                LOWER(CONCAT(athlet_translations.firstname, ' ', athlet_translations.lastname)) LIKE LOWER('%${dtoFilter.search}%') OR                 
                LOWER(CONCAT(athlet_translations.lastname, ' ', athlet_translations.firstname)) LIKE LOWER('%${dtoFilter.search}%') OR 
                LOWER(athlet_translations.region) LIKE LOWER('%${dtoFilter.search}%') OR 
                LOWER(athlet_translations.city) LIKE LOWER('%${dtoFilter.search}%') OR 
                LOWER(athlet_translations.team) LIKE LOWER('%${dtoFilter.search}%') OR 
                LOWER(athlet_translations.role) LIKE LOWER('%${dtoFilter.search}%') OR 
                LOWER(cat_translations.name) LIKE LOWER('%${dtoFilter.search}%') OR 
                LOWER(country_translations.name) LIKE LOWER('%${dtoFilter.search}%')
            )`;
        }

        if (dtoFilter.cat_slug !== undefined) {
            const cat_ids = (await this.getCatIdsWithChildren(dtoFilter.cat_slug)).map(id => id.toString()).toString();           
            filter += ` AND athlet.cat_id IN (${cat_ids})`;
        }

        if (dtoFilter.age !== undefined) {
            const from = new Date();
            from.setFullYear(from.getFullYear() - dtoFilter.age[1]);
            const to = new Date();
            to.setFullYear(to.getFullYear() - dtoFilter.age[0]);            
            filter += ` AND athlet.birthdate >= '${this.appService.mysqlDate(from, "date")}' AND athlet.birthdate <= '${this.appService.mysqlDate(to, "date")}'`;
        }

        if (dtoFilter.country_id !== undefined) {
            filter += ` AND athlet.country_id = '${dtoFilter.country_id}'`;
        }

        if (dtoFilter.gender !== undefined) {
            filter += ` AND athlet.gender = '${dtoFilter.gender}'`;
        }

        // if (dtoFilter.top !== undefined) {
        //     if (dtoFilter.top) {
        //         filter += ` AND users.payed_until > '${this.appService.mysqlDate(new Date(), "datetime")}'`;
        //     } else {
        //         filter += ` AND (users.payed_until < '${this.appService.mysqlDate(new Date(), "datetime")}') OR users.payed_until IS NULL`;
        //     }            
        // }

        if (dtoFilter.payed_at_less !== undefined) {
            filter += ` AND users.payed_at <= '${this.appService.mysqlDate(new Date(dtoFilter.payed_at_less), "datetime")}'`;
        }

        if (dtoFilter.created_at_less !== undefined) {
            filter += ` AND users.created_at <= '${this.appService.mysqlDate(new Date(dtoFilter.created_at_less), "datetime")}'`;
        }

        return filter;
    }

    private async getCatIdsWithChildren(slug: string): Promise<number[]> {        
        const cat = await this.catRepository.findOne({where: {slug}});
        if (!cat) return [];
        cat.children = await this.appService.buildChildren(cat, this.catRepository, "pos", 1) as CCat[];
        
        const getIds = cat => {
            if (!cat.children.length) return [cat.id];            
            let ids: number[] = []; 

            for (let child of cat.children) {
                ids = [...ids, ...getIds(child)]
            }

            return ids;
        };

        return getIds(cat);
    }

    private buildFavoritesFilter(dtoFilter: any, visitor_id: number): string {
        let filter = `favorites.user_id='${visitor_id}' AND favorite.active='1' AND favorite.filled='1'`;

        if (dtoFilter.created_at_less !== undefined) {
            filter += ` AND favorites.created_at <= '${this.appService.mysqlDate(new Date(dtoFilter.created_at_less), "datetime")}'`;
        }

        return filter;
    }
}