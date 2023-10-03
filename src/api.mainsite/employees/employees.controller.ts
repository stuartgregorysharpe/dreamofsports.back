import { Controller, Param, Post } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CEmployeesService } from "./employees.service";
import { IEmployee } from "./dto/employee.interface";

@Controller('api/mainsite/employees')
export class CEmployeesController {
    constructor (private employeesService: CEmployeesService) {}        

    @Post("all")
    public all(): Promise<IResponse<IEmployee[]>> {
        return this.employeesService.all();
    }
}
