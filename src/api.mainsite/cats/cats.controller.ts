import { Controller, Param, Post } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CCatsService } from "./cats.service";
import { IKeyValue } from "src/model/keyvalue.interface";
import { ICatSimple } from "./dto/cat.simple.interface";
import { ICat } from "./dto/cat.interface";

@Controller('api/mainsite/cats')
export class CCatsController {
    constructor (private catsService: CCatsService) {}        

    @Post("all-leavs")
    public allLeavs(): Promise<IResponse<IKeyValue<ICatSimple[]>>> {
        return this.catsService.allLeavs();
    }

    @Post("menu-foot")
    public menuFoot(): Promise<IResponse<IKeyValue<ICatSimple[]>>> {
        return this.catsService.menuFoot();
    }

    @Post("all")
    public all(): Promise<IResponse<ICat[]>> {
        return this.catsService.all();
    }

    @Post("one/:slug")
    public one(@Param("slug") slug: string): Promise<IResponse<ICat>> {
        return this.catsService.one(slug);
    }

    @Post("create/:name")
    public create(@Param("name") name: string): Promise<IResponse<ICat>> {
        return this.catsService.create(name);
    }
}
