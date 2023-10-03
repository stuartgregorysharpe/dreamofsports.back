export interface ITariffUpdate {
    readonly id: number;
    readonly price: number;
    readonly duration: number;
    readonly apple_pid: string;
    readonly google_pid: string;
    readonly np_compatible: boolean;
    readonly active: boolean;
    readonly defended: boolean;
    readonly translations: ITariffTranslationUpdate[];
}

export interface ITariffTranslationUpdate {
    readonly id: number;
    readonly tariff_id: number;
    readonly lang_id: number;
    readonly name: string;
}
