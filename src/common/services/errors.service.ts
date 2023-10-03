import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CError } from "src/model/entities/error";
import { Repository } from "typeorm";

@Injectable()
export class CErrorsService {
    constructor(@InjectRepository(CError) private errorRepository: Repository<CError>) {}

    public async log(source: string, error: any): Promise<string> {
        const errorText = `Error in ${source}: ${String(error)}`;
        console.log(errorText);
        await this.errorRepository.save({source, text: String(error)});
        return errorText;
    }
}