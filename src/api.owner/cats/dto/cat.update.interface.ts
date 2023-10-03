export interface ICatUpdate {
    readonly id: number;
    readonly parent_id: number;
    readonly slug: string;
    readonly pos: number;
    readonly menufoot: boolean;
    readonly defended: boolean;   
    readonly translations: ICatTranslationUpdate[];
}

export interface ICatTranslationUpdate {
    readonly id: number;
    readonly cat_id: number;
    readonly lang_id: number;
    readonly name: string;
    readonly title: string;
    readonly description: string;
    readonly h1: string;
}
