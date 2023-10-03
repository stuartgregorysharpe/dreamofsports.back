import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { CAppService } from "src/common/services/app.service";
import { CErrorsService } from "src/common/services/errors.service";
import { CMailService } from "src/common/services/mail.service";
import { IResponse } from "src/model/dto/response.interface";
import { CUser } from "src/model/entities/user";
import { CVerification } from "src/model/entities/verification";
import { DeleteResult, IsNull, MoreThanOrEqual, Repository } from "typeorm";
import { IUserLogin } from "./dto/user.login.interface";
import { IUserAuthData } from "./dto/user.authdata.interface";
import { CPasswordsService } from "src/common/services/passwords.service";
import { IUserVerify } from "./dto/user.verify.interface";
import { IUserRegister } from "./dto/user.register.interface";
import { CAthlet } from "src/model/entities/athlet";
import { CLang } from "src/model/entities/lang";
import { CFirm } from "src/model/entities/firm";
import { IUserEnterByEmail } from "./dto/user.enterbyemail.interface";
import { IUserRecover } from "./dto/user.recover.interface";
import { AxiosRequestConfig } from "axios";
import { CSetting } from "src/model/entities/setting";
import { IUserGetLinkedinEmail } from "./dto/user.getlinkedinemail.interface";
import { IUser } from "./dto/user.interface";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { IUserUpdate } from "./dto/user.update.interface";
import { IKeyValue } from "src/model/keyvalue.interface";
import { CResizeService } from "src/common/services/resize.service";
import { CSupabaseService } from "src/common/services/supabase/supabase.service";
import { CUserImage } from "src/model/entities/user.image";
import { CUserVideo } from "src/model/entities/user.video";
import { CUserOther } from "src/model/entities/user.other";
import { CUserPhone } from "src/model/entities/user.phone";
import { CUserEmail } from "src/model/entities/user.email";
import { CUserLink } from "src/model/entities/user.link";
import { CUserSocial } from "src/model/entities/user.social";
import { CReward } from "src/model/entities/reward";
import { IImagable } from "src/model/imagable.interface";
import { CNetworkService } from "src/common/services/network.service";
import { IUserDelete } from "./dto/user.delete.interface";
import { CUserFollow } from "src/model/entities/user.follow";

