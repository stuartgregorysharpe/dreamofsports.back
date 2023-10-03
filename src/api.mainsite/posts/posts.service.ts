import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CErrorsService } from "src/common/services/errors.service";
import { Repository } from "typeorm";
import { IGetList } from "src/model/dto/getlist.interface";
import { IResponse } from "src/model/dto/response.interface";
import { CAppService } from "src/common/services/app.service";
import { CPost } from "src/model/entities/posts";
import { IPost } from "./dto/post.interface";
import { CUser } from "src/model/entities/user";
import { CPostAttachment } from "src/model/entities/posts.attachment";
import { IPostAttachment } from "../post.attachment/dto/post.attachment.interface";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { CSupabaseService } from "src/common/services/supabase/supabase.service";
import { CResizeService } from "src/common/services/resize.service";
import { UUID } from "typeorm/driver/mongodb/bson.typings";
import { CPostComment } from "src/model/entities/posts.comment";
import { IPostComment } from "../post.attachment/dto/post.comment.interface";
import { CPostLike } from "src/model/entities/posts.like";

@Injectable()
export class CPostService {
    private folder: string = "post";
    private attachmentImageResize: number = 1000;
    constructor(
        @InjectRepository(CPost) private postRepository: Repository<CPost>,
        @InjectRepository(CPostComment) private commentRepository: Repository<CPostComment>,
        @InjectRepository(CPostLike) private likeRepository: Repository<CPostLike>,
        private errorsService: CErrorsService,
        private appService: CAppService,
        private resizeService: CResizeService,
        private supabaseService: CSupabaseService,
    ) { }

