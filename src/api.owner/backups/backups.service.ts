import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IResponse } from "src/model/dto/response.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CBackup } from "src/model/entities/backup";
import { In, Repository } from "typeorm";
import { CSetting } from "src/model/entities/setting";
import { CAppService } from "src/common/services/app.service";
import { cfg } from "src/app.config";
import * as FS from "fs";
import { CErrorsService } from "src/common/services/errors.service";

@Injectable()
export class CBackupsService {
    constructor(
        @InjectRepository(CBackup) private backupRepository: Repository<CBackup>,
        @InjectRepository(CSetting) private settingRepository: Repository<CSetting>,
        private appService: CAppService,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CBackup[]>> {
        try {            
            const data = await this.backupRepository.find({order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from});
            const elementsQuantity = await this.backupRepository.count();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CBackupsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            const x = await this.backupRepository.findOneBy({id});
            await this.deleteUnbindedFile(x);
            await this.backupRepository.delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CBackupsService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {     
            const xl = await this.backupRepository.findBy({id: In(ids)});  
            await this.deleteUnbindedFile(xl);        
            await this.backupRepository.delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CBackupsService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(): Promise<IResponse<void>> {        
        try { 
            const unfinished = await this.backupRepository.count({where: {ready: false}});

            if (unfinished) {
                return {statusCode: 503, error: "backups in progress"};
            }

            const filesBackup = this.backupRepository.create({type: "files"});
            await this.backupRepository.save(filesBackup);
            const dbBackup = this.backupRepository.create({type: "db"});
            await this.backupRepository.save(dbBackup);
            this.createFilesBackup(filesBackup);
            this.createDbBackup(dbBackup);
            return {statusCode: 201};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CBackupsService.create", err);
            return {statusCode: 500, error};
        }        
    }

    /////////////////
    // utils
    /////////////////
    
    public async createFilesBackup(backup: CBackup): Promise<void> {  
        try {
            const arcFilename = `${this.appService.mysqlDate(new Date())}-files-${backup.id}.zip`;
            const cmd = `cd .. && zip -r backup/${arcFilename} static`;
            await this.appService.spawn(cmd);
            backup.filename = arcFilename;
            backup.ready = true;
            await this.backupRepository.save(backup);
        } catch (err) {
            await this.errorsService.log("api.owner/CBackupsService.createFilesBackup", err);
        }       
    }

    public async createDbBackup(backup: CBackup): Promise<void> {
        try {
            const arcFilename = `${this.appService.mysqlDate(new Date())}-db-${backup.id}.gz`;
            const cmd = `mysqldump -h ${cfg.dbHost} -P ${cfg.dbPort} -u ${cfg.dbLogin} -p${cfg.dbPassword} ${cfg.dbName} | gzip > ../backup/${arcFilename}`; // export PATH=$PATH:/usr/local/Cellar/mysql-client/8.0.33_1/bin
            await this.appService.spawn(cmd);
            backup.filename = arcFilename;
            backup.ready = true;
            await this.backupRepository.save(backup);
        } catch (err) {
            await this.errorsService.log("api.owner/CBackupsService.createDbBackup", err);
        }    
    }

    private deleteFile(path: string): Promise<void> {
        return new Promise((resolve, reject) => FS.existsSync(`../backup/${path}`) ? FS.rm(`../backup/${path}`, err => err ? reject(err) : resolve()) : resolve());        
    }

    public async deleteUnbindedFile(backup: CBackup): Promise<void>;
    public async deleteUnbindedFile(backups: CBackup[]): Promise<void>;
    public async deleteUnbindedFile(data: CBackup | CBackup[]): Promise<void> {
        if (Array.isArray(data)) {
            for (let backup of data) {
                await this.deleteFile(backup.filename);
            }
        } else {
            await this.deleteFile(data.filename);
        }
    }
}
