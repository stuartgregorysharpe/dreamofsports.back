import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CAppService } from "src/common/services/app.service";
import { IResponse } from "src/model/dto/response.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CUser, TUserType } from "src/model/entities/user";
import { DeleteResult, In, IsNull, Repository } from "typeorm";
import { IUserCreate } from "./dto/user.create.interface";
import { IUserUpdate } from "./dto/user.update.interface";
import { CErrorsService } from "src/common/services/errors.service";
import { IKeyValue } from "src/model/keyvalue.interface";
import { CResizeService } from "src/common/services/resize.service";
import { CSupabaseService } from "src/common/services/supabase/supabase.service";
import { CUserImage } from "src/model/entities/user.image";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { CUserVideo } from "src/model/entities/user.video";
import { CUserOther } from "src/model/entities/user.other";
import { CPasswordsService } from "src/common/services/passwords.service";
import { CUserPhone } from "src/model/entities/user.phone";
import { CUserEmail } from "src/model/entities/user.email";
import { CUserLink } from "src/model/entities/user.link";
import { CUserSocial } from "src/model/entities/user.social";
import { CReward } from "src/model/entities/reward";
import { IImagable } from "src/model/imagable.interface";

@Injectable()
export class CUsersService {
    private folder: string = "users";
    private imgResizeMap: IKeyValue<number> = {img: 1000, img_s: 400};
    private userImageResize: number = 1000;
    private rewardResize: number = 1000;

