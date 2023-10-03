import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CAppService } from "src/common/services/app.service";
import { CImagableService } from "src/common/services/imagable.service";
import { CUploadsService } from "src/common/services/uploads.service";
import { IResponse } from "src/model/dto/response.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CPage } from "src/model/entities/page";
import { DeleteResult, In, IsNull, Repository } from "typeorm";
import { IPageCreate } from "./dto/page.create.interface";
import { IPageUpdate } from "./dto/page.update.interface";
import { IKeyValue } from "src/model/keyvalue.interface";
import { CSlugService } from "src/common/services/slug.service";
import { CErrorsService } from "src/common/services/errors.service";
import { CPageWord } from "src/model/entities/page.word";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Injectable()
export class CPagesService extends CImagableService {
    protected folder: string = "pages";
    protected resizeMap: IKeyValue<number> = {img: 300};

    constructor(
        @InjectRepository(CPage) protected pageRepository: Repository<CPage>,
        @InjectRepository(CPageWord) protected pageWordRepository: Repository<CPageWord>,
        protected uploadsService: CUploadsService,
        protected slugService: CSlugService,
        protected appService: CAppService,
        protected errorsService: CErrorsService,
    ) 
    {
        super(uploadsService, appService);
    }

    public async chunk(dto: IGetList): Promise<IResponse<CPage[]>> {
        try {            
            const data = await this.pageRepository.find({where: {parent_id: IsNull()}, order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from, relations: ["translations"]});
            const elementsQuantity = await this.pageRepository.count();
            const elementsQuantityFirstLevel = await this.pageRepository.count({where: {parent_id: IsNull()}});
            const pagesQuantity = Math.ceil(elementsQuantityFirstLevel / dto.q);

            for (let page of data) {
                page.children = await this.appService.buildChildren(page, this.pageRepository, dto.sortBy, dto.sortDir, false, ["translations"]) as CPage[];
            }            

            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CPagesService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CPage>> {
        try {
            // to sort joined array we need to use QueryBuilder instead of simple repository API!
            const data = await this.pageRepository
                .createQueryBuilder("page")
                .where(`page.id = '${id}'`)
                .leftJoinAndSelect("page.translations", "translations")
                .leftJoinAndSelect("page.words", "words")
                .leftJoinAndSelect("words.translations", "words_translations")
                .orderBy("words.pos", "ASC")
                .getOne();
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "page not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CPagesService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            const x = await this.pageRepository.findOneBy({id});
            await this.deleteUnbindedImg(x);
            await this.pageRepository.delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CPagesService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            const xl = await this.pageRepository.findBy({id: In(ids)});  
            await this.deleteUnbindedImg(xl);
            await this.pageRepository.delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CPagesService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CPage>> {        
        try { 
            const dto = JSON.parse(fd.data) as IPageCreate;
            const x = this.pageRepository.create(dto);
            await this.buildImg(x, uploads);
            x.slug = await this.slugService.checkSlug(this.pageRepository, x);
            await this.pageRepository.save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CPagesService.create", err);
            return {statusCode: 500, error};
        }        
    }
    
    public async update(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CPage>> {
        try {
            const dto = JSON.parse(fd.data) as IPageUpdate;
            const x = this.pageRepository.create(dto);
            const old = await this.pageRepository.findOneBy({id: x.id});
            await this.buildImg(x, uploads);
            await this.deleteUnbindedImg(x, old); // if img changed then delete old file
            x.slug = await this.slugService.checkSlug(this.pageRepository, x);
            await this.pageRepository.save(x);     
            await this.deleteUnbindedWords();       
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CPagesService.update", err);
            return {statusCode: 500, error};
        } 
    }

    //////////////////////
    // utils    
    //////////////////////
    
    private deleteUnbindedWords(): Promise<DeleteResult> {
        return this.pageWordRepository.delete({page_id: IsNull()});
    }  
}