export interface IPaysystemCreate {
    readonly name: string;
    readonly pos: number;
    readonly active: boolean;
    readonly translations: IPaysystemTranslationCreate[];
    readonly params: IPaysystemParamCreate[];
}

export interface IPaysystemTranslationCreate {
    readonly lang_id: number;
    readonly title: string;
}

export interface IPaysystemParamCreate {
    readonly name: string;
    readonly value: string;
    readonly loadable: boolean;
}
