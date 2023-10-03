import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CErrorsService } from "src/common/services/errors.service";
import { IResponse } from "src/model/dto/response.interface";
import { CArticleCat } from "src/model/entities/article.cat";
import { CLang } from "src/model/entities/lang";
import { Repository } from "typeorm";
import { IArticleCat } from "./dto/article.cat.interface";

@Injectable()
export class CArticleCatsService {
    constructor(
        @InjectRepository(CArticleCat) private articleCatRepository: Repository<CArticleCat>,
        @InjectRepository(CLang) private langRepository: Repository<CLang>,
        private errorsService: CErrorsService,
    ) {}

    public async all(): Promise<IResponse<IArticleCat[]>> {
        try {
            const cats = await this.articleCatRepository.find({where: {active: true}, order: {pos: 1}, relations: ["translations"]}); 
            const langs = await this.langRepository.find({where: {active: true}}); 
            const data = cats.map(c => this.buildArticleCatForList(c, langs));
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CArticleCatsService.all", err);
            return {statusCode: 500, error};
        }
    }  

    public async one(slug: string): Promise<IResponse<IArticleCat>> {
        try {
            const cat = await this.articleCatRepository.findOne({where: {slug, active: true}, relations: ["translations"]});               

            if (!cat) {
                return {statusCode: 404, error: "cat not found"};
            }

            const langs = await this.langRepository.find({where: {active: true}});   
            const data = this.buildArticleCatSingle(cat, langs);
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CArticleCatsService.one", err);
            return {statusCode: 500, error};
        }
    }

    /////////////////
    // utils
    /////////////////

    private buildArticleCatForList(cat: CArticleCat, langs: CLang[]): IArticleCat {
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

    private buildArticleCatSingle(cat: CArticleCat, langs: CLang[]): IArticleCat {
        const data: IArticleCat = {
            id: cat.id,
            name: {},
            title: {},
            description: {},
            h1: {},
        };
        
        for (let l of langs) {
            const t = cat.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
            data.title[l.slug] = t.title;
            data.description[l.slug] = t.description;
            data.h1[l.slug] = t.h1;
        }

        return data;
    }
}
