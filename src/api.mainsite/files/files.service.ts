import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CErrorsService } from "src/common/services/errors.service";
import { IResponse } from "src/model/dto/response.interface";
import { Repository } from "typeorm";
import { CFile } from "../../model/entities/file";
import { IFiles } from "./dto/files.interface";

@Injectable()
export class CFilesService {
    constructor (
        @InjectRepository(CFile) private fileRepository: Repository<CFile>,
        private errorsService: CErrorsService,
    ) {}    

    public async all(): Promise<IResponse<IFiles>> {
        try {
            const files = await this.fileRepository.find({where: [{load_to: "all"}, {load_to: "mainsite"}]});            
            const data: IFiles = {};            

            for (let f of files) {
                data[f.mark] = {
                    fileurl: f.fileurl,
                    filename: f.filename,
                    filetype: f.filetype,
                };
            }

            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CFilesService.all", err);
            return {statusCode: 500, error};
        }
    }    
}
