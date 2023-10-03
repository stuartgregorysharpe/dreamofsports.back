import { IMultilangable } from "src/model/multilangable.interface";

export interface IChat {
    id: number;
    name: IMultilangable;
    shortname: IMultilangable;
    img: string;
    unread: number;
}
