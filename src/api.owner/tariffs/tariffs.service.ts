import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IResponse } from "src/model/dto/response.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CTariff } from "src/model/entities/tariff";
import { Repository } from "typeorm";
import { ITariffCreate } from "./dto/tariff.create.interface";
import { ITariffUpdate } from "./dto/tariff.update.interface";
import { CErrorsService } from "src/common/services/errors.service";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Injectable()
export class CTariffsService {
    constructor(
        @InjectRepository(CTariff) private tariffRepository: Repository<CTariff>,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CTariff[]>> {
        try {            
            const data = await this.tariffRepository.find({order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from, relations: ["translations"]});
            const elementsQuantity = await this.tariffRepository.count();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CTariffsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CTariff>> {
        try {
            const data = await this.tariffRepository.findOne({where: {id}, relations: ["translations"]});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "tariff not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CTariffsService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.tariffRepository.delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CTariffsService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            await this.tariffRepository.delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CTariffsService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData): Promise<IResponse<CTariff>> {        
        try { 
            const dto = JSON.parse(fd.data) as ITariffCreate;
            const x = this.tariffRepository.create(dto);
            await this.tariffRepository.save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CTariffsService.create", err);
            return {statusCode: 500, error};
        }        
    }
    
    public async update(fd: IJsonFormData): Promise<IResponse<CTariff>> {
        try {
            const dto = JSON.parse(fd.data) as ITariffUpdate;
            const x = this.tariffRepository.create(dto);
            await this.tariffRepository.save(x);            
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CTariffsService.update", err);
            return {statusCode: 500, error};
        } 
    }
}
