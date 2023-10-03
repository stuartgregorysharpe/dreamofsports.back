import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CSetting } from "src/model/entities/setting";
import { IResponse } from 'src/model/dto/response.interface';
import { ISettingCreate } from "./dto/setting.create.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CErrorsService } from "src/common/services/errors.service";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Injectable()
export class CSettingsService {
    constructor (
        @InjectRepository(CSetting) private settingRepository: Repository<CSetting>,
        private errorsService: CErrorsService,
    ) {}    

    public async chunk(dto: IGetList): Promise<IResponse<CSetting[]>> {
        try {
            const data = await this.settingRepository.find({where: {hidden: false}, order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from});
            const elementsQuantity = await this.settingRepository.count({where: {hidden: false}});
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CSettingsService.chunk", err);
            return {statusCode: 500, error};
        }
    }    

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.settingRepository.delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CSettingsService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            await this.settingRepository.delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CSettingsService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData): Promise<IResponse<CSetting>> {        
        try {     
            const dto = JSON.parse(fd.data) as ISettingCreate;
            const x = this.settingRepository.create(dto);
            await this.settingRepository.save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CSettingsService.create", err);
            return {statusCode: 500, error};
        }        
    }   
    
    //////////////////////
    // utils
    //////////////////////
    
    private fake(): void {
        for (let i = 0; i < 50; i++) {
            const x = this.settingRepository.create({p: `newtest${i}`});
            this.settingRepository.save(x);
        }
    }
}
