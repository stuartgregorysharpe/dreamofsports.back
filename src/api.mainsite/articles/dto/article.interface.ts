import { IArticleCat } from "src/api.mainsite/article.cats/dto/article.cat.interface";
import { IMultilangable } from "src/model/multilangable.interface";

export interface IArticle {
    readonly id: number;
    readonly slug?: string;
    readonly date: Date;
    readonly img?: string;
    readonly img_s?: string;
    readonly name: IMultilangable;
    readonly content?: IMultilangable;
    readonly contentshort?: IMultilangable;
    readonly title?: IMultilangable;
    readonly description?: IMultilangable;
    readonly h1?: IMultilangable;
    // relations
    readonly cat: IArticleCat;
}
