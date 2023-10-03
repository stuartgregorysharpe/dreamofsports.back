export interface ICountryCreate {
    readonly code: string;
    readonly translations: ICountryTranslationCreate[];
}

export interface ICountryTranslationCreate {
    readonly lang_id: number;
    readonly name: string;
}