@Injectable()
export class CUsersService {
    private folder: string = "users";
    private imgResizeMap: IKeyValue<number> = { img: 1000, img_s: 400 };
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
        @InjectRepository(CAthlet) private athletRepository: Repository<CAthlet>,
        @InjectRepository(CFirm) private firmRepository: Repository<CFirm>,
        @InjectRepository(CVerification) private verificationRepository: Repository<CVerification>,
        @InjectRepository(CLang) private langRepository: Repository<CLang>,
        @InjectRepository(CSetting) private settingRepository: Repository<CSetting>,
        @InjectRepository(CReward) private rewardRepository: Repository<CReward>,
        @InjectRepository(CUserFollow) private followRepository: Repository<CUserFollow>,
        private jwtService: JwtService,
        private errorsService: CErrorsService,
        private appService: CAppService,
        private networkService: CNetworkService,
        private mailService: CMailService,
        private passwordsService: CPasswordsService,
        private resizeService: CResizeService,
        private supabaseService: CSupabaseService,
    ) { }

    public async login(dto: IUserLogin): Promise<IResponse<IUserAuthData>> {
        try {
            const user = await this.authorize(dto);

            if (!user) {
                return { statusCode: 401, error: "Unauthorized" };
            }

            const payload = { id: user.id, type: user.type };
            const data: IUserAuthData = { id: user.id, type: user.type, token: this.jwtService.sign(payload) };
            return { statusCode: 200, data };
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CUsersService.login", err);
            return { statusCode: 500, error };
        }
    }

    public async verify(dto: IUserVerify): Promise<IResponse<void>> {
        try {
            const login = dto.email;
            const code = this.appService.randomString(6, "digits");
            console.log(code);
            await this.verificationRepository.delete({ login });
            const verification = this.verificationRepository.create({ login, code });
            await this.verificationRepository.save(verification);
            this.mailService.userEmailVerification(dto.email, dto.lang_id, code);
            return { statusCode: 200 };
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CUsersService.verify", err);
            return { statusCode: 500, error };
        }
    }

    public async register(dto: IUserRegister): Promise<IResponse<IUserAuthData>> {
        try {
            let user = await this.userRepository.findOneBy({ email: dto.email });

            if (user) {
                return { statusCode: 409, error: "e-mail already in use" };
            }

            const now = new Date();
            const expiration = new Date(now.getTime() - 5 * 60 * 1000);
            const verification = await this.verificationRepository.findOne({ where: { login: dto.email, code: dto.code, created_at: MoreThanOrEqual(expiration) } });

            if (!verification) {
                return { statusCode: 401, error: "code is incorrect" };
            }

            user = await this.initUser(dto);
            await this.userRepository.save(user);
            const payload = { id: user.id, type: user.type };
            const data: IUserAuthData = { id: user.id, type: user.type, token: this.jwtService.sign(payload) };
            return { statusCode: 201, data };
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CUsersService.register", err);
            return { statusCode: 500, error };
        }
    }

    public async enterByEmail(dto: IUserEnterByEmail): Promise<IResponse<IUserAuthData>> {
        try {
            let user = await this.userRepository.findOneBy({ email: dto.email });

            // user exists
            if (user) {
                // type match - return authdata
                if (user.type === dto.type) {
                    const payload = { id: user.id, type: user.type };
                    const data: IUserAuthData = { id: user.id, type: user.type, token: this.jwtService.sign(payload) };
                    return { statusCode: 200, data };
                }

                // type mismatch - return authdata
                return { statusCode: 401, error: "Unauthorized" };
            }

            // new user
            user = await this.initUser(dto);
            await this.userRepository.save(user);
            const payload = { id: user.id, type: user.type };
            const data: IUserAuthData = { id: user.id, type: user.type, token: this.jwtService.sign(payload) };
            return { statusCode: 201, data };
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CUsersService.enterByEmail", err);
            return { statusCode: 500, error };
        }
    }

    public async recover(dto: IUserRecover): Promise<IResponse<void>> {
        try {
            const user = await this.userRepository.findOne({ where: { email: dto.email, active: true } });

            if (!user) {
                return { statusCode: 404, error: "e-mail not found" };
            }

            const now = new Date();
            const expiration = new Date(now.getTime() - 5 * 60 * 1000);
            const verification = await this.verificationRepository.findOne({ where: { login: dto.email, code: dto.code, created_at: MoreThanOrEqual(expiration) } });

            if (!verification) {
                return { statusCode: 401, error: "code is incorrect" };
            }

            user.password = this.passwordsService.buildHash(dto.password);
            await this.userRepository.save(user);
            return { statusCode: 200 };
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CUsersService.recover", err);
            return { statusCode: 500, error };
        }
    }

    public async follow(follower_id: number, user_id: number, type: string): Promise<IResponse<boolean>> {
        try {
            const x = await this.followRepository.findOne({ where: { user_id: user_id, follower_id: follower_id, type: type } });
            console.log(x);
            if (!x) {
                const t = this.followRepository.create({
                    user_id, follower_id, type
                })
                await this.followRepository.save(t);
                return { statusCode: 200, data: true };
            } else {
                this.followRepository.delete(x.id);
                return { statusCode: 200, data: false };
            }
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CUserService.toggleLike", err);
            return { statusCode: 500, error };
        }
    }

    public async ifFollow(follow_id: number, user_id: number, type: string): Promise<IResponse<boolean>> {
        try {
            const x = await this.followRepository.findOne({ where: { follower_id: follow_id, user_id: user_id, type: type } });
            console.log(x);
            if (!x) {
                return { statusCode: 200, data: false };
            } else {
                return { statusCode: 200, data: true };
            }
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CPostService.toggleLike", err);
            return { statusCode: 500, error };
        }
    }

    public async linkedinEmail(dto: IUserGetLinkedinEmail): Promise<IResponse<string>> {
        try {
            let url = "https://www.linkedin.com/oauth/v2/accessToken";
            const client_id = (await this.settingRepository.findOne({ where: { p: "linkedin-client-id" } }))?.v;
            const client_secret = (await this.settingRepository.findOne({ where: { p: "linkedin-client-secret" } }))?.v;

            if (!client_id || !client_secret) {
                return { statusCode: 404, error: "setting(s) not found" };
            }

            const body = {
                grant_type: "authorization_code",
                code: dto.code,
                client_id,
                client_secret,
                redirect_uri: dto.redirect_uri,
            };
            let options: AxiosRequestConfig = { headers: { 'content-type': 'application/x-www-form-urlencoded' } };
            let res = await this.networkService.post(url, body, options);
            const token = res.data["access_token"];
            url = "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))";
            options = { headers: { "Authorization": `Bearer ${token}` } };
            res = await this.networkService.forcedGet(url, options);
            const data = res.data["elements"][0]["handle~"]["emailAddress"];
            return { statusCode: 200, data };
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CUsersService.linkedinAccessToken", err);
            return { statusCode: 500, error };
        }
    }

    public async one(id: number): Promise<IResponse<IUser>> {
        try {
            // to sort joined array we need to use QueryBuilder instead of simple repository API!
            const user = await this.userRepository
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
                .leftJoinAndSelect("user.followers", "followers")
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
            return user ? { statusCode: 200, data: this.buildUser(user) } : { statusCode: 404, error: "user not found" };
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CUsersService.one", err);
            return { statusCode: 500, error };
        }
    }

    public async update(user_id: number, fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<void>> {
        try {
            const dto = JSON.parse(fd.data) as IUserUpdate;

            if (user_id !== dto.id) {
                return { statusCode: 401, error: "no permissions to update user" };
            }

            const x = this.buildSafeUpdate(dto);
            const old = await this.userRepository.findOne({ where: { id: x.id }, relations: ["athlet", "athlet.rewards", "firm"] });
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
            return { statusCode: 200 };
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CUsersService.update", err);
            return { statusCode: 500, error };
        }
    }

    public async delete(user_id: number, dto: IUserDelete): Promise<IResponse<void>> {
        try {
            const user = await this.userRepository
                .createQueryBuilder("user")
                .addSelect("user.password")
                .where(`user.id = '${user_id}'`)
                .leftJoinAndSelect("user.athlet", "athlet")
                .leftJoinAndSelect("athlet.rewards", "rewards")
                .leftJoinAndSelect("user.firm", "firm")
                .leftJoinAndSelect("user.images", "images")
                .leftJoinAndSelect("user.videos", "videos")
                .leftJoinAndSelect("user.others", "others")
                .getOne();

            if (!user?.active || !(await this.passwordsService.compareHash(dto.password, user.password))) {
                return { statusCode: 401, error: "Unauthorized" };
            }

            await this.userRepository.delete(user_id);
            await this.deleteUnbindedImgOnDelete(user);
            await this.deleteUnbindedImagesOnDelete(user);
            await this.deleteUnbindedVideosOnDelete(user);
            await this.deleteUnbindedOthersOnDelete(user);
            await this.deleteUnbindedRewardsOnDelete(user);
            return { statusCode: 200 };
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CUsersService.delete", err);
            return { statusCode: 500, error };
        }
    }

    //////////////////////
    // utils - general
    //////////////////////

    private async authorize(dto: IUserLogin): Promise<CUser> {
        const user = await this.userRepository
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where({ email: dto.email, type: dto.type })
            .getOne();

        if (user?.active && await this.passwordsService.compareHash(dto.password, user.password)) {
            return user;
        }

        return null;
    }

    private async initUser(dto: IUserRegister | IUserEnterByEmail): Promise<CUser> {
        const user = this.userRepository.create(dto);
        user.password = user.password ? this.passwordsService.buildHash(user.password) : this.appService.randomString(6, "full");
        const langs = await this.langRepository.find();
        const athletTranslations = langs.map(l => ({ lang_id: l.id, firstname: dto.firstName, lastname: dto.lastName, region: "", city: "", bio: "", team: "", role: "", rewards: "" }));
        const firmTranslations = langs.map(l => ({ lang_id: l.id, name: dto.firstName, branch: "", founder: "", reg_addr: "", fact_addr: "", about: "" }));
        user.athlet = this.athletRepository.create({ sub_type: dto.sub_type, translations: athletTranslations });
        user.firm = this.firmRepository.create({ sub_type: dto.sub_type, translations: firmTranslations });
        const phoneNumber = {
            value: dto.phoneNumber,
            pos: 0,
        }
        user.phones = [this.userPhoneRepository.create(phoneNumber)];
        user.emails = [this.userEmailRepository.create({
            value: dto.email,
            pos: 0,
        })];
        return user;
    }

    private buildUser(x: CUser): IUser {
        delete x.active;
        delete x.payed_at;
        delete x.created_at;
        delete x.password;
        delete x.defended;
        delete x.athlet.defended;
        delete x.firm.defended;

        for (let y of x.phones) {
            delete y.defended;
        }

        for (let y of x.emails) {
            delete y.defended;
        }

        for (let y of x.links) {
            delete y.defended;
        }

        for (let y of x.socials) {
            delete y.defended;
        }

        for (let y of x.images) {
            delete y.defended;
        }

        for (let y of x.videos) {
            delete y.defended;
        }

        for (let y of x.others) {
            delete y.defended;
        }

        for (let y of x.athlet.rewards) {
            delete y.defended;
        }

        return x;
    }

    private buildSafeUpdate(dto: IUserUpdate): CUser {
        const user = this.userRepository.create(dto);
        delete user.email;
        delete user.payed_until;
        return user;
    }

    // в клиентской части мы не можем ждать долгой загрузки на supabase, поэтому используем процедуру, обернутую в отдельный try/catch
    private async uploadToSupabase(bucket: string, path: string, file: Buffer, contentType: string): Promise<void> {
        try {
            await this.supabaseService.uploadFile(bucket, path, file, contentType);
        } catch (err) {
            await this.errorsService.log("api.mainsite/CUsersService.uploadToSupabase", err);
        }
    }

    // в клиентской части мы не можем ждать долгого удаления с supabase, поэтому используем процедуру, обернутую в отдельный try/catch
    private async deleteFromSupabase(bucket: string, paths: string[]): Promise<void> {
        try {
            await this.supabaseService.deleteFiles(bucket, paths);
        } catch (err) {
            await this.errorsService.log("api.mainsite/CUsersService.deleteFromSupabase", err);
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
                this.uploadToSupabase("images", `${this.folder}/${res.fileName}`, res.buffer, res.contentType);
                x[profile][field] = res.fileName;
            }
        }
    }

    private resetImg(x: IImagable): void {
        for (let field in this.imgResizeMap) {
            x[field] = null;
        }
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

        paths.length && this.deleteFromSupabase("images", paths);
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

        paths.length && this.deleteFromSupabase("images", paths);
    }

    //////////////////////
    // utils - phones
    //////////////////////

    private deleteUnbindedPhones(): Promise<DeleteResult> {
        return this.userPhoneRepository.delete({ user_id: IsNull() });
    }

    //////////////////////
    // utils - emails
    //////////////////////

    private deleteUnbindedEmails(): Promise<DeleteResult> {
        return this.userEmailRepository.delete({ user_id: IsNull() });
    }

    //////////////////////
    // utils - links
    //////////////////////

    private deleteUnbindedLinks(): Promise<DeleteResult> {
        return this.userLinkRepository.delete({ user_id: IsNull() });
    }

    //////////////////////
    // utils - socials
    //////////////////////

    private deleteUnbindedSocials(): Promise<DeleteResult> {
        return this.userSocialRepository.delete({ user_id: IsNull() });
    }

    //////////////////////
    // utils - images
    //////////////////////

    private async buildImages(x: CUser, uploads: Express.Multer.File[]): Promise<void> {
        const ul = uploads.filter(u => u.fieldname === "images");

        for (let u of ul) {
            const res = await this.resizeService.resize(u, this.userImageResize);
            this.uploadToSupabase("images", `${this.folder}/${res.fileName}`, res.buffer, res.contentType);
            const originalname = Buffer.from(u.originalname, 'latin1').toString('utf8');
            const userImage = x.images.find(ui => ui.url === originalname);
            userImage.url = res.fileName;
        }
    }

    private async deleteUnbindedImagesOnUpdate(): Promise<void> { // при апдейте могут остаться лишние записи с зануленными user_id, удаляем и файлы, и сами записи
        const images = await this.userImageRepository.find({ where: { user_id: IsNull() } });
        const paths = images.map(image => `${this.folder}/${image.url}`);
        await this.userImageRepository.delete({ user_id: IsNull() });
        paths.length && this.deleteFromSupabase("images", paths);
    }

    private async deleteUnbindedImagesOnDelete(x: CUser): Promise<void> { // удаление одного пользователя - подчищаем файлы
        const paths = x.images.map(image => `${this.folder}/${image.url}`);
        paths.length && this.deleteFromSupabase("images", paths);
    }

    //////////////////////
    // utils - videos
    //////////////////////

    private async buildVideos(x: CUser, uploads: Express.Multer.File[]): Promise<void> {
        const ul = uploads.filter(u => u.fieldname === "videos");

        for (let u of ul) {
            const extension = this.appService.getFileExtensionByName(u.originalname);
            const fileName = `${Math.round(new Date().getTime()).toString()}.${extension}`;
            this.uploadToSupabase("videos", `${this.folder}/${fileName}`, u.buffer, u.mimetype);
            const originalname = Buffer.from(u.originalname, 'latin1').toString('utf8');
            const userVideo = x.videos.find(uv => uv.url === originalname);
            userVideo.url = fileName;
        }
    }

    private async deleteUnbindedVideosOnUpdate(): Promise<void> { // при апдейте могут остаться лишние записи с зануленными user_id, удаляем и файлы, и сами записи
        const videos = await this.userVideoRepository.find({ where: { user_id: IsNull() } });
        const paths = videos.map(video => `${this.folder}/${video.url}`);
        await this.userVideoRepository.delete({ user_id: IsNull() });
        paths.length && this.deleteFromSupabase("videos", paths);
    }

    private async deleteUnbindedVideosOnDelete(x: CUser): Promise<void> { // удаление одного пользователя - подчищаем файлы
        const paths = x.videos.map(video => `${this.folder}/${video.url}`);
        paths.length && this.deleteFromSupabase("videos", paths);
    }

    //////////////////////
    // utils - others
    //////////////////////

    private async buildOthers(x: CUser, uploads: Express.Multer.File[]): Promise<void> {
        const ul = uploads.filter(u => u.fieldname === "others");

        for (let u of ul) {
            const extension = this.appService.getFileExtensionByName(u.originalname);
            const fileName = `${Math.round(new Date().getTime()).toString()}.${extension}`;
            this.uploadToSupabase("others", `${this.folder}/${fileName}`, u.buffer, u.mimetype);
            const originalname = Buffer.from(u.originalname, 'latin1').toString('utf8');
            const userOther = x.others.find(uo => uo.url === originalname);
            userOther.url = fileName;
        }
    }

    private async deleteUnbindedOthersOnUpdate(): Promise<void> { // при апдейте могут остаться лишние записи с зануленными user_id, удаляем и файлы, и сами записи
        const others = await this.userOtherRepository.find({ where: { user_id: IsNull() } });
        const paths = others.map(other => `${this.folder}/${other.url}`);
        await this.userOtherRepository.delete({ user_id: IsNull() });
        paths.length && this.deleteFromSupabase("others", paths);
    }

    private async deleteUnbindedOthersOnDelete(x: CUser): Promise<void> { // удаление одного пользователя - подчищаем файлы
        const paths = x.others.map(other => `${this.folder}/${other.url}`);
        paths.length && this.deleteFromSupabase("others", paths);
    }

    ////////////////////
    // utils - rewards
    ////////////////////

    private async buildRewards(x: CUser, uploads: Express.Multer.File[]): Promise<void> {
        const ul = uploads.filter(u => u.fieldname === "rewards");

        for (let u of ul) {
            const res = await this.resizeService.resize(u, this.rewardResize);
            this.uploadToSupabase("images", `${this.folder}/${res.fileName}`, res.buffer, res.contentType);
            const originalname = Buffer.from(u.originalname, 'latin1').toString('utf8');
            const reward = x.athlet.rewards.find(r => r.img === originalname);
            reward.img = res.fileName;
        }
    }

    private async deleteUnbindedRewardsOnUpdate(x: CUser, old: CUser): Promise<void> {
        let paths = [];

        // при апдейте могут остаться лишние записи с зануленными athlet_id, такие записи удаляем, и отправляем их картинки в массив на удаление
        const rewards = await this.rewardRepository.find({ where: { athlet_id: IsNull() } });
        paths = [...paths, ...rewards.map(r => `${this.folder}/${r.img}`)];
        await this.rewardRepository.delete({ athlet_id: IsNull() });

        // также могут измениться картинки у старых записей, отправляем старые картинки в массив на удаление
        for (let oldReward of old.athlet.rewards) {
            const currentReward = x.athlet.rewards.find(r => r.id === oldReward.id);
            if (currentReward && currentReward.img !== oldReward.img && oldReward.img) {
                paths.push(`${this.folder}/${oldReward.img}`);
            }
        }

        // удаляем картинки
        paths.length && this.deleteFromSupabase("images", paths);
    }

    private async deleteUnbindedRewardsOnDelete(x: CUser): Promise<void> { // удаление одного пользователя - подчищаем файлы
        const paths = x.athlet.rewards.map(r => `${this.folder}/${r.img}`);
        paths.length && this.deleteFromSupabase("images", paths);
    }
}