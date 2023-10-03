import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CAppService } from "src/common/services/app.service";
import { IResponse } from "src/model/dto/response.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CCat } from "src/model/entities/cat";
import { IsNull, Repository } from "typeorm";
import { ICatCreate } from "./dto/cat.create.interface";
import { ICatUpdate } from "./dto/cat.update.interface";
import { CSlugService } from "src/common/services/slug.service";
import { CErrorsService } from "src/common/services/errors.service";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Injectable()
export class CCatsService{
    constructor(
        @InjectRepository(CCat) private catRepository: Repository<CCat>,
        private slugService: CSlugService,
        private appService: CAppService,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CCat[]>> {
        try {            
            const data = await this.catRepository.find({where: {parent_id: IsNull()}, order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from, relations: ["translations"]});
            const elementsQuantity = await this.catRepository.count();
            const elementsQuantityFirstLevel = await this.catRepository.count({where: {parent_id: IsNull()}});
            const pagesQuantity = Math.ceil(elementsQuantityFirstLevel / dto.q);

            for (let cat of data) {
                cat.children = await this.appService.buildChildren(cat, this.catRepository, dto.sortBy, dto.sortDir, false, ["translations"]) as CCat[];
            }            

            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CCatsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CCat>> {
        try {
            const data = await this.catRepository.findOne({where: {id}, relations: ["translations"]});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "cat not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CCatsService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.catRepository.delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CCatsService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            await this.catRepository.delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CCatsService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData): Promise<IResponse<CCat>> {        
        try { 
            const dto = JSON.parse(fd.data) as ICatCreate;
            const x = this.catRepository.create(dto);
            x.slug = await this.slugService.checkSlug(this.catRepository, x);
            await this.catRepository.save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CCatsService.create", err);
            return {statusCode: 500, error};
        }        
    }
    
    public async update(fd: IJsonFormData): Promise<IResponse<CCat>> {
        try {
            const dto = JSON.parse(fd.data) as ICatUpdate;
            const x = this.catRepository.create(dto);
            x.slug = await this.slugService.checkSlug(this.catRepository, x);
            await this.catRepository.save(x);     
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CCatsService.update", err);
            return {statusCode: 500, error};
        } 
    }
}
