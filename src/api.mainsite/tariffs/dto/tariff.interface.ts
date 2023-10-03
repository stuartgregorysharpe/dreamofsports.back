import { IMultilangable } from "src/model/multilangable.interface";

export interface ITariff {
    readonly id: number;
    readonly name: IMultilangable;
    readonly price: number;
    readonly duration: number;
    readonly apple_pid: string;
    readonly google_pid: string;
    readonly perday: number;
    readonly np_compatible: boolean;
}
