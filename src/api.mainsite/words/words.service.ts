import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CWordbook } from "src/model/entities/wordbook";
import { IResponse } from "src/model/dto/response.interface";
import { CLang } from "src/model/entities/lang";
import { IWords } from "./dto/words.interface";
import { CErrorsService } from "src/common/services/errors.service";

@Injectable()
export class CWordsService {
    constructor (
        @InjectRepository(CWordbook) private wordbookRepository: Repository<CWordbook>,
        @InjectRepository(CLang) private langRepository: Repository<CLang>,
        private errorsService: CErrorsService,
    ) {} 
    
    public async all(): Promise<IResponse<IWords>> {        
        try {            
            const wordbooks = await this.wordbookRepository.find({where: [{load_to: "landing"},{load_to: "mainsite"}], relations: ["words", "words.translations"]});  
            const langs = await this.langRepository.find({where: {active: true}});    
            const data = {};     

            for (let wb of wordbooks) {
                data[wb.name] = {};

                for (let w of wb.words) {
                    data[wb.name][w.mark] = {};
                    
                    for (let l of langs) {
                        data[wb.name][w.mark][l.slug] = w.translations.find(t => t.lang_id === l.id).text;
                    }
                }
            }
            
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CWordsService.all", err);
            return {statusCode: 500, error};
        }
    }    
}
