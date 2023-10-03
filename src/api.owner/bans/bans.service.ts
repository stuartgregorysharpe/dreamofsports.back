import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CErrorsService } from "src/common/services/errors.service";
import { IGetList } from "src/model/dto/getlist.interface";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { IResponse } from "src/model/dto/response.interface";
import { CBan } from "src/model/entities/ban";
import { Repository } from "typeorm";
import { IBanCreate } from "./dto/ban.create.interface";

@Injectable()
export class CBansService {
    constructor(
        @InjectRepository(CBan) private banRepository: Repository<CBan>,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CBan[]>> {
        try {            
            const filter = this.buildFilter(dto.filter);
            const sortBy = `bans.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            const data = await this.banRepository
                .createQueryBuilder("bans")
                .leftJoinAndSelect("bans.user", "user")
                .leftJoinAndSelect("bans.banned", "banned")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const elementsQuantity = await this.banRepository
                .createQueryBuilder("bans")
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CBansService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.banRepository.delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CBansService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            await this.banRepository.delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CBansService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData): Promise<IResponse<CBan>> {        
        try { 
            const dto = JSON.parse(fd.data) as IBanCreate;
            const x = this.banRepository.create(dto);
            await this.banRepository.save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CBansService.create", err);
            return {statusCode: 500, error};
        }        
    }

    //////////////
    // utils
    //////////////

    private buildFilter(dtoFilter: any): string {
        let filter = "TRUE";        

        if (dtoFilter.user_id !== undefined) {
            if (dtoFilter.user_id === null) {
                filter += ` AND bans.user_id IS NULL`;
            } else {
                filter += ` AND bans.user_id = '${dtoFilter.user_id}'`;
            }
        }

        if (dtoFilter.banned_id !== undefined) {
            if (dtoFilter.banned_id === null) {
                filter += ` AND bans.banned_id IS NULL`;
            } else {
                filter += ` AND bans.banned_id = '${dtoFilter.banned_id}'`;
            }
        }

        return filter;
    }
}
