export interface IPageUpdate {
    readonly id: number;
    readonly parent_id: number;
    readonly slug: string;
    readonly img: string;
    readonly pos: number;
    readonly active: boolean;
    readonly menumain: boolean;
    readonly menufoot: boolean;
    readonly defended: boolean;   
    readonly translations: IPageTranslationUpdate[];
    readonly words: IPageWordUpdate[];
}

export interface IPageTranslationUpdate {
    readonly id: number;
    readonly page_id: number;
    readonly lang_id: number;
    readonly name: string;
    readonly content: string;
    readonly title: string;
    readonly description: string;
    readonly h1: string;
}

export interface IPageWordUpdate {
    readonly id: number;
    readonly page_id: number;
    readonly pos: number;
    readonly mark: string;
    readonly note: string;
    readonly translations: IPageWordTranslationUpdate[];
}

export interface IPageWordTranslationUpdate {
    readonly id: number;
    readonly lang_id: number;
    readonly word_id: number;
    readonly text: string;
}
