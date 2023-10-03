import { IMultilangable } from "src/model/multilangable.interface";

export interface IPaysystem {
    readonly id: number;
    readonly name: string;
    readonly title: IMultilangable;   
    readonly params: IPaysystemParam[]; 
}

export interface IPaysystemParam {
    readonly id: number;
    readonly name: string;
    readonly value: string;
}