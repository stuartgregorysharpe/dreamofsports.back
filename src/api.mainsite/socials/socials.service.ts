import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CErrorsService } from "src/common/services/errors.service";
import { IResponse } from "src/model/dto/response.interface";
import { CSocial } from "src/model/entities/social";
import { Repository } from "typeorm";
import { ISocial } from "./dto/social.interface";

@Injectable()
export class CSocialsService {
    constructor(
        @InjectRepository(CSocial) private socialRepository: Repository<CSocial>,
        private errorsService: CErrorsService, 
    ) {}

    public async all(): Promise<IResponse<ISocial[]>> {
        try {
            const socials = await this.socialRepository.find({order: {name: 1}}); 
            const data = socials.map(s => this.buildSocial(s));
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CSocialsService.all", err);
            return {statusCode: 500, error};
        }
    } 

    /////////////////
    // utils
    /////////////////

    private buildSocial(social: CSocial): ISocial {
        return {
            id: social.id,
            name: social.name,
            url: social.url,
            img: social.img,
        };
    }
}
