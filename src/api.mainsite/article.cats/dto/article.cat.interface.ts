import { IMultilangable } from "src/model/multilangable.interface";

export interface IArticleCat {
    readonly id: number;
    readonly slug?: string;
    readonly name: IMultilangable;
    readonly title?: IMultilangable;
    readonly description?: IMultilangable;
    readonly h1?: IMultilangable;
}
