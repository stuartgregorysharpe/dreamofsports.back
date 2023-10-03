import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CErrorsService } from "src/common/services/errors.service";
import { IResponse } from "src/model/dto/response.interface";
import { CEmployee } from "src/model/entities/employee";
import { Repository } from "typeorm";
import { IEmployee } from "./dto/employee.interface";
import { CLang } from "src/model/entities/lang";

@Injectable()
export class CEmployeesService {
    constructor(
        @InjectRepository(CEmployee) private employeeRepository: Repository<CEmployee>,
        @InjectRepository(CLang) private langRepository: Repository<CLang>,
        private errorsService: CErrorsService, 
    ) {}

    public async all(): Promise<IResponse<IEmployee[]>> {
        try {
            const employees = await this.employeeRepository.find({where: {active: true}, order: {pos: 1}, relations: ["translations"]}); 
            const langs = await this.langRepository.find({where: {active: true}}); 
            const data = employees.map(e => this.buildEmployee(e, langs));
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CEmployeesService.all", err);
            return {statusCode: 500, error};
        }
    } 

    /////////////////
    // utils
    /////////////////

    private buildEmployee(employee: CEmployee, langs: CLang[]): IEmployee {
        const data: IEmployee = {
            id: employee.id,
            img: employee.img,
            name: {},
            post: {},
        };
        
        for (let l of langs) {
            const t = employee.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
            data.post[l.slug] = t.post;
        }

        return data;
    }
}