    public async create(user_id: number, fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<IPost>> {
        try {
            const dto = JSON.parse(fd.data) as IPost;
            const x = this.postRepository.create(dto);
            await this.buildAttachment(x, uploads);
            x.user_id = user_id;
            await this.postRepository.save(x);
            return { statusCode: 200, data: x };
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CPostService.create", err);
            return { statusCode: 500, error };
        }
    }

    private async buildAttachment(x: CPost, uploads: Express.Multer.File[]): Promise<void> {
        const ul = uploads.filter(u => u.fieldname === "attachment");

        for (let u of ul) {
            const extension = this.appService.getFileExtensionByName(u.originalname);
            const fileName = `${Math.round(new Date().getTime()).toString()}_${ul.indexOf(u)}.${extension}`;
            this.uploadToSupabase("attachment", `${this.folder}/${fileName}`, u.buffer, u.mimetype);
            const originalname = Buffer.from(u.originalname, 'latin1').toString('utf8');
            const attachment = x.attachment.find(uv => uv.file === originalname);
            attachment.file = fileName;
        }
    }

    // в клиентской части мы не можем ждать долгой загрузки на supabase, поэтому используем процедуру, обернутую в отдельный try/catch
    private async uploadToSupabase(bucket: string, path: string, file: Buffer, contentType: string): Promise<void> {
        try {
            await this.supabaseService.uploadFile(bucket, path, file, contentType);
        } catch (err) {
            await this.errorsService.log("api.mainsite/CPostService.uploadToSupabase", err);
        }
    }

    public async chunk(dto: IGetList): Promise<IResponse<IPost[]>> {
        try {
            const filter = this.buildFilter(dto.filter);
            const sortBy = `posts.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            const posts = await this.postRepository
                .createQueryBuilder("posts")
                .leftJoinAndSelect('posts.attachment', "post_attachment")
                .leftJoinAndSelect("posts.user", "user")
                .leftJoinAndSelect('user.followers', "user_follow")
                .leftJoinAndSelect("user.athlet", "athlet")
                .leftJoinAndSelect("athlet.translations", "athlet_translations")
                .leftJoinAndSelect("athlet.rewards", "rewards")
                .leftJoinAndSelect("rewards.translations", "rewards_translations")
                .leftJoinAndSelect("user.firm", "firm")
                .leftJoinAndSelect("firm.translations", "firm_translations")
                .leftJoinAndSelect("posts.likes", "post_like")
                .leftJoinAndSelect("user.phones", "phones")
                .leftJoinAndSelect("user.emails", "emails")
                .leftJoinAndSelect("user.links", "links")
                .leftJoinAndSelect("user.socials", "socials")
                .leftJoinAndSelect("user.images", "images")
                .leftJoinAndSelect("user.videos", "videos")
                .leftJoinAndSelect("user.others", "others")
                .where(filter)
                .orderBy({ [sortBy]: sortDir })
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const elementsQuantity = await this.postRepository
                .createQueryBuilder("posts")
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return { statusCode: 200, data: posts, elementsQuantity, pagesQuantity };
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CPostService.chunk", err);
            return { statusCode: 500, error };
        }
    }

    public async one(id: number): Promise<IResponse<IPost>> {
        try {
            const post = await this.postRepository.findOne({ where: { id, active: true }, relations: ["attachment"] });

            if (!post) {
                return { statusCode: 404, error: "post not found" };
            }

            const data: IPost = {
                id: post.id,
                content: post.content,
                user: this.buildUserData(post.user),
                attachment: this.buildAttachmentData(post.attachment),
                comments: this.buildCommentData(post.comments)
            }

            return { statusCode: 200, data };
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CPostService.one", err);
            return { statusCode: 500, error };
        }
    }

    private buildUserData(x: CUser) {
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

    private buildAttachmentData(attachment: CPostAttachment[]) {
        const data: IPostAttachment[] = attachment.map((a) => {
            return {
                id: a.id,
                file: a.file,
            }
        });

        return data;
    }

    private buildCommentData(comment: CPostComment[]) {
        const data: IPostComment[] = comment.map((a) => {
            return {
                id: a.id,
                content: a.content,
            }
        });

        return data;
    }

    private buildFilter(dtoFilter: any): string {
        let filter = "posts.active = TRUE";

        // if (dtoFilter.date_wo_time) { // приходит как бы дата с временем 00:00:00 по поясу пользователя, но уже в UTC
        //     filter += ` AND (posts.date >= '${dtoFilter.date_wo_time}' AND posts.date < ('${dtoFilter.date_wo_time}' + INTERVAL 1 DAY))`;
        // }

        return filter;
    }

    public async getComments(post_id: number): Promise<IResponse<IPostComment[]>> {
        try {
            const data = await this.commentRepository.createQueryBuilder("post_comment")
                .leftJoinAndSelect("post_comment.user", "comment_user")
                .leftJoinAndSelect("comment_user.firm", "comment_firm")
                .leftJoinAndSelect("comment_firm.translations", "comment_firm_translations")
                .leftJoinAndSelect("comment_user.athlet", "comment_athlet")
                .leftJoinAndSelect("comment_athlet.translations", "comment_athlet_translations")
                .where({ post_id: post_id })
                .getMany();
            return { statusCode: 200, data: data };
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CPostService.comment", err);
            return { statusCode: 500, error };
        }
    }

    public async comment(user_id: number, post_id: number, fd: IPostComment): Promise<IResponse<IPostComment>> {
        try {
            const x = this.commentRepository.create(fd);
            x.user_id = user_id;
            x.post_id = post_id;
            await this.commentRepository.save(x);
            return { statusCode: 200, data: x };
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CPostService.comment", err);
            return { statusCode: 500, error };
        }
    }

    public async toggleLike(user_id: number, post_id: number, type: string): Promise<IResponse<boolean>> {
        try {
            const x = await this.likeRepository.findOne({ where: { post_id: post_id, user_id: user_id, type: type } });
            if (!x) {
                const t = this.likeRepository.create({
                    user_id, post_id, type
                })
                await this.likeRepository.save(t);
                return { statusCode: 200, data: true };
            } else {
                this.likeRepository.delete(x.id);
                return { statusCode: 200, data: false };
            }
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CPostService.toggleLike", err);
            return { statusCode: 500, error };
        }
    }

    public async delete(user_id: number, post_id: number, type: string): Promise<IResponse<boolean>> {
        try {
            const x = await this.postRepository.findOne({ where: { id: post_id, user_id: user_id } });
            if (!!x) {
                this.postRepository.delete(x.id);
                return { statusCode: 200, data: true };
            } else {
                return { statusCode: 200, data: false };
            }
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CPostService.toggleLike", err);
            return { statusCode: 500, error };
        }
    }

    public async ifLike(user_id: number, post_id: number, type: string): Promise<IResponse<boolean>> {
        console.log("iflike", user_id, post_id);
        try {
            const x = await this.likeRepository.findOne({ where: { post_id: post_id, user_id: user_id, type: type } });
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
}