export interface ITariffCreate {
    readonly price: number;
    readonly duration: number;
    readonly apple_pid: string;
    readonly google_pid: string;
    readonly np_compatible: boolean;
    readonly active: boolean;
    readonly translations: ITariffTranslationCreate[];
}

export interface ITariffTranslationCreate {
    readonly lang_id: number;
    readonly name: string;
}
