import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CErrorsService } from "src/common/services/errors.service";
import { IResponse } from "src/model/dto/response.interface";
import { CTariff } from "src/model/entities/tariff";
import { Repository } from "typeorm";
import { ITariff } from "./dto/tariff.interface";
import { CLang } from "src/model/entities/lang";

@Injectable()
export class CTariffsService {
    constructor(
        @InjectRepository(CTariff) private tariffRepository: Repository<CTariff>,
        @InjectRepository(CLang) private langRepository: Repository<CLang>,
        private errorsService: CErrorsService,
    ) {}

    public async all(): Promise<IResponse<ITariff[]>> {
        try {
            const tariffs = await this.tariffRepository.find({where: {active: true}, order: {duration: 1}, relations: ["translations"]});
            const langs = await this.langRepository.find({where: {active: true}});
            const data = tariffs.map(t => this.buildTariff(t, langs));
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CTariffsService.all", err);
            return {statusCode: 500, error};
        }
    }

    ///////////////////
    // utils
    ///////////////////

    private buildTariff(tariff: CTariff, langs: CLang[]): ITariff {
        const data: ITariff = {
            id: tariff.id,
            name: {},
            price: tariff.price,
            duration: tariff.duration,
            apple_pid: tariff.apple_pid,
            google_pid: tariff.google_pid,
            perday: parseFloat((tariff.price / tariff.duration).toFixed(2)),
            np_compatible: tariff.np_compatible,
        };

        for (let l of langs) {
            const translation = tariff.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = translation.name;
        }

        return data;
    }
}