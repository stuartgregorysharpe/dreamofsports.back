import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CAppService } from "src/common/services/app.service";
import { CImagableService } from "src/common/services/imagable.service";
import { CUploadsService } from "src/common/services/uploads.service";
import { IResponse } from "src/model/dto/response.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CArticle } from "src/model/entities/article";
import { In, Repository } from "typeorm";
import { IArticleCreate } from "./dto/article.create.interface";
import { IArticleUpdate } from "./dto/article.update.interface";
import { IKeyValue } from "src/model/keyvalue.interface";
import { CSlugService } from "src/common/services/slug.service";
import { CErrorsService } from "src/common/services/errors.service";
import { CArticleTranslation } from "src/model/entities/article.translation";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Injectable()
export class CArticlesService extends CImagableService {
    protected folder: string = "articles";
    protected resizeMap: IKeyValue<number> = {img: 1920, img_s: 400};

    constructor(
        @InjectRepository(CArticle) protected articleRepository: Repository<CArticle>,
        protected uploadsService: CUploadsService,
        protected slugService: CSlugService,
        protected appService: CAppService,
        protected errorsService: CErrorsService,
    ) 
    {
        super(uploadsService, appService);
    }

    public async chunk(dto: IGetList): Promise<IResponse<CArticle[]>> {
        try {            
            const filter = this.buildFilter(dto.filter);
            const sortBy = `articles.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            // из-за фильтрации по присоединенной таблице translations будем делать выборку в два этапа, 
            // сначала найдем id с учетом фильтра, потом полные объекты из id без фильтра,
            // иначе в выборку не попадут присоединенные translations, не отвечающие фильтру
            const predata = await this.articleRepository
                .createQueryBuilder("articles")
                .leftJoin("articles.translations", "translations")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const ids = predata.map(x => x.id);
            const data = await this.articleRepository
                .createQueryBuilder("articles")
                .leftJoinAndSelect("articles.translations", "translations")
                .leftJoinAndSelect("articles.cat", "cat")
                .leftJoinAndSelect("cat.translations", "cat_translations")
                .whereInIds(ids)
                .orderBy({[sortBy]: sortDir})
                .getMany();
            const elementsQuantity = await this.articleRepository
                .createQueryBuilder("articles")
                .leftJoin("articles.translations", "translations") // join to apply filter
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CArticlesService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CArticle>> {
        try {
            const data = await this.articleRepository.findOne({where: {id}, relations: ["translations"]});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "article not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CArticlesService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            const x = await this.articleRepository.findOneBy({id});
            await this.deleteUnbindedImg(x);
            await this.articleRepository.delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CArticlesService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            const xl = await this.articleRepository.findBy({id: In(ids)});  
            await this.deleteUnbindedImg(xl);
            await this.articleRepository.delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CArticlesService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CArticle>> {        
        try { 
            const dto = JSON.parse(fd.data) as IArticleCreate;
            const x = this.articleRepository.create(dto);
            await this.buildImg(x, uploads);
            x.slug = await this.slugService.checkSlug(this.articleRepository, x);
            await this.articleRepository.save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CArticlesService.create", err);
            return {statusCode: 500, error};
        }        
    }
    
    public async update(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CArticle>> {
        try {
            const dto = JSON.parse(fd.data) as IArticleUpdate;
            const x = this.articleRepository.create(dto);
            const old = await this.articleRepository.findOneBy({id: x.id});
            await this.buildImg(x, uploads);
            await this.deleteUnbindedImg(x, old); // if img changed then delete old file
            x.slug = await this.slugService.checkSlug(this.articleRepository, x);
            await this.articleRepository.save(x);     
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CArticlesService.update", err);
            return {statusCode: 500, error};
        } 
    }

    //////////////////////
    // utils    
    //////////////////////
    
    private buildFilter(dtoFilter: any): string {
        let filter = "TRUE";

        if (dtoFilter.from !== undefined) {
            filter += ` AND articles.date >= '${dtoFilter.from}'`;
        }

        if (dtoFilter.to !== undefined) {
            filter += ` AND articles.date <= '${dtoFilter.to}'`;
        }

        if (dtoFilter.name) {
            filter += ` AND LOWER(translations.name) LIKE LOWER('%${dtoFilter.name}%')`;
        }

        if (dtoFilter.cat_id !== undefined) {
            if (dtoFilter.cat_id === null) {
                filter += ` AND articles.cat_id IS NULL`;
            } else {
                filter += ` AND articles.cat_id = '${dtoFilter.cat_id}'`;
            }
        }

        return filter;
    }

    private async fake(): Promise<void> {
        for (let i = 0; i < 100; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const imgNumber = this.appService.random(1, 3);
            const article = new CArticle();
            article.slug = `test-${i}`;
            article.date = date;
            article.img = `test${imgNumber}_1920.jpg`;
            article.img_s = `test${imgNumber}_400.jpg`;
            const translation1 = new CArticleTranslation();
            translation1.lang_id = 1;
            translation1.name = `Test article header ${i}`;
            translation1.contentshort = `Short article content ${i} Short article content ${i} Short article content ${i} Short article content ${i} Short article content ${i} Short article content ${i} `;
            translation1.content = `
                <p>Full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i}</p>
                <p>Full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i}</p>
                <p>Full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i} full article content ${i}</p>
            `;
            const translation2 = new CArticleTranslation();
            translation2.lang_id = 2;
            translation2.name = `Заголовок тестовой новости ${i}`;
            translation2.contentshort = `Краткое содержание новости ${i} Краткое содержание новости ${i} Краткое содержание новости ${i} Краткое содержание новости ${i} Краткое содержание новости ${i}`;
            translation2.content = `
                <p>Полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i}</p>
                <p>Полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i}</p>
                <p>Полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i} полное содержание новости ${i}</p>
            `;
            const translation3 = new CArticleTranslation();
            translation3.lang_id = 17;
            translation3.name = `اختبار عنوان المقالة ${i}`;
            translation3.contentshort = `محتوى موجز للأخبار ${i} محتوى موجز للأخبار ${i} محتوى موجز للأخبار ${i} محتوى موجز للأخبار ${i} محتوى موجز للأخبار ${i} محتوى موجز للأخبار ${i} محتوى موجز للأخبار ${i}`;
            translation3.content = `
                <p>محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i}</p>
                <p>محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i}</p>
                <p>محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i} محتوى إخباري كامل ${i}</p>
            `;
            article.translations = [translation1, translation2, translation3];
            await this.articleRepository.save(article);
        }
    }
}