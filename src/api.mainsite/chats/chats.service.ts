import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CErrorsService } from "src/common/services/errors.service";
import { IResponse } from "src/model/dto/response.interface";
import { CChat } from "src/model/entities/chat";
import { CUser } from "src/model/entities/user";
import { Repository } from "typeorm";
import { IChat } from "./dto/chat.interface";
import { CLang } from "src/model/entities/lang";
import { CSocketGateway } from "src/socket/socket.gateway";
import { CBan } from "src/model/entities/ban";

@Injectable()
export class CChatsService {
    constructor(
        @InjectRepository(CChat) private chatRepository: Repository<CChat>,
        @InjectRepository(CUser) private userRepository: Repository<CUser>,
        @InjectRepository(CLang) private langRepository: Repository<CLang>,
        @InjectRepository(CBan) private banRepository: Repository<CBan>,
        private socketGateway: CSocketGateway,
        private errorsService: CErrorsService,
    ) {}

    public async create(visitor_id: number, companion_id: number): Promise<IResponse<number>> {
        try {
            if (!visitor_id) {
                return {statusCode: 401, error: "only for logged in"};
            }

            if (visitor_id === companion_id) {
                return {statusCode: 409, error: "with myself?"};
            }

            const user1 = await this.userRepository.findOne({where: {id: visitor_id, active: true}});

            // if (!user1 || !user1.payed_until || user1.payed_until.getTime() < new Date().getTime()) {
            //     return {statusCode: 401, error: "only paid"};
            // }

            const user2 = await this.userRepository.findOne({where: {id: companion_id, active: true}});

            if (!user2) {
                return {statusCode: 404, error: "companion not found"};
            }

            // собеседник заблокировал данного посетителя
            let ban = await this.banRepository.findOne({where: {user_id: companion_id, banned_id: visitor_id}});

            if (ban) {
                return {statusCode: 4011, "error": "you have been banned by this user"};
            }

            // данный посетитель заблокировал собеседника
            ban = await this.banRepository.findOne({where: {user_id: visitor_id, banned_id: companion_id}});

            if (ban) {
                return {statusCode: 4012, "error": "you banned this user"};
            }

            let chat = await this.chatRepository.findOne({where: [{user1_id: visitor_id, user2_id: companion_id}, {user1_id: companion_id, user2_id: visitor_id}]});
            
            // чат между этими юзерами уже существует                
            if (chat) { 
                const field = visitor_id === chat.user1_id ? "user1_active" : "user2_active";
                chat[field] = true;
                await this.chatRepository.save(chat); // активируем, если вдруг чат был деактивирован кем-либо из пользователей
                return {statusCode: 200, data: chat.id};
            }

            // новый чат
            chat = this.chatRepository.create({user1_id: visitor_id, user2_id: companion_id, user1_active: true});
            await this.chatRepository.save(chat);
            return {statusCode: 201, data: chat.id};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CChatsService.create", err);
            return {statusCode: 500, error};
        }
    }

    public async all(visitor_id: number): Promise<IResponse<IChat[]>> {
        try {
            const visitor = await this.userRepository.findOne({where: {id: visitor_id, active: true}});

            // if (!visitor || !visitor.payed_until || visitor.payed_until.getTime() < new Date().getTime()) {
            //     return {statusCode: 401, error: "only paid"};
            // }

            const chats = await this.chatRepository.find({where: [{user1_id: visitor_id, user1_active: true}, {user2_id: visitor_id, user2_active: true}], relations: ["user1", "user1.athlet", "user1.athlet.translations", "user1.firm", "user1.firm.translations", "user2", "user2.athlet", "user2.athlet.translations", "user2.firm", "user2.firm.translations"], order: {messaged_at: -1}});
            const langs = await this.langRepository.find({where: {active: true}});
            const data = chats.map(c => this.buildChat(c, langs, visitor_id));
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CChatsService.all", err);
            return {statusCode: 500, error};
        }
    }

