import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IResponse } from "src/model/dto/response.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CMessage } from "src/model/entities/message";
import { Repository } from "typeorm";
import { CErrorsService } from "src/common/services/errors.service";

@Injectable()
export class CMessagesService {
    constructor(
        @InjectRepository(CMessage) private messageRepository: Repository<CMessage>,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CMessage[]>> {
        try {            
            const filter = this.buildFilter(dto.filter);
            const sortBy = `messages.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            const data = await this.messageRepository
                .createQueryBuilder("messages")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const elementsQuantity = await this.messageRepository
                .createQueryBuilder("messages")
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const errTxt = `Error in MessagesService.chunk: ${String(err)}`;
            console.log(errTxt);
            return {statusCode: 500, error: errTxt};
        }
    }

    public async one(id: number): Promise<IResponse<CMessage>> {
        try {
            const data = await this.messageRepository.findOne({where: {id}});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "message not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CMessagesService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.messageRepository.delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CMessagesService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            await this.messageRepository.delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CMessagesService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    //////////////////
    // utils
    //////////////////

    private buildFilter(dtoFilter: any): string {
        let filter = "TRUE";

        if (dtoFilter.email) {
            filter += ` AND LOWER(messages.email) LIKE LOWER('%${dtoFilter.email}%')`;
        }

        if (dtoFilter.from !== undefined) {
            filter += ` AND messages.created_at >= '${dtoFilter.from}'`;
        }

        if (dtoFilter.to !== undefined) {
            filter += ` AND messages.created_at <= '${dtoFilter.to}'`;
        }

        return filter;
    }
}
