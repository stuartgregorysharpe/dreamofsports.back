export interface IEmployeeUpdate {
    readonly id: number;
    readonly img: string;
    readonly pos: number;
    readonly active: boolean;
    readonly defended: boolean;
    readonly translations: IEmployeeTranslationUpdate[];
}

export interface IEmployeeTranslationUpdate {
    readonly id: number;
    readonly employee_id: number;
    readonly lang_id: number;
    readonly name: string;
    readonly post: string;
}
