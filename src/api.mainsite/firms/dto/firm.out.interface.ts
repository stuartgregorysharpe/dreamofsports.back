import { ICountry } from "src/api.mainsite/countries/dto/country.interface";
import { IMultilangable } from "src/model/multilangable.interface";

// "firm out" - объект для просмотра посетителями
export interface IFirmOut {
    id: number;
    img?: string;
    img_s: string;
    name: IMultilangable;
    branch?: IMultilangable;
    founder?: IMultilangable;
    reg_no?: string;
    reg_date?: string;
    reg_addr?: IMultilangable;    
    fact_addr?: IMultilangable;
    about?: IMultilangable;    
    // relations
    reg_country: ICountry;
    fact_country?: ICountry;
    phones?: IFirmOutPhone[];
    emails?: IFirmOutEmail[];
    links?: IFirmOutLink[];
    socials?: IFirmOutSocial[];
    images?: IFirmOutImage[];
    videos?: IFirmOutVideo[];
    others?: IFirmOutOther[]; 
}

export interface IFirmOutPhone {
    id: number;
    value: string;
}

export interface IFirmOutEmail {
    id: number;
    value: string;
}

export interface IFirmOutLink {
    id: number;
    value: string;
}

export interface IFirmOutSocial {
    id: number;
    value: string;
    img: string;
}

export interface IFirmOutImage {
    id: number;
    url: string;
}

export interface IFirmOutVideo {
    id: number;
    url: string;
}

export interface IFirmOutOther {
    id: number;
    url: string;
    name: string;
}
