import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IResponse } from "src/model/dto/response.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CMailtemplate } from "src/model/entities/mailtemplate";
import { Repository } from "typeorm";
import { IMailtemplateCreate } from "./dto/mailtemplate.create.interface";
import { IMailtemplateUpdate } from "./dto/mailtemplate.update.interface";
import { CErrorsService } from "src/common/services/errors.service";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Injectable()
export class CMailtemplatesService {
    constructor(
        @InjectRepository(CMailtemplate) private mailtemplateRepository: Repository<CMailtemplate>,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CMailtemplate[]>> {
        try {            
            const data = await this.mailtemplateRepository.find({order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from});
            const elementsQuantity = await this.mailtemplateRepository.count();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CMailtemplatesService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CMailtemplate>> {
        try {
            const data = await this.mailtemplateRepository.findOne({where: {id}, relations: ["translations"]});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "mailtemplate not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CMailtemplatesService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.mailtemplateRepository.delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CMailtemplatesService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            await this.mailtemplateRepository.delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CMailtemplatesService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData): Promise<IResponse<CMailtemplate>> {        
        try { 
            const dto = JSON.parse(fd.data) as IMailtemplateCreate;
            const x = this.mailtemplateRepository.create(dto);
            await this.mailtemplateRepository.save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CMailtemplatesService.create", err);
            return {statusCode: 500, error};
        }        
    }
    
    public async update(fd: IJsonFormData): Promise<IResponse<CMailtemplate>> {
        try {
            const dto = JSON.parse(fd.data) as IMailtemplateUpdate;
            const x = this.mailtemplateRepository.create(dto);
            await this.mailtemplateRepository.save(x);            
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CMailtemplatesService.update", err);
            return {statusCode: 500, error};
        } 
    }
}
