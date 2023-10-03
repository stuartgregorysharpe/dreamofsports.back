export interface IArticleCatUpdate {
    readonly id: number;
    readonly slug: string;
    readonly pos: number;
    readonly active: boolean;
    readonly defended: boolean;
    readonly translations: IArticleCatTranslationUpdate[];
}

export interface IArticleCatTranslationUpdate {
    readonly id: number;
    readonly lang_id: number;
    readonly cat_id: number;
    readonly name: string;
    readonly title: string;
    readonly description: string;
    readonly h1: string;
}
