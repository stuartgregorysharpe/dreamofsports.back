import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CAppService } from "src/common/services/app.service";
import { CImagableService } from "src/common/services/imagable.service";
import { CUploadsService } from "src/common/services/uploads.service";
import { IResponse } from "src/model/dto/response.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CEmployee } from "src/model/entities/employee";
import { In, Repository } from "typeorm";
import { IKeyValue } from "src/model/keyvalue.interface";
import { CErrorsService } from "src/common/services/errors.service";
import { IEmployeeCreate } from "./dto/employee.create.interface";
import { IEmployeeUpdate } from "./dto/employee.update.interface";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Injectable()
export class CEmployeesService extends CImagableService {
    protected folder: string = "employees";
    protected resizeMap: IKeyValue<number> = {img: 400};

    constructor(
        @InjectRepository(CEmployee) protected employeeRepository: Repository<CEmployee>,
        protected uploadsService: CUploadsService,
        protected appService: CAppService,
        protected errorsService: CErrorsService,
    ) 
    {
        super(uploadsService, appService);
    }

    public async chunk(dto: IGetList): Promise<IResponse<CEmployee[]>> {
        try {            
            const data = await this.employeeRepository.find({order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from, relations: ["translations"]});
            const elementsQuantity = await this.employeeRepository.count();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CEmployeesService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CEmployee>> {
        try {
            const data = await this.employeeRepository.findOne({where: {id}, relations: ["translations"]});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "employee not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CEmployeesService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            const x = await this.employeeRepository.findOneBy({id});
            await this.deleteUnbindedImg(x);
            await this.employeeRepository.delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CEmployeesService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            const xl = await this.employeeRepository.findBy({id: In(ids)});  
            await this.deleteUnbindedImg(xl);
            await this.employeeRepository.delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CEmployeesService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CEmployee>> {        
        try { 
            const dto = JSON.parse(fd.data) as IEmployeeCreate;
            const x = this.employeeRepository.create(dto);
            await this.buildImg(x, uploads);
            await this.employeeRepository.save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CEmployeesService.create", err);
            return {statusCode: 500, error};
        }        
    }
    
    public async update(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CEmployee>> {
        try {
            const dto = JSON.parse(fd.data) as IEmployeeUpdate;
            const x = this.employeeRepository.create(dto);
            const old = await this.employeeRepository.findOneBy({id: x.id});
            await this.buildImg(x, uploads);
            await this.deleteUnbindedImg(x, old); // if img changed then delete old file
            await this.employeeRepository.save(x);     
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CEmployeesService.update", err);
            return {statusCode: 500, error};
        } 
    }
}
