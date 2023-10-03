import { Controller, Param, Post } from "@nestjs/common";
import { IResponse } from "src/model/dto/response.interface";
import { CArticleCatsService } from "./article.cats.service";
import { IArticleCat } from "./dto/article.cat.interface";

@Controller('api/mainsite/article-cats')
export class CArticleCatsController {
    constructor (private articleCatsService: CArticleCatsService) {}
    
    @Post("all")
    public all(): Promise<IResponse<IArticleCat[]>> {
        return this.articleCatsService.all();
    } 

    @Post("one/:slug")
    public one(@Param("slug") slug: string): Promise<IResponse<IArticleCat>> {
        return this.articleCatsService.one(slug);
    }
}
