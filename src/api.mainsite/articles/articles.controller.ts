import { Body, Controller, Param, Post } from "@nestjs/common";
import { CArticlesService } from "./articles.service";
import { IArticle } from "./dto/article.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { IResponse } from "src/model/dto/response.interface";

@Controller('api/mainsite/articles')
export class CArticlesController {
    constructor (private articlesService: CArticlesService) {}
    
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<IArticle[]>> {
        return this.articlesService.chunk(dto);
    }

    @Post("one/:slug")
    public one(@Param("slug") slug: string): Promise<IResponse<IArticle>> {
        return this.articlesService.one(slug);
    }    
}
