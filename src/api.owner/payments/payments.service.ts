import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IResponse } from "src/model/dto/response.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CPayment } from "src/model/entities/payment";
import { Repository } from "typeorm";
import { CErrorsService } from "src/common/services/errors.service";

@Injectable()
export class CPaymentsService {
    constructor(
        @InjectRepository(CPayment) private paymentRepository: Repository<CPayment>,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CPayment[]>> {
        try {            
            const filter = this.buildFilter(dto.filter);
            const sortBy = `payments.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            const data = await this.paymentRepository
                .createQueryBuilder("payments")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const elementsQuantity = await this.paymentRepository
                .createQueryBuilder("payments")
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CPaymentsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CPayment>> {
        try {
            const data = await this.paymentRepository.findOne({where: {id}});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "payment not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CPaymentsService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.paymentRepository.delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CPaymentsService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            await this.paymentRepository.delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CPaymentsService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    ///////////////
    // utils
    ///////////////

    private buildFilter(dtoFilter: any): string {
        let filter = "TRUE";

        if (dtoFilter.from !== undefined) {
            filter += ` AND payments.created_at >= '${dtoFilter.from}'`;
        }

        if (dtoFilter.to !== undefined) {
            filter += ` AND payments.created_at <= '${dtoFilter.to}'`;
        }        

        if (dtoFilter.user_email) {
            filter += ` AND LOWER(payments.user_email) LIKE LOWER('%${dtoFilter.user_email}%')`;
        }

        return filter;
    }
}
