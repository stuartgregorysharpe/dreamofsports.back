import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CErrorsService } from "src/common/services/errors.service";
import { CArticle } from "src/model/entities/article";
import { CLang } from "src/model/entities/lang";
import { Repository } from "typeorm";
import { IArticle } from "./dto/article.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { IResponse } from "src/model/dto/response.interface";
import { CAppService } from "src/common/services/app.service";
import { CArticleCat } from "src/model/entities/article.cat";
import { IArticleCat } from "../article.cats/dto/article.cat.interface";

@Injectable()
export class CArticlesService {
    constructor(
        @InjectRepository(CArticle) private articleRepository: Repository<CArticle>,
        @InjectRepository(CLang) private langRepository: Repository<CLang>,
        private errorsService: CErrorsService,
        private appService: CAppService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<IArticle[]>> {
        try {     
            const filter = this.buildFilter(dto.filter);
            const sortBy = `articles.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";  
            const articles = await this.articleRepository
                .createQueryBuilder("articles")
                .leftJoinAndSelect("articles.translations", "translations")
                .leftJoinAndSelect("articles.cat", "cat")
                .leftJoinAndSelect("cat.translations", "cat_translations")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();  
            const elementsQuantity = await this.articleRepository
                .createQueryBuilder("articles")
                .leftJoin("articles.cat", "cat") // to apply filter
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q); 
            const langs = await this.langRepository.find({where: {active: true}}); 
            const data = articles.map(a => this.buildArticleForList(a, langs));
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CArticlesService.chunk", err);
            return {statusCode: 500, error};
        }
    }   

    public async one(slug: string): Promise<IResponse<IArticle>> {
        try {
            const article = await this.articleRepository.findOne({where: {slug, active: true}, relations: ["translations", "cat", "cat.translations"]});               

            if (!article) {
                return {statusCode: 404, error: "article not found"};
            }

            const langs = await this.langRepository.find({where: {active: true}});   
            const data = this.buildArticleSingle(article, langs);
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CArticlesService.one", err);
            return {statusCode: 500, error};
        }
    }

    /////////////////
    // utils
    /////////////////
    private buildArticleForList(article: CArticle, langs: CLang[]): IArticle {
        const data: IArticle = {
            id: article.id,
            slug: article.slug,
            date: article.date,
            img: article.img,
            img_s: article.img_s,
            name: {},
            contentshort: {},
            cat: article.cat ? this.buildArticleCat(article.cat, langs) : null,
        };

        for (let l of langs) {
            const t = article.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
            data.contentshort[l.slug] = t.contentshort;
        }

        return data;
    }

    private buildArticleSingle(article: CArticle, langs: CLang[]): IArticle {
        const data: IArticle = {
            id: article.id,
            date: article.date,
            img_s: article.img_s,            
            name: {},
            content: {},
            title: {},
            description: {},
            h1: {},
            cat: article.cat ? this.buildArticleCat(article.cat, langs) : null,
        };

        for (let l of langs) {
            const t = article.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
            data.content[l.slug] = t.content;
            data.title[l.slug] = t.title;
            data.description[l.slug] = t.description;
            data.h1[l.slug] = t.h1;
        }

        return data;
    }

    private buildArticleCat(cat: CArticleCat, langs: CLang[]): IArticleCat {
        const data: IArticleCat = {
            id: cat.id,
            slug: cat.slug,
            name: {},
        };
        
        for (let l of langs) {
            const t = cat.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
        }

        return data;
    }

    private buildFilter(dtoFilter: any): string {
        let filter = "articles.active = TRUE";

        if (dtoFilter.created_at_less) {
            filter += ` AND articles.created_at <= '${this.appService.mysqlDate(new Date(dtoFilter.created_at_less), "datetime")}'`;
        }

        if (dtoFilter.excludeSlug) {
            filter += ` AND articles.slug != '${dtoFilter.excludeSlug}'`;
        }

        if (dtoFilter.in_gal !== undefined) {
            filter += ` AND articles.in_gal = ${dtoFilter.in_gal}`;
        }

        if (dtoFilter.date_wo_time) { // приходит как бы дата с временем 00:00:00 по поясу пользователя, но уже в UTC
            filter += ` AND (articles.date >= '${dtoFilter.date_wo_time}' AND articles.date < ('${dtoFilter.date_wo_time}' + INTERVAL 1 DAY))`;
        }

        if (dtoFilter.catSlug) {
            filter += ` AND cat.slug = '${dtoFilter.catSlug}'`;
        }

        return filter;
    }
}