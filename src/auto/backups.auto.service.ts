import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { CBackupsService } from "src/api.owner/backups/backups.service";
import { CErrorsService } from "src/common/services/errors.service";
import { CBackup } from "src/model/entities/backup";
import { Repository } from "typeorm";

@Injectable()
export class CBackupsAutoService {
    constructor(
        @InjectRepository(CBackup) private backupRepository: Repository<CBackup>,
        private backupsService: CBackupsService,
        private errorsService: CErrorsService,
    ) {}

    @Cron('0 0 6 * * 1') // every monday 6:00 UTC
    private async create(): Promise<void> {
        try {
            const unfinished = await this.backupRepository.count({where: {ready: false}});

            if (unfinished) {
                return;
            }

            const old = await this.backupRepository.find();
            await this.backupsService.deleteUnbindedFile(old);    
            await this.backupRepository.remove(old);
            const filesBackup = this.backupRepository.create({type: "files"});
            await this.backupRepository.save(filesBackup);
            const dbBackup = this.backupRepository.create({type: "db"});
            await this.backupRepository.save(dbBackup);
            this.backupsService.createFilesBackup(filesBackup);
            this.backupsService.createDbBackup(dbBackup);
        } catch (err) {
            await this.errorsService.log("CBackupAutoService.create", err);
        }
    }
}