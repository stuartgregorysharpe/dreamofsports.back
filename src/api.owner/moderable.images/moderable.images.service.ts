import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CErrorsService } from "src/common/services/errors.service";
import { CSupabaseService } from "src/common/services/supabase/supabase.service";
import { IGetList } from "src/model/dto/getlist.interface";
import { IResponse } from "src/model/dto/response.interface";
import { CUser } from "src/model/entities/user";
import { Repository } from "typeorm";
import { IModerableImage } from "./dto/moderable.image.interface";

@Injectable()
export class CModerableImagesService {
    constructor(
        @InjectRepository(CUser) private userRepository: Repository<CUser>,
        private errorsService: CErrorsService,
        private supabaseService: CSupabaseService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<IModerableImage[]>> {
        try {
            const files = await this.supabaseService.folderChunk("images", "users", dto);
            const elementsQuantity  = await this.supabaseService.folderLength("images", "users");
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            const data: IModerableImage[] = [];
                        
            for (let file of files) {
                const fileName = file.path_tokens[1];
                const filter = `athlet.img='${fileName}' OR athlet.img_s='${fileName}' OR firm.img='${fileName}' OR firm.img_s='${fileName}' OR images.url='${fileName}' OR rewards.img='${fileName}'`;
                const user = await this.userRepository
                    .createQueryBuilder("user")
                    .leftJoin("user.athlet", "athlet")
                    .leftJoin("athlet.rewards", "rewards")
                    .leftJoin("user.firm", "firm")
                    .leftJoin("user.images", "images")                    
                    .where(filter)
                    .getOne();                
                data.push({url: fileName, user_id: user?.id, user_email: user?.email, created_at: file.created_at}); // теоретически могут быть и без юзеров, если руками что-то удаляли, все равно включаем такие картинки, т.к. иначе будет разлет в количестве
            }

            return {statusCode: 200, data, elementsQuantity, pagesQuantity};            
        } catch (err) {
            const error = await this.errorsService.log("api.owner/CModerableImagesService.chunk", err);
            return {statusCode: 500, error};
        }
    }
}