import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, Not, Repository } from "typeorm";
import { CLang } from "src/model/entities/lang";
import { IResponse } from 'src/model/dto/response.interface';
import { ILangCreate } from "./dto/lang.create.interface";
import { ILangUpdate } from "./dto/lang.update.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CUploadsService } from "src/common/services/uploads.service";
import { CImagableService } from "src/common/services/imagable.service";
import { CAppService } from "src/common/services/app.service";
import { IKeyValue } from "src/model/keyvalue.interface";
import { CErrorsService } from "src/common/services/errors.service";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Injectable()
export class CLangsService extends CImagableService  {
    protected folder: string = "langs";
    protected resizeMap: IKeyValue<number> = {img: 100};

    constructor (
        protected dataSource: DataSource,
        protected uploadsService: CUploadsService,
        protected appService: CAppService,
        protected errorsService: CErrorsService,
        @InjectRepository(CLang) protected langRepository: Repository<CLang>,
    ) 
    {
        super(uploadsService, appService);
    } 
    
    public async all(dto: IGetList): Promise<IResponse<CLang[]>> {
        try {            
            const data = await this.langRepository.find({order: {[dto.sortBy]: dto.sortDir}});             
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CLangsService.all", err);
            return {statusCode: 500, error};
        }
    }  

    public async chunk(dto: IGetList): Promise<IResponse<CLang[]>> {
        try {            
            const data = await this.langRepository.find({order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from});
            const elementsQuantity = await this.langRepository.count();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CLangsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CLang>> {
        try {
            const data = await this.langRepository.findOneBy({id});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "lang not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CLangsService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            const x = await this.langRepository.findOneBy({id});
            await this.deleteUnbindedImg(x);
            await this.langRepository.delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CLangsService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            const xl = await this.langRepository.findBy({id: In(ids)});  
            await this.deleteUnbindedImg(xl);
            await this.langRepository.delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CLangsService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CLang>> {        
        try {   
            const dto = JSON.parse(fd.data) as ILangCreate;         
            const x = this.langRepository.create(dto);
            await this.buildImg(x, uploads);
            await this.langRepository.save(x);
            await this.rebuildSlugable(x);
            await this.rebuildMultilangEntities(x.id);            
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CLangsService.create", err);
            return {statusCode: 500, error};
        }        
    }
    
    public async update(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CLang>> {
        try {
            const dto = JSON.parse(fd.data) as ILangUpdate;         
            const x = this.langRepository.create(dto);
            const old = await this.langRepository.findOneBy({id: x.id});
            await this.buildImg(x, uploads);
            await this.deleteUnbindedImg(x, old); // if img changed then delete old file
            await this.langRepository.save(x);       
            await this.rebuildSlugable(x);
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CLangsService.update", err);
            return {statusCode: 500, error};
        } 
    }  

    /////////////////
    // utils
    /////////////////

    private async rebuildSlugable(x: CLang): Promise<void> {
        if (x.slugable) {
            await this.langRepository.update({id: Not(x.id)}, {slugable: false});
        }
    }

    private async rebuildMultilangEntities(lang_id: number): Promise<void> {
        await this.rebuildMultilangEntitiesFor("CWord", "word_id", lang_id);
        await this.rebuildMultilangEntitiesFor("CPage", "page_id", lang_id);
        await this.rebuildMultilangEntitiesFor("CPageWord", "word_id", lang_id);
        await this.rebuildMultilangEntitiesFor("CMailtemplate", "mailtemplate_id", lang_id);
        await this.rebuildMultilangEntitiesFor("CEmployee", "employee_id", lang_id);
        await this.rebuildMultilangEntitiesFor("CArticle", "article_id", lang_id);
        await this.rebuildMultilangEntitiesFor("CArticleCat", "cat_id", lang_id);
        await this.rebuildMultilangEntitiesFor("CCountry", "country_id", lang_id);
        await this.rebuildMultilangEntitiesFor("CCat", "cat_id", lang_id);
        await this.rebuildMultilangEntitiesFor("CAthlet", "athlet_id", lang_id);
        await this.rebuildMultilangEntitiesFor("CFirm", "firm_id", lang_id);
        await this.rebuildMultilangEntitiesFor("CReward", "reward_id", lang_id);
        await this.rebuildMultilangEntitiesFor("CTariff", "tariff_id", lang_id);
        await this.rebuildMultilangEntitiesFor("CPaysystem", "paysystem_id", lang_id);
    }   

    private async rebuildMultilangEntitiesFor(entity: string, foreignField: string, lang_id: number): Promise<void> {
        const entityRepository: Repository<any> = this.dataSource.getRepository(entity);
        const translationRepository: Repository<any> = this.dataSource.getRepository(`${entity}Translation`);
        const xl = await entityRepository.find();
        const tl = [];
        
        for (let x of xl) {
            tl.push(translationRepository.create({[foreignField]: x.id, lang_id}));
        }

        await translationRepository.save(tl);
    }
}
