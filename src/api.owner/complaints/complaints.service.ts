import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CErrorsService } from "src/common/services/errors.service";
import { IGetList } from "src/model/dto/getlist.interface";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { IResponse } from "src/model/dto/response.interface";
import { CComplaint } from "src/model/entities/complaint";
import { Repository } from "typeorm";
import { IComplaintUpdate } from "./dto/complaint.update.interface";

@Injectable()
export class CComplaintsService {
    constructor(
        @InjectRepository(CComplaint) private complaintRepository: Repository<CComplaint>,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CComplaint[]>> {
        try {            
            const filter = this.buildFilter(dto.filter);
            const sortBy = `complaints.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            const data = await this.complaintRepository
                .createQueryBuilder("complaints")
                .leftJoinAndSelect("complaints.author", "author")
                .leftJoinAndSelect("complaints.breaker", "breaker")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const elementsQuantity = await this.complaintRepository
                .createQueryBuilder("complaints")
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CComplaintsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CComplaint>> {
        try {
            const data = await this.complaintRepository.findOne({where: {id}, relations: ["author", "breaker"]});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "complaint not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CComplaintsService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.complaintRepository.delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CComplaintsService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            await this.complaintRepository.delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CComplaintsService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async update(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CComplaint>> {
        try {
            const dto = JSON.parse(fd.data) as IComplaintUpdate;
            const x = this.complaintRepository.create(dto);
            await this.complaintRepository.save(x);     
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CComplaintsService.update", err);
            return {statusCode: 500, error};
        } 
    }

    //////////////////////
    // utils    
    //////////////////////
    
    private buildFilter(dtoFilter: any): string {
        let filter = "TRUE";

        if (dtoFilter.from !== undefined) {
            filter += ` AND complaints.created_at >= '${dtoFilter.from}'`;
        }

        if (dtoFilter.to !== undefined) {
            filter += ` AND complaints.created_at <= '${dtoFilter.to}'`;
        }        

        if (dtoFilter.author_id !== undefined) {
            if (dtoFilter.author_id === null) {
                filter += ` AND complaints.author_id IS NULL`;
            } else {
                filter += ` AND complaints.author_id = '${dtoFilter.author_id}'`;
            }
        }

        if (dtoFilter.breaker_id !== undefined) {
            if (dtoFilter.breaker_id === null) {
                filter += ` AND complaints.breaker_id IS NULL`;
            } else {
                filter += ` AND complaints.breaker_id = '${dtoFilter.breaker_id}'`;
            }
        }

        return filter;
    }
}
