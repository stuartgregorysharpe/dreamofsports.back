export interface ICountryUpdate {
    readonly id: number;
    readonly code: string;
    readonly defended: boolean;
    readonly translations: ICountryTranslationUpdate[];
}

export interface ICountryTranslationUpdate {
    readonly id: number;
    readonly country_id: number;
    readonly lang_id: number;
    readonly name: string;
}
