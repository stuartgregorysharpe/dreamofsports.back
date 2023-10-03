export interface IEmployeeCreate {
    readonly img: string;
    readonly pos: number;
    readonly active: boolean;
    readonly translations: IEmployeeTranslationCreate[];
}

export interface IEmployeeTranslationCreate {
    readonly lang_id: number;
    readonly name: string;
    readonly post: string;
}