    constructor(
        @InjectRepository(CUser) private userRepository: Repository<CUser>,
        @InjectRepository(CUserImage) private userImageRepository: Repository<CUserImage>,
        @InjectRepository(CUserVideo) private userVideoRepository: Repository<CUserVideo>,
        @InjectRepository(CUserOther) private userOtherRepository: Repository<CUserOther>,
        @InjectRepository(CUserPhone) private userPhoneRepository: Repository<CUserPhone>,
        @InjectRepository(CUserEmail) private userEmailRepository: Repository<CUserEmail>,
        @InjectRepository(CUserLink) private userLinkRepository: Repository<CUserLink>,
        @InjectRepository(CUserSocial) private userSocialRepository: Repository<CUserSocial>,
        @InjectRepository(CReward) private rewardRepository: Repository<CReward>,
        private appService: CAppService,
        private resizeService: CResizeService,
        private supabaseService: CSupabaseService,
        private errorsService: CErrorsService,
        private passwordsService: CPasswordsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CUser[]>> {
        try {            
            const filter = this.buildFilter(dto.filter);
            const sortBy = `users.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            const data = await this.userRepository
                .createQueryBuilder("users")
                .leftJoinAndSelect("users.athlet", "athlet")
                .leftJoinAndSelect("users.firm", "firm")
                .leftJoinAndSelect("users.phones", "phones")
                .leftJoinAndSelect("users.emails", "emails")
                .leftJoinAndSelect("users.links", "links")
                .leftJoinAndSelect("users.socials", "socials")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const elementsQuantity = await this.userRepository
                .createQueryBuilder("users")
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CUsersService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CUser>> {
        try {
            // to sort joined array we need to use QueryBuilder instead of simple repository API!
            const data = await this.userRepository
                .createQueryBuilder("user")
                .where(`user.id = '${id}'`)
                .leftJoinAndSelect("user.athlet", "athlet")
                .leftJoinAndSelect("athlet.translations", "athlet_translations")
                .leftJoinAndSelect("athlet.rewards", "rewards")
                .leftJoinAndSelect("rewards.translations", "rewards_translations")
                .leftJoinAndSelect("user.firm", "firm")
                .leftJoinAndSelect("firm.translations", "firm_translations")
                .leftJoinAndSelect("user.phones", "phones")
                .leftJoinAndSelect("user.emails", "emails")
                .leftJoinAndSelect("user.links", "links")
                .leftJoinAndSelect("user.socials", "socials")
                .leftJoinAndSelect("user.images", "images")
                .leftJoinAndSelect("user.videos", "videos")
                .leftJoinAndSelect("user.others", "others")
                .orderBy({
                    "phones.pos": "ASC", 
                    "emails.pos": "ASC", 
                    "links.pos": "ASC", 
                    "socials.pos": "ASC", 
                    "images.pos": "ASC", 
                    "videos.pos": "ASC", 
                    "others.pos": "ASC",
                    "rewards.date": "DESC"
                })
                .getOne();
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "user not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CUsersService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            const x = await this.userRepository.findOne({where: {id}, relations: ["athlet", "athlet.rewards", "firm", "images", "videos", "others"]});
            await this.userRepository.delete(id);
            await this.deleteUnbindedImgOnDelete(x);
            await this.deleteUnbindedImagesOnDelete(x);
            await this.deleteUnbindedVideosOnDelete(x);
            await this.deleteUnbindedOthersOnDelete(x);
            await this.deleteUnbindedRewardsOnDelete(x);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CUsersService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            const xl = await this.userRepository.find({where: {id: In(ids)}, relations: ["athlet", "athlet.rewards", "firm", "images", "videos", "others"]});              
            await this.userRepository.delete(ids);
            await this.deleteUnbindedImgOnDeleteBulk(xl);
            await this.deleteUnbindedImagesOnDeleteBulk(xl);
            await this.deleteUnbindedVideosOnDeleteBulk(xl);
            await this.deleteUnbindedOthersOnDeleteBulk(xl);
            await this.deleteUnbindedRewardsOnDeleteBulk(xl);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CUsersService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }
    
    public async create(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CUser>> {        
        try { 
            const dto = JSON.parse(fd.data) as IUserCreate;
            const x = this.userRepository.create(dto);
            await this.buildImg(x, uploads);
            await this.buildImages(x, uploads);
            await this.buildVideos(x, uploads);
            await this.buildOthers(x, uploads);
            await this.buildRewards(x, uploads);
            x.password = this.passwordsService.buildHash(x.password);
            await this.userRepository.save(x);
            return {statusCode: 201, data: this.safeData(x)};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CUsersService.create", err);
            return {statusCode: 500, error};
        }        
    }

    public async update(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CUser>> {
        try {
            const dto = JSON.parse(fd.data) as IUserUpdate;
            const x = this.userRepository.create(dto);
            const old = await this.userRepository.findOne({where: {id: x.id}, relations: ["athlet", "athlet.rewards", "firm"]});            
            await this.buildImg(x, uploads);
            await this.buildImages(x, uploads);
            await this.buildVideos(x, uploads);
            await this.buildOthers(x, uploads);
            await this.buildRewards(x, uploads);
            
            if (x.password) {                
                x.password = this.passwordsService.buildHash(x.password);
            } else {
                delete x.password; // if we got empty or null password, then it will not change in DB
            }

            await this.userRepository.save(x);                
            await this.deleteUnbindedImgOnUpdate(x, old); // if img changed then delete old file 
            await this.deleteUnbindedPhones();  
            await this.deleteUnbindedEmails();  
            await this.deleteUnbindedLinks();  
            await this.deleteUnbindedSocials();  
            await this.deleteUnbindedImagesOnUpdate(); 
            await this.deleteUnbindedVideosOnUpdate();
            await this.deleteUnbindedOthersOnUpdate();
            await this.deleteUnbindedRewardsOnUpdate(x, old);
            return {statusCode: 200, data: this.safeData(x)};
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CUsersService.update", err);
            return {statusCode: 500, error};
        } 
    }

    //////////////////////
    // utils - general
    //////////////////////
    
    private buildFilter(dtoFilter: any): string {
        let filter = "TRUE";

        if (dtoFilter.search) {
            filter += ` AND (LOWER(users.email) LIKE LOWER('%${dtoFilter.search}%') OR users.id = '${dtoFilter.search}')`;
        }

        if (dtoFilter.email) {
            filter += ` AND LOWER(users.email) LIKE LOWER('%${dtoFilter.email}%')`;
        }

        if (dtoFilter.type) {
            filter += ` AND users.type = '${dtoFilter.type}'`;
        }

        if (dtoFilter.id) {
            filter += ` AND users.id='${dtoFilter.id}'`;
        }

        return filter;
    }

    private safeData(x: CUser): CUser {
        delete x.password;
        return x;
    }

    private async fake(): Promise<void> {
        for (let i = 0; i < 1000; i++) {
            const user = new CUser().fakeInit("athlet", i);
            await this.userRepository.save(user);            
        }

        for (let i = 1000; i < 2000; i++) {
            const user = new CUser().fakeInit("firm", i);
            await this.userRepository.save(user);            
        }
    }

    //////////////////////
    // utils - img
    //////////////////////

    private async buildImg(x: CUser, uploads: Express.Multer.File[]): Promise<void> {
        for (let profile of ["athlet", "firm"]) {            
            // if img set to null, then clear all additional fields
            if (!x[profile].img) {
                this.resetImg(x[profile]);                
                continue;
            }   

            // process upload
            const upload = uploads.find(u => u.fieldname === `${profile}_img`);            
            if (!upload) continue;
            
            for (let field in this.imgResizeMap) {
                const res = await this.resizeService.resize(upload, this.imgResizeMap[field]);
                await this.supabaseService.uploadFile("images", `${this.folder}/${res.fileName}`, res.buffer, res.contentType);
                x[profile][field] = res.fileName;
            }                        
        }
    }  
    
    private resetImg(x: IImagable): void {
        for (let field in this.imgResizeMap) {
            x[field] = null;
        }
    }

    private async deleteUnbindedImgOnDelete(x: CUser): Promise<void> {
        const paths: string[] = [];

        for (let profile of ["athlet", "firm"]) {
            for (let field in this.imgResizeMap) {
                if (x[profile][field]) {
                    paths.push(`${this.folder}/${x[profile][field]}`);
                }
            }  
        }

        paths.length && await this.supabaseService.deleteFiles("images", paths);
    }

    private async deleteUnbindedImgOnDeleteBulk(xl: CUser[]): Promise<void> {
        const paths: string[] = [];

        for (let x of xl) {
            for (let profile of ["athlet", "firm"]) {
                for (let field in this.imgResizeMap) {
                    if (x[profile][field]) {
                        paths.push(`${this.folder}/${x[profile][field]}`);
                    }
                }
            }
            
        }

        paths.length && await this.supabaseService.deleteFiles("images", paths);
    }

    private async deleteUnbindedImgOnUpdate(current: CUser, old: CUser): Promise<void> {
        const paths: string[] = [];

        for (let profile of ["athlet", "firm"]) {
            if (current[profile].img !== old[profile].img && old[profile].img) { // got new img data
                for (let field in this.imgResizeMap) {
                    paths.push(`${this.folder}/${old[profile][field]}`);
                }                
            }
        }

        paths.length && await this.supabaseService.deleteFiles("images", paths);
    }    

    //////////////////////
    // utils - phones
    //////////////////////

    private deleteUnbindedPhones(): Promise<DeleteResult> {
        return this.userPhoneRepository.delete({user_id: IsNull()});
    }  

    //////////////////////
    // utils - emails
    //////////////////////

    private deleteUnbindedEmails(): Promise<DeleteResult> {
        return this.userEmailRepository.delete({user_id: IsNull()});        
    }  

    //////////////////////
    // utils - links
    //////////////////////

    private deleteUnbindedLinks(): Promise<DeleteResult> {
        return this.userLinkRepository.delete({user_id: IsNull()});        
    }
    
    //////////////////////
    // utils - socials
    //////////////////////

    private deleteUnbindedSocials(): Promise<DeleteResult> {
        return this.userSocialRepository.delete({user_id: IsNull()});        
    }

    //////////////////////
    // utils - images
    //////////////////////

    private async buildImages(x: CUser, uploads: Express.Multer.File[]): Promise<void> {
        const ul = uploads.filter(u => u.fieldname === "images");

        for (let u of ul) {
            const res = await this.resizeService.resize(u, this.userImageResize);  
            await this.supabaseService.uploadFile("images", `${this.folder}/${res.fileName}`, res.buffer, res.contentType);
            const originalname = Buffer.from(u.originalname, 'latin1').toString('utf8');
            const userImage = x.images.find(ui => ui.url === originalname);
            userImage.url = res.fileName;
        }
    }   

    private async deleteUnbindedImagesOnUpdate(): Promise<void> { // при апдейте могут остаться лишние записи с зануленными user_id, удаляем и файлы, и сами записи
        const images = await this.userImageRepository.find({where: {user_id: IsNull()}});
        const paths = images.map(image => `${this.folder}/${image.url}`);
        await this.userImageRepository.delete({user_id: IsNull()});
        paths.length && await this.supabaseService.deleteFiles("images", paths);
    }

    private async deleteUnbindedImagesOnDelete(x: CUser): Promise<void> { // удаление одного пользователя - подчищаем файлы
        const paths = x.images.map(image => `${this.folder}/${image.url}`);
        paths.length && await this.supabaseService.deleteFiles("images", paths);
    }

    private async deleteUnbindedImagesOnDeleteBulk(xl: CUser[]): Promise<void> { // удаление массива пользователей - подчищаем файлы
        let paths: string[] = [];
        
        for (let x of xl) {
            paths = [...paths, ...x.images.map(image => `${this.folder}/${image.url}`)];
        }

        paths.length && await this.supabaseService.deleteFiles("images", paths);
    }

    //////////////////////
    // utils - videos
    //////////////////////

    private async buildVideos(x: CUser, uploads: Express.Multer.File[]): Promise<void> {
        const ul = uploads.filter(u => u.fieldname === "videos");

        for (let u of ul) {
            const extension = this.appService.getFileExtensionByName(u.originalname);
            const fileName = `${Math.round(new Date().getTime()).toString()}.${extension}`;  
            await this.supabaseService.uploadFile("videos", `${this.folder}/${fileName}`, u.buffer, u.mimetype);
            const originalname = Buffer.from(u.originalname, 'latin1').toString('utf8');
            const userVideo = x.videos.find(uv => uv.url === originalname);
            userVideo.url = fileName;
        }
    }  

    private async deleteUnbindedVideosOnUpdate(): Promise<void> { // при апдейте могут остаться лишние записи с зануленными user_id, удаляем и файлы, и сами записи
        const videos = await this.userVideoRepository.find({where: {user_id: IsNull()}});
        const paths = videos.map(video => `${this.folder}/${video.url}`);
        await this.userVideoRepository.delete({user_id: IsNull()});
        paths.length && await this.supabaseService.deleteFiles("videos", paths);
    }

    private async deleteUnbindedVideosOnDelete(x: CUser): Promise<void> { // удаление одного пользователя - подчищаем файлы
        const paths = x.videos.map(video => `${this.folder}/${video.url}`);
        paths.length && await this.supabaseService.deleteFiles("videos", paths);
    }

    private async deleteUnbindedVideosOnDeleteBulk(xl: CUser[]): Promise<void> { // удаление массива пользователей - подчищаем файлы
        let paths: string[] = [];

        for (let x of xl) {
            paths = [...paths, ...x.videos.map(video => `${this.folder}/${video.url}`)];
        }

        paths.length && await this.supabaseService.deleteFiles("videos", paths);
    }

    //////////////////////
    // utils - others
    //////////////////////

    private async buildOthers(x: CUser, uploads: Express.Multer.File[]): Promise<void> {
        const ul = uploads.filter(u => u.fieldname === "others");

        for (let u of ul) {
            const extension = this.appService.getFileExtensionByName(u.originalname);
            const fileName = `${Math.round(new Date().getTime()).toString()}.${extension}`;  
            await this.supabaseService.uploadFile("others", `${this.folder}/${fileName}`, u.buffer, u.mimetype);
            const originalname = Buffer.from(u.originalname, 'latin1').toString('utf8');
            const userOther = x.others.find(uo => uo.url === originalname);
            userOther.url = fileName;
        }
    }  

    private async deleteUnbindedOthersOnUpdate(): Promise<void> { // при апдейте могут остаться лишние записи с зануленными user_id, удаляем и файлы, и сами записи
        const others = await this.userOtherRepository.find({where: {user_id: IsNull()}});
        const paths = others.map(other => `${this.folder}/${other.url}`);
        await this.userOtherRepository.delete({user_id: IsNull()});
        paths.length && await this.supabaseService.deleteFiles("others", paths);
    }

    private async deleteUnbindedOthersOnDelete(x: CUser): Promise<void> { // удаление одного пользователя - подчищаем файлы
        const paths = x.others.map(other => `${this.folder}/${other.url}`);
        paths.length && await this.supabaseService.deleteFiles("others", paths);
    }

    private async deleteUnbindedOthersOnDeleteBulk(xl: CUser[]): Promise<void> { // удаление массива пользователей - подчищаем файлы
        let paths: string[] = [];

        for (let x of xl) {
            paths = [...paths, ...x.others.map(other => `${this.folder}/${other.url}`)];
        }

        paths.length && await this.supabaseService.deleteFiles("others", paths);
    }    

    ////////////////////
    // utils - rewards
    ////////////////////

    private async buildRewards(x: CUser, uploads: Express.Multer.File[]): Promise<void> {
        const ul = uploads.filter(u => u.fieldname === "rewards");

        for (let u of ul) {
            const res = await this.resizeService.resize(u, this.rewardResize);  
            await this.supabaseService.uploadFile("images", `${this.folder}/${res.fileName}`, res.buffer, res.contentType);
            const originalname = Buffer.from(u.originalname, 'latin1').toString('utf8');
            const reward = x.athlet.rewards.find(r => r.img === originalname);
            reward.img = res.fileName;
        }
    } 

    private async deleteUnbindedRewardsOnDelete(x: CUser): Promise<void> { // удаление одного пользователя - подчищаем файлы
        const paths = x.athlet.rewards.map(r => `${this.folder}/${r.img}`);
        paths.length && await this.supabaseService.deleteFiles("images", paths);
    }

    private async deleteUnbindedRewardsOnDeleteBulk(xl: CUser[]): Promise<void> { // удаление массива пользователей - подчищаем файлы
        let paths: string[] = [];

        for (let x of xl) {
            paths = [...paths, ...x.athlet.rewards.map(r => `${this.folder}/${r.img}`)];
        }

        paths.length && await this.supabaseService.deleteFiles("images", paths);
    }

    private async deleteUnbindedRewardsOnUpdate(x: CUser, old: CUser): Promise<void> { 
        let paths = [];
        
        // при апдейте могут остаться лишние записи с зануленными athlet_id, такие записи удаляем, и отправляем их картинки в массив на удаление
        const rewards = await this.rewardRepository.find({where: {athlet_id: IsNull()}});
        paths = [...paths, ...rewards.map(r => `${this.folder}/${r.img}`)];
        await this.rewardRepository.delete({athlet_id: IsNull()});
        
        // также могут измениться картинки у старых записей, отправляем старые картинки в массив на удаление
        for (let oldReward of old.athlet.rewards) {
            const currentReward = x.athlet.rewards.find(r => r.id === oldReward.id);            
            if (currentReward && currentReward.img !== oldReward.img && oldReward.img) {
                paths.push(`${this.folder}/${oldReward.img}`);
            }
        }

        // удаляем картинки
        paths.length && await this.supabaseService.deleteFiles("images", paths);
    }     
}