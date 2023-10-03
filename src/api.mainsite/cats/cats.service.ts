import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CErrorsService } from "src/common/services/errors.service";
import { IResponse } from "src/model/dto/response.interface";
import { CCat } from "src/model/entities/cat";
import { IsNull, Repository } from "typeorm";
import { ICat } from "./dto/cat.interface";
import { CLang } from "src/model/entities/lang";
import { CAppService } from "src/common/services/app.service";
import { IChildable } from "src/model/childable.interface";
import { IKeyValue } from "src/model/keyvalue.interface";
import { ICatSimple } from "./dto/cat.simple.interface";

@Injectable()
export class CCatsService {
    constructor(
        @InjectRepository(CCat) private catRepository: Repository<CCat>,
        @InjectRepository(CLang) private langRepository: Repository<CLang>,
        private errorsService: CErrorsService, 
        private appService: CAppService,
    ) {}

    // нижний уровень иерархии ("листья"), для резюме
    public async allLeavs(): Promise<IResponse<IKeyValue<ICatSimple[]>>> {
        try {
            const cats = await this.catRepository.find({relations: ["translations", "children"]}); 
            const leaves = cats.filter(c => !c.children.length);
            const langs = await this.langRepository.find({where: {active: true}}); 
            const data = this.buildCatsAlphabetical(leaves, langs);
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CCatsService.allLeavs", err);
            return {statusCode: 500, error};
        }        
    }

    public async menuFoot(): Promise<IResponse<IKeyValue<ICatSimple[]>>> {
        try {
            const cats = await this.catRepository.find({where: {menufoot: true}, relations: ["translations"]}); 
            const langs = await this.langRepository.find({where: {active: true}}); 
            const data = this.buildCatsAlphabetical(cats, langs);
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CCatsService.menuFoot", err);
            return {statusCode: 500, error};
        }  
    }

    public async all(): Promise<IResponse<ICat[]>> {
        try {
            const cats = await this.catRepository.find({where: {parent_id: IsNull()}, order: {pos: 1}, relations: ["translations"]}); 
            
            for (let cat of cats) {
                cat.children = await this.appService.buildChildren(cat, this.catRepository, "pos", 1, false, ["translations"]) as CCat[];
            }  

            const langs = await this.langRepository.find({where: {active: true}}); 
            const data = this.buildCatsForTree(cats, langs);
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CCatsService.all", err);
            return {statusCode: 500, error};
        }
    }

    public async one(slug: string): Promise<IResponse<ICat>> {
        try {
            const cat = await this.catRepository.findOne({where: {slug}, relations: ["translations"]});               

            if (!cat) {
                return {statusCode: 404, error: "cat not found"};
            }

            const langs = await this.langRepository.find({where: {active: true}});   
            const data = this.buildCatSingle(cat, langs);
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CCatsService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async create(slug: string): Promise<IResponse<ICat>> {
        try {
            const one = {
                slug: slug,
                translations: []
            }

            const langs = await this.langRepository.find({where: {active: true}});   

            for (let l of langs) {
                const t = {
                    lang_id: l.id,
                    name: slug
                };
                one.translations.push(t);
            }

            const cat = this.catRepository.create(one);
            const res = await this.catRepository.save(cat);
            const data = this.buildCatSingle(res, langs);
            return {statusCode: 200, data: data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CCatsService.one", err);
            return {statusCode: 500, error};
        }
    }

    /////////////////
    // utils
    /////////////////

    private buildCatsAlphabetical(cats: CCat[], langs: CLang[]): IKeyValue<ICatSimple[]> {
        const data: IKeyValue<ICatSimple[]> = {};

        for (let lang of langs) {
            data[lang.slug] = cats.map(c => ({
                id: c.id,
                name: c.translations.find(t => t.lang_id === lang.id).name,
                slug: c.slug,
            }));
            data[lang.slug].sort((a, b) => a.name.localeCompare(b.name));
        }

        return data;
    }

    private buildCatsForTree(cats: CCat[], langs: CLang[]): ICat[] {
        let data = cats.map(c => this.buildCatForTree(c, langs));
        data = this.appService.tree2list(data) as ICat[];

        for (let d of data) {
            delete d.children;
        }

        return data;
    }

    private buildCatForTree(cat: CCat, langs: CLang[]): ICat {
        const data: ICat = {
            id: cat.id,
            slug: cat.slug,
            name: {},
            children: cat.children.map(c => this.buildCatForTree(c, langs)),
            _shift: "",
        };

        for (let l of langs) {
            const t = cat.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
        }

        return data;
    }

    private buildCatSingle(cat: CCat, langs: CLang[]): ICat {
        const data: ICat = {
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
