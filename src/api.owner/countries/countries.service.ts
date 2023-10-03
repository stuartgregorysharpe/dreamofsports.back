import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CAppService } from "src/common/services/app.service";
import { IResponse } from "src/model/dto/response.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CCountry } from "src/model/entities/country";
import { Repository } from "typeorm";
import { CErrorsService } from "src/common/services/errors.service";
import { ICountryCreate } from "./dto/country.create.interface";
import { ICountryUpdate } from "./dto/country.update.interface";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Injectable()
export class CCountriesService{
    constructor(
        @InjectRepository(CCountry) private countryRepository: Repository<CCountry>,
        private appService: CAppService,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CCountry[]>> {
        try {            
            const filter = this.buildFilter(dto.filter);
            const sortBy = `countries.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            // из-за фильтрации по присоединенной таблице translations будем делать выборку в два этапа, 
            // сначала найдем id с учетом фильтра, потом полные объекты из id без фильтра,
            // иначе в выборку не попадут присоединенные translations, не отвечающие фильтру
            const predata = await this.countryRepository
                .createQueryBuilder("countries")
                .leftJoin("countries.translations", "translations")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const ids = predata.map(x => x.id);
            const data = await this.countryRepository
                .createQueryBuilder("countries")
                .leftJoinAndSelect("countries.translations", "translations")
                .whereInIds(ids)
                .orderBy({[sortBy]: sortDir})
                .getMany();
            const elementsQuantity = await this.countryRepository
                .createQueryBuilder("countries")
                .leftJoin("countries.translations", "translations") // join to apply filter
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CCountriesService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CCountry>> {
        try {
            const data = await this.countryRepository.findOne({where: {id}, relations: ["translations"]});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "country not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CCountriesService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.countryRepository.delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CCountriesService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            await this.countryRepository.delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CCountriesService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData): Promise<IResponse<CCountry>> {        
        try { 
            const dto = JSON.parse(fd.data) as ICountryCreate;
            const x = this.countryRepository.create(dto);
            await this.countryRepository.save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CCountriesService.create", err);
            return {statusCode: 500, error};
        }        
    }
    
    public async update(fd: IJsonFormData): Promise<IResponse<CCountry>> {
        try {
            const dto = JSON.parse(fd.data) as ICountryUpdate;
            const x = this.countryRepository.create(dto);
            await this.countryRepository.save(x);     
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CCountriesService.update", err);
            return {statusCode: 500, error};
        } 
    }

    //////////////////////
    // utils    
    //////////////////////
    
    private buildFilter(dtoFilter: any): string {
        let filter = "TRUE";

        if (dtoFilter.code) {
            filter += ` AND LOWER(countries.code) LIKE LOWER('%${dtoFilter.code}%')`;
        }

        if (dtoFilter.name) {
            filter += ` AND LOWER(translations.name) LIKE LOWER('%${dtoFilter.name}%')`;
        }

        if (dtoFilter.search) {
            filter += ` AND (LOWER(countries.code) LIKE LOWER('%${dtoFilter.search}%') OR countries.id = '${dtoFilter.search}')`;
        }

        return filter;
    }

    /*
    private async seed(): Promise<void> {
        const langs = await this.langRepository.find();
        const codes = this.appService.arrayUnique((await this.precountryRepository.find({select: ["code"]})).map(o => o.code));
        const countries: CCountry[] = [];

        for (let code of codes) {
            const country = new CCountry();
            country.code = code;
            country.translations = [];
            const precountries = await this.precountryRepository.find({where: {code, lang: In(["AR", "RU", "EN"])}});
            
            for (let p of precountries) {
                const lang_slug = p.lang;
                const t = new CCountryTranslation();
                t.lang_id = langs.find(l => l.slug === p.lang.toLowerCase()).id;
                t.name = p.name;
                country.translations.push(t);
            }

            countries.push(country);
        }

        await this.countryRepository.save(countries);
    }
    */
}
