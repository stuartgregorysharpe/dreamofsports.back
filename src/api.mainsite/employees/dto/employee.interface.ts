import { IMultilangable } from "src/model/multilangable.interface";

export interface IEmployee {
    readonly id: number;
    readonly name: IMultilangable;
    readonly post: IMultilangable;
    readonly img: string;
}
