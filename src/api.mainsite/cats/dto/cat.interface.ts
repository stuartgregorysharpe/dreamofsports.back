import { IMultilangable } from "src/model/multilangable.interface";

export interface ICat {
    id: number;
    slug?: string;
    name: IMultilangable;
    title?: IMultilangable;
    description?: IMultilangable;
    h1?: IMultilangable;
    // relations
    children?: ICat[];
    // helpers
    _level?: number;
    _shift?: string;
}
