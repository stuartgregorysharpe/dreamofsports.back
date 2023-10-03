import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CErrorsService } from "src/common/services/errors.service";
import { IGetList } from "src/model/dto/getlist.interface";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { IResponse } from "src/model/dto/response.interface";
import { CFavorite } from "src/model/entities/favorite";
import { Repository } from "typeorm";
import { IFavoriteCreate } from "./dto/favorite.create.interface";

@Injectable()
export class CFavoritesService {
    constructor(
        @InjectRepository(CFavorite) private favoriteRepository: Repository<CFavorite>,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CFavorite[]>> {
        try {            
            const filter = this.buildFilter(dto.filter);
            const sortBy = `favorites.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            const data = await this.favoriteRepository
                .createQueryBuilder("favorites")
                .leftJoinAndSelect("favorites.user", "user")
                .leftJoinAndSelect("favorites.favorite", "favorite")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const elementsQuantity = await this.favoriteRepository
                .createQueryBuilder("favorites")
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CFavoritesService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.favoriteRepository.delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CFavoritesService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            await this.favoriteRepository.delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CFavoritesService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData): Promise<IResponse<CFavorite>> {        
        try { 
            const dto = JSON.parse(fd.data) as IFavoriteCreate;
            const x = this.favoriteRepository.create(dto);
            await this.favoriteRepository.save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CFavoritesService.create", err);
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
                filter += ` AND favorites.user_id IS NULL`;
            } else {
                filter += ` AND favorites.user_id = '${dtoFilter.user_id}'`;
            }
        }

        if (dtoFilter.favorite_id !== undefined) {
            if (dtoFilter.favorite_id === null) {
                filter += ` AND favorites.favorite_id IS NULL`;
            } else {
                filter += ` AND favorites.favorite_id = '${dtoFilter.favorite_id}'`;
            }
        }

        return filter;
    }
}
