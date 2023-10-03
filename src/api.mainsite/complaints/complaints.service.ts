import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CErrorsService } from "src/common/services/errors.service";
import { CComplaint } from "src/model/entities/complaint";
import { Repository } from "typeorm";
import { IComplaintCreate } from "./dto/complaint.create.interface";
import { IResponse } from "src/model/dto/response.interface";
import { CUser } from "src/model/entities/user";
import { CAdmin } from "src/model/entities/admin";
import { CMailService } from "src/common/services/mail.service";
import { cfg } from "src/app.config";

@Injectable()
export class CComplaintsService {
    constructor(
        @InjectRepository(CComplaint) private complaintRepository: Repository<CComplaint>,
        @InjectRepository(CUser) private userRepository: Repository<CUser>,
        @InjectRepository(CAdmin) private adminRepository: Repository<CAdmin>,
        private mailService: CMailService,
        private errorsService: CErrorsService,
    ) {}

    public async create(visitor_id: number, dto: IComplaintCreate): Promise<IResponse<void>> {
        try {
            const author = await this.userRepository.findOne({where: {id: visitor_id, active: true}});
            const breaker = await this.userRepository.findOne({where: {id: dto.breaker_id, active: true}});

            if (!author || !breaker) {
                return {statusCode: 404, error: "author or breaker not found"};
            }
            
            const complaint = this.complaintRepository.create({author_id: visitor_id, breaker_id: dto.breaker_id, content: dto.content});
            await this.complaintRepository.save(complaint);
            this.notifyAdmins(complaint);
            return {statusCode: 201};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CComplaintsService.create", err);
            return {statusCode: 500, error};
        }
    }

    /////////////////////
    // utils
    /////////////////////

    private async notifyAdmins(complaint: CComplaint): Promise<void> {
        try {
            const admins = await this.adminRepository
                .createQueryBuilder("admins")
                .where("admins.active='1' AND admins.hidden='0' AND (admins.group_id='1' OR admins.group_id='2')")
                .getMany();            

            for (let admin of admins) {
                const panelUrl = admin.group_id === 1 ? cfg.ownerUrl : cfg.editorUrl;
                const url = `${panelUrl}/moderation/complaints/edit/${complaint.id}`;
                await this.mailService.adminComplaint(admin.email, url, complaint.content);
            }
        } catch (err) {
            await this.errorsService.log("api.mainsite/CMessagesService.notifyAdmins", err);
        }
    }
}
