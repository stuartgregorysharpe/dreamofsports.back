import { Controller, Post } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CSocialsService } from "./socials.service";
import { ISocial } from "./dto/social.interface";

@Controller('api/mainsite/socials')
export class CSocialsController {
    constructor (private socialsService: CSocialsService) {}        

    @Post("all")
    public all(): Promise<IResponse<ISocial[]>> {
        return this.socialsService.all();
    }
}
