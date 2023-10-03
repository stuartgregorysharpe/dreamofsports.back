import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IResponse } from "src/model/dto/response.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CPaysystem } from "src/model/entities/paysystem";
import { DeleteResult, IsNull, Repository } from "typeorm";
import { IPaysystemCreate } from "./dto/paysystem.create.interface";
import { IPaysystemUpdate } from "./dto/paysystem.update.interface";
import { CErrorsService } from "src/common/services/errors.service";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { CPaysystemParam } from "src/model/entities/paysystem.param";

@Injectable()
export class CPaysystemsService {
    constructor(
        @InjectRepository(CPaysystem) private paysystemRepository: Repository<CPaysystem>,
        @InjectRepository(CPaysystemParam) private paysystemParamRepository: Repository<CPaysystemParam>,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CPaysystem[]>> {
        try {            
            const data = await this.paysystemRepository.find({order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from, relations: ["translations"]});
            const elementsQuantity = await this.paysystemRepository.count();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CPaysystemsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CPaysystem>> {
        try {
            const data = await this.paysystemRepository.findOne({where: {id}, relations: ["translations", "params"]});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "paysystem not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CPaysystemsService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.paysystemRepository.delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CPaysystemsService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            await this.paysystemRepository.delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CPaysystemsService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData): Promise<IResponse<CPaysystem>> {        
        try { 
            const dto = JSON.parse(fd.data) as IPaysystemCreate;
            const x = this.paysystemRepository.create(dto);
            await this.paysystemRepository.save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CPaysystemsService.create", err);
            return {statusCode: 500, error};
        }        
    }
    
    public async update(fd: IJsonFormData): Promise<IResponse<CPaysystem>> {
        try {
            const dto = JSON.parse(fd.data) as IPaysystemUpdate;
            const x = this.paysystemRepository.create(dto);
            await this.paysystemRepository.save(x);      
            await this.deleteUnbindedParams();      
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CPaysystemsService.update", err);
            return {statusCode: 500, error};
        } 
    }

    //////////////////////
    // utils    
    //////////////////////
    
    private deleteUnbindedParams(): Promise<DeleteResult> {
        return this.paysystemParamRepository.delete({paysystem_id: IsNull()});
    }  
}
