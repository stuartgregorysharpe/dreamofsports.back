import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IResponse } from "src/model/dto/response.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CArticleCat } from "src/model/entities/article.cat";
import { Repository } from "typeorm";
import { IArticleCatCreate } from "./dto/article.cat.create.interface";
import { IArticleCatUpdate } from "./dto/article.cat.update.interface";
import { CErrorsService } from "src/common/services/errors.service";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Injectable()
export class CArticleCatsService {
    constructor(
        @InjectRepository(CArticleCat) private articleCatRepository: Repository<CArticleCat>,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CArticleCat[]>> {
        try {            
            const filter = this.buildFilter(dto.filter);
            const sortBy = `cats.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            // из-за фильтрации по присоединенной таблице translations будем делать выборку в два этапа, 
            // сначала найдем id с учетом фильтра, потом полные объекты из id без фильтра,
            // иначе в выборку не попадут присоединенные translations, не отвечающие фильтру
            const predata = await this.articleCatRepository
                .createQueryBuilder("cats")
                .leftJoin("cats.translations", "translations")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const ids = predata.map(x => x.id);
            const data = await this.articleCatRepository
                .createQueryBuilder("cats")
                .leftJoinAndSelect("cats.translations", "translations")
                .whereInIds(ids)
                .orderBy({[sortBy]: sortDir})
                .getMany();
            const elementsQuantity = await this.articleCatRepository
                .createQueryBuilder("cats")
                .leftJoin("cats.translations", "translations") // join to apply filter
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CArticleCatsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CArticleCat>> {
        try {
            const data = await this.articleCatRepository.findOne({where: {id}, relations: ["translations"]});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "articleCat not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CArticleCatsService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.articleCatRepository.delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CArticleCatsService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            await this.articleCatRepository.delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CArticleCatsService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData): Promise<IResponse<CArticleCat>> {        
        try { 
            const dto = JSON.parse(fd.data) as IArticleCatCreate;
            const x = this.articleCatRepository.create(dto);
            await this.articleCatRepository.save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CArticleCatsService.create", err);
            return {statusCode: 500, error};
        }        
    }
    
    public async update(fd: IJsonFormData): Promise<IResponse<CArticleCat>> {
        try {
            const dto = JSON.parse(fd.data) as IArticleCatUpdate;
            const x = this.articleCatRepository.create(dto);
            await this.articleCatRepository.save(x);            
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CArticleCatsService.update", err);
            return {statusCode: 500, error};
        } 
    }

    //////////////////////
    // utils
    //////////////////////

    private buildFilter(dtoFilter: any): string {
        let filter = "TRUE";

        if (dtoFilter.search) {
            filter += ` AND (LOWER(translations.name) LIKE LOWER('%${dtoFilter.search}%') OR cats.id = '${dtoFilter.search}')`;
        }

        return filter;
    }
}
