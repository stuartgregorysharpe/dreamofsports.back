export interface IPaysystemUpdate {
    readonly id: number;
    readonly name: string;
    readonly pos: number;
    readonly active: boolean;
    readonly defended: boolean;
    readonly translations: IPaysystemTranslationUpdate[];
    readonly params: IPaysystemParamUpdate[];
}

export interface IPaysystemTranslationUpdate {
    readonly id: number;
    readonly paysystem_id: number;
    readonly lang_id: number;
    readonly title: string;
}

export interface IPaysystemParamUpdate {
    readonly id: number;
    readonly paysystem_id: number;
    readonly name: string;
    readonly value: string;
    readonly loadable: boolean;
    readonly defended: boolean;
}
