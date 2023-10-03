export interface IPageCreate {
    readonly parent_id: number;
    readonly slug: string;
    readonly img: string;
    readonly pos: number;
    readonly active: boolean;
    readonly menumain: boolean;
    readonly menufoot: boolean;
    readonly translations: IPageTranslationCreate[];
    readonly words: IPageWordCreate[];
}

export interface IPageTranslationCreate {
    readonly lang_id: number;
    readonly name: string;
    readonly content: string;
    readonly title: string;
    readonly description: string;
    readonly h1: string;
}

export interface IPageWordCreate {
    readonly pos: number;
    readonly mark: string;
    readonly note: string;
    readonly translations: IPageWordTranslationCreate[];
}

export interface IPageWordTranslationCreate {
    readonly lang_id: number;
    readonly text: string;
}
