import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IResponse } from "src/model/dto/response.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CSocial } from "src/model/entities/social";
import { In, Repository } from "typeorm";
import { ISocialCreate } from "./dto/social.create.interface";
import { ISocialUpdate } from "./dto/social.update.interface";
import { CErrorsService } from "src/common/services/errors.service";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { CImagableService } from "src/common/services/imagable.service";
import { IKeyValue } from "src/model/keyvalue.interface";
import { CUploadsService } from "src/common/services/uploads.service";
import { CAppService } from "src/common/services/app.service";

@Injectable()
export class CSocialsService extends CImagableService {
    protected folder: string = "socials";
    protected resizeMap: IKeyValue<number> = {img: 100};

    constructor(
        @InjectRepository(CSocial) protected socialRepository: Repository<CSocial>,
        protected uploadsService: CUploadsService,
        protected appService: CAppService,
        protected errorsService: CErrorsService,
    ) 
    {
        super(uploadsService, appService);
    }

    public async chunk(dto: IGetList): Promise<IResponse<CSocial[]>> {
        try {            
            const data = await this.socialRepository.find({order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from});
            const elementsQuantity = await this.socialRepository.count();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CSocialsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CSocial>> {
        try {
            const data = await this.socialRepository.findOne({where: {id}});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "social not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CSocialsService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            const x = await this.socialRepository.findOneBy({id});
            await this.deleteUnbindedImg(x);
            await this.socialRepository.delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CSocialsService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            const xl = await this.socialRepository.findBy({id: In(ids)});  
            await this.deleteUnbindedImg(xl);
            await this.socialRepository.delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CSocialsService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CSocial>> {        
        try { 
            const dto = JSON.parse(fd.data) as ISocialCreate;
            const x = this.socialRepository.create(dto);
            await this.buildImg(x, uploads);
            await this.socialRepository.save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CSocialsService.create", err);
            return {statusCode: 500, error};
        }        
    }
    
    public async update(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CSocial>> {
        try {
            const dto = JSON.parse(fd.data) as ISocialUpdate;
            const x = this.socialRepository.create(dto);
            const old = await this.socialRepository.findOneBy({id: x.id});
            await this.buildImg(x, uploads);
            await this.deleteUnbindedImg(x, old); // if img changed then delete old file
            await this.socialRepository.save(x);            
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CSocialsService.update", err);
            return {statusCode: 500, error};
        } 
    }
}
