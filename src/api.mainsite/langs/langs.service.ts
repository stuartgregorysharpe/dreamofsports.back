import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CLang } from "src/model/entities/lang";
import { IResponse } from "src/model/dto/response.interface";
import { ILang } from "./dto/lang.interface";
import { CErrorsService } from "src/common/services/errors.service";

@Injectable()
export class CLangsService {
    constructor (
        @InjectRepository(CLang) private langRepository: Repository<CLang>,
        private errorsService: CErrorsService,
    ) {} 
    
    public async all(): Promise<IResponse<ILang[]>> {
        try {
            const langs = await this.langRepository.find({where: {active: true}, order: {pos: 1}});             
            const data = langs.map(x => this.buildLang(x));
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CLangsService.all", err);
            return {statusCode: 500, error};
        }
    }    

    ////////////////
    // utils
    ////////////////
    
    private buildLang(lang: CLang): ILang {
        return {
            id: lang.id,
            slug: lang.slug,    
            title: lang.title,
            dir: lang.dir, 
            dateformat: lang.dateformat,
        };
    }
}
