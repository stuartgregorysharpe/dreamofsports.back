import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CErrorsService } from "src/common/services/errors.service";
import { CChatMessage } from "src/model/entities/chat.message";
import { Repository } from "typeorm";
import { IChatMessageCreate } from "./dto/chat.message.create.interface";
import { IResponse } from "src/model/dto/response.interface";
import { CUser } from "src/model/entities/user";
import { IGetList } from "src/model/dto/getlist.interface";
import { CChat } from "src/model/entities/chat";
import { CAppService } from "src/common/services/app.service";
import { CSocketGateway } from "src/socket/socket.gateway";
import { CLang } from "src/model/entities/lang";
import { CChatsService } from "../chats/chats.service";
import { IChat } from "../chats/dto/chat.interface";

@Injectable()
export class CChatMessagesService {
    constructor(
        @InjectRepository(CChatMessage) private chatMessageRepository: Repository<CChatMessage>,
        @InjectRepository(CChat) private chatRepository: Repository<CChat>,
        @InjectRepository(CUser) private userRepository: Repository<CUser>,
        @InjectRepository(CLang) private langRepository: Repository<CLang>,
        private errorsService: CErrorsService,
        private appService: CAppService,
        private socketGateway: CSocketGateway,
        private chatsService: CChatsService,
    ) {}

    public async chunk(visitor_id: number, dto: IGetList): Promise<IResponse<CChatMessage[]>> {
        try {
            const visitor = await this.userRepository.findOne({where: {id: visitor_id, active: true}});

            // if (!visitor || !visitor.payed_until || visitor.payed_until.getTime() < new Date().getTime()) {
            //     return {statusCode: 401, error: "only paid"};
            // }

            const filter = this.buildFilter(dto.filter);
            const sortBy = `messages.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            const data = await this.chatMessageRepository
                .createQueryBuilder("messages")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const elementsQuantity = await this.chatMessageRepository
                .createQueryBuilder("messages")                
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CChatMessagesService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(visitor_id: number, dto: IChatMessageCreate): Promise<IResponse<void>> {
        try {
            const visitor = await this.userRepository.findOne({where: {id: visitor_id, active: true}});

            // if (!visitor || !visitor.payed_until || visitor.payed_until.getTime() < new Date().getTime()) {
            //     return {statusCode: 401, error: "only paid"};
            // }

            const chat = await this.chatRepository.findOne({where: {id: dto.chat_id}, relations: ["user1", "user1.athlet", "user1.athlet.translations", "user1.firm", "user1.firm.translations", "user2", "user2.athlet", "user2.athlet.translations", "user2.firm", "user2.firm.translations"]});

            if (!chat) {
                return {statusCode: 404, error: "chat not found"};
            }

            // save message
            let message = this.chatMessageRepository.create({
                user_id: visitor_id,
                chat_id: dto.chat_id,
                content: dto.content.replace(/\n/g, '<br>'),
            });
            await this.chatMessageRepository.save(message);
            message = await this.chatMessageRepository.findOneBy({id: message.id}); // reload to decrypt
            
            // update chat
            chat.messaged_at = new Date();

            if (visitor_id === chat.user1_id) {
                chat.user2_unread++;
                chat.user2_active = true;
            } else {
                chat.user1_unread++;
                chat.user1_active = true;
            }            

            await this.chatRepository.save(chat);

            // broadcast updates
            await this.broadcast(message, chat);
            return {statusCode: 201};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CChatMessagesService.create", err);
            return {statusCode: 500, error};
        }
    }    

    ////////////////
    // utils
    ////////////////

    private buildFilter(dtoFilter: any): string {
        let filter = "TRUE";

        if (dtoFilter.chat_id !== undefined) {
            filter += ` AND messages.chat_id = '${dtoFilter.chat_id}'`;
        }

        if (dtoFilter.created_at_less !== undefined) {
            filter += ` AND messages.created_at <= '${this.appService.mysqlDate(new Date(dtoFilter.created_at_less), "datetime")}'`;
        }

        return filter;
    }

    private async broadcast(message: CChatMessage, chat: CChat): Promise<void> {
        const langs = await this.langRepository.find({where: {active: true}});
        const chat4user1 = this.chatsService.buildChat(chat, langs, chat.user1_id);
        const chat4user2 = this.chatsService.buildChat(chat, langs, chat.user2_id);
        this.socketGateway.broadcast({event: `new-message-for-user-${chat.user1_id}`, data: message});
        this.socketGateway.broadcast({event: `new-message-for-user-${chat.user2_id}`, data: message});
        this.socketGateway.broadcast({event: `chat-update-for-user-${chat.user1_id}`, data: chat4user1});
        this.socketGateway.broadcast({event: `chat-update-for-user-${chat.user2_id}`, data: chat4user2});
    }
}