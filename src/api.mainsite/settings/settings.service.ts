import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CSetting } from "src/model/entities/setting";
import { IResponse } from 'src/model/dto/response.interface';
import { ISettings } from "./dto/settings.interface";
import { CErrorsService } from "src/common/services/errors.service";

@Injectable()
export class CSettingsService {
    constructor (
        @InjectRepository(CSetting) private settingRepository: Repository<CSetting>,
        private errorsService: CErrorsService,
    ) {}    

    public async all(): Promise<IResponse<ISettings>> {        
        try {
            const settings = await this.settingRepository.find({where: [{load_to: "all"}, {load_to: "mainsite"}]});            
            const data = {};            

            for (let setting of settings) {
                data[setting.p] = setting.v;
            }

            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CSettingsService.all", err);
            return {statusCode: 500, error};
        }
    }    
}
