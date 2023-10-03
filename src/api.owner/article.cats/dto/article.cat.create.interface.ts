export interface IArticleCatCreate {
    readonly slug: string;
    readonly pos: number;
    readonly active: boolean;
    readonly translations: IArticleCatTranslationCreate[];
}

export interface IArticleCatTranslationCreate {
    readonly lang_id: number;
    readonly name: string;
    readonly title: string;
    readonly description: string;
    readonly h1: string;
}
