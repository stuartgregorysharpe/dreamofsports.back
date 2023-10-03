export interface IArticleCreate {
    readonly cat_id: number;
    readonly slug: string;
    readonly date: string;
    readonly img: string;
    readonly active: boolean;
    readonly in_gal: boolean;
    readonly translations: IArticleTranslationCreate[];
}

export interface IArticleTranslationCreate {
    readonly lang_id: number;
    readonly name: string;
    readonly content: string;
    readonly contentshort: string;
    readonly title: string;
    readonly description: string;
    readonly h1: string;
}
