import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CErrorsService } from "src/common/services/errors.service";
import { CMessage } from "src/model/entities/message";
import { Repository } from "typeorm";
import { IMessageCreate } from "./dto/message.create.interface";
import { IResponse } from "src/model/dto/response.interface";
import { CAdmin } from "src/model/entities/admin";
import { CMailService } from "src/common/services/mail.service";

@Injectable()
export class CMessagesService {
    constructor(
        @InjectRepository(CMessage) private messageRepository: Repository<CMessage>,
        @InjectRepository(CAdmin) private adminRepository: Repository<CAdmin>,
        private errorsService: CErrorsService,
        private mailService: CMailService,
    ) {}

    public async create(dto: IMessageCreate): Promise<IResponse<void>> {        
        try { 
            const x = this.messageRepository.create(dto);
            await this.messageRepository.save(x);
            this.notifyAdmins(x);
            return {statusCode: 201};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CMessagesService.create", err);
            return {statusCode: 500, error};
        }        
    }

    /////////////////////
    // utils
    /////////////////////

    private async notifyAdmins(message: CMessage): Promise<void> {
        try {
            const admins = await this.adminRepository.find({where: {active: true, hidden: false}});

            for (let admin of admins) {
                await this.mailService.adminMessage(admin.email, message);
            }
        } catch (err) {
            await this.errorsService.log("api.mainsite/CMessagesService.notifyAdmins", err);
        }
    }
}