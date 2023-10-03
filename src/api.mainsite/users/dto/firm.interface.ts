export interface IFirm {
    readonly id: number;
    readonly user_id: number;
    readonly img: string;
    readonly img_s: string;
    readonly reg_no: string;
    readonly reg_date: string;
    readonly reg_country_id: number;
    readonly fact_country_id: number;
    // relations
    readonly translations: IFirmTranslation[];
}

export interface IFirmTranslation {
    readonly id: number;
    readonly lang_id: number;
    readonly firm_id: number;
    readonly name: string;
    readonly branch: string;
    readonly founder: string;
    readonly reg_addr: string;
    readonly fact_addr: string;
    readonly about: string;
}
