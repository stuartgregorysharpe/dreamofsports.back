export interface ICatCreate {
    readonly parent_id: number;
    readonly slug: string;
    readonly pos: number;
    readonly menufoot: boolean;
    readonly translations: ICatTranslationCreate[];
}

export interface ICatTranslationCreate {
    readonly lang_id: number;
    readonly name: string;
    readonly title: string;
    readonly description: string;
    readonly h1: string;
}