    public async one(visitor_id: number, id: number): Promise<IResponse<IChat>> {
        try {
            const visitor = await this.userRepository.findOne({where: {id: visitor_id, active: true}});

            // if (!visitor || !visitor.payed_until || visitor.payed_until.getTime() < new Date().getTime()) {
            //     return {statusCode: 401, error: "only paid"};
            // }

            const chat = await this.chatRepository.findOne({where: [{id, user1_id: visitor_id, user1_active: true}, {id, user2_id: visitor_id, user2_active: true}], relations: ["user1", "user1.athlet", "user1.athlet.translations", "user1.firm", "user1.firm.translations", "user2", "user2.athlet", "user2.athlet.translations", "user2.firm", "user2.firm.translations"]});

            if (!chat) {
                return {statusCode: 404, error: "chat not found"};
            }

            const langs = await this.langRepository.find({where: {active: true}});
            const data = this.buildChat(chat, langs, visitor_id);
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CChatsService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async resetUnread(visitor_id: number, id: number): Promise<IResponse<void>> {
        try {
            const chat = await this.chatRepository.findOneBy({id});

            if (!chat) {
                return {statusCode: 404, error: "chat not found"};
            }

            const field = visitor_id === chat.user1_id ? "user1_unread" : "user2_unread";
            chat[field] = 0;
            await this.chatRepository.save(chat);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CChatsService.resetUnread", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(visitor_id: number, id: number): Promise<IResponse<void>> {
        try {
            const chat = await this.chatRepository.findOneBy({id});

            if (!chat) {
                return {statusCode: 404, error: "chat not found"};
            }

            const field = visitor_id === chat.user1_id ? "user1_active" : "user2_active";
            chat[field] = false;
            await this.chatRepository.save(chat);
            this.socketGateway.broadcast({event: `chat-delete-for-user-${visitor_id}`, data: chat.id});
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CChatsService.delete", err);
            return {statusCode: 500, error};
        }
    }

    public async deleteAndBan(visitor_id: number, id: number): Promise<IResponse<void>> {
        try {
            const chat = await this.chatRepository.findOneBy({id});

            if (!chat) {
                return {statusCode: 404, error: "chat not found"};
            }

            // update chat
            chat.user1_active = false;
            chat.user2_active = false;
            await this.chatRepository.save(chat);
            // broadcast updates
            this.socketGateway.broadcast({event: `chat-delete-for-user-${chat.user1_id}`, data: chat.id});
            this.socketGateway.broadcast({event: `chat-delete-for-user-${chat.user2_id}`, data: chat.id});
            // ban user
            const banned_id = visitor_id === chat.user1_id ? chat.user2_id : chat.user1_id;
            let ban = await this.banRepository.findOne({where: {user_id: visitor_id, banned_id}});

            if (!ban) {
                ban = this.banRepository.create({user_id: visitor_id, banned_id});
                await this.banRepository.save(ban);
            }
            
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CChatsService.deleteAndBan", err);
            return {statusCode: 500, error};
        }
    }

    public async unBan(visitor_id: number, banned_id: number): Promise<IResponse<void>> {
        try {
            await this.banRepository.delete({user_id: visitor_id, banned_id});
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CChatsService.unBan", err);
            return {statusCode: 500, error};
        }
    }

    //////////////////
    // utils
    //////////////////

    public buildChat(chat: CChat, langs: CLang[], visitor_id: number): IChat {
        const data: IChat = {
            id: chat.id,
            name: {},
            shortname: {},
            img: visitor_id === chat.user1_id ? 
                (chat.user2.type === "athlet" ? chat.user2.athlet.img_s : chat.user2.firm.img_s) : 
                (chat.user1.type === "athlet" ? chat.user1.athlet.img_s : chat.user1.firm.img_s),
            unread: visitor_id === chat.user1_id ? 
                chat.user1_unread : 
                chat.user2_unread,
        };

        for (let l of langs) {
            const user = visitor_id === chat.user1_id ? chat.user2 : chat.user1;

            if (user.type === "athlet") {
                const t = user.athlet.translations.find(t => t.lang_id === l.id);
                const nameFrags: string[] = [];
                const shortnameFrags: string[] = [];

                if (t.firstname) {
                    nameFrags.push(t.firstname);
                    shortnameFrags.push(t.firstname[0]);
                }

                if (t.lastname) {
                    nameFrags.push(t.lastname);
                    shortnameFrags.push(t.lastname[0]);
                }
                
                data.name[l.slug] = nameFrags.join(" ");
                data.shortname[l.slug] = shortnameFrags.join("");
            } else {
                const t = user.firm.translations.find(t => t.lang_id === l.id);
                data.name[l.slug] = t.name;
                data.shortname[l.slug] = t.name?.[0];
            }            
        }

        return data;
    }
}