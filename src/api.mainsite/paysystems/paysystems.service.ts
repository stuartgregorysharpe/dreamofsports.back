import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CErrorsService } from "src/common/services/errors.service";
import { IResponse } from "src/model/dto/response.interface";
import { CPaysystem } from "src/model/entities/paysystem";
import { Repository } from "typeorm";
import { IPaysystem } from "./dto/paysystem.interface";
import { CLang } from "src/model/entities/lang";

@Injectable()
export class CPaysystemsService {
    constructor(
        @InjectRepository(CPaysystem) private paysystemRepository: Repository<CPaysystem>,
        @InjectRepository(CLang) private langRepository: Repository<CLang>,
        private errorsService: CErrorsService,
    ) {}

    public async all(): Promise<IResponse<IPaysystem[]>> {
        try {
            const paysystems = await this.paysystemRepository.find({where: {active: true}, order: {pos: 1}, relations: ["translations", "params"]});
            const langs = await this.langRepository.find({where: {active: true}});
            const data = paysystems.map(t => this.buildPaysystem(t, langs));
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CPaysystemsService.all", err);
            return {statusCode: 500, error};
        }
    }

    ///////////////////
    // utils
    ///////////////////

    private buildPaysystem(paysystem: CPaysystem, langs: CLang[]): IPaysystem {
        const data: IPaysystem = {
            id: paysystem.id,
            name: paysystem.name,
            title: {},  
            params: paysystem.params.filter(p => p.loadable).map(p => ({id: p.id, name: p.name, value: p.value})),
        };

        for (let l of langs) {
            const translation = paysystem.translations.find(t => t.lang_id === l.id);
            data.title[l.slug] = translation.title;
        }

        return data;
    }
}