import { TGender } from "src/model/entities/athlet";
import { TUserType } from "src/model/entities/user";

export interface IUserCreate {
    readonly lang_id: number;
    readonly type: TUserType;
    readonly email: string;
    readonly password: string;
    readonly active: boolean;
    readonly filled: boolean;
    readonly payed_at: string;
    readonly payed_until: string;
    readonly created_at: string;
    readonly updated_at: string;
    // relations
    readonly athlet: IAthletCreate;
    readonly firm: IFirmCreate;
    readonly phones: IUserPhoneCreate[];
    readonly emails: IUserEmailCreate[];
    readonly links: IUserLinkCreate[];
    readonly socials: IUserSocialCreate[];
    readonly images: IUserImageCreate[];
    readonly videos: IUserVideoCreate[];
    readonly others: IUserOtherCreate[];
    readonly rewards: IRewardCreate[];
}

export interface IAthletCreate {
    readonly cat_id: number;
    readonly country_id: number;
    readonly img: string;
    readonly img_s: string;
    readonly birthdate: string;
    readonly gender: TGender;
    readonly height_meter: number;
    readonly height_foot: number;
    readonly weight_kg: number;
    readonly weight_pound: number;
    readonly no: string; 
    readonly translations: IAthletTranslationCreate[];
}

export interface IAthletTranslationCreate {
    readonly lang_id: number;
    readonly firstname: string;
    readonly lastname: string;
    readonly region: string;
    readonly city: string;
    readonly bio: string;
    readonly team: string; 
    readonly role: string;
}

export interface IFirmCreate {
    readonly img: string;
    readonly img_s: string;
    readonly reg_no: string;
    readonly reg_date: string;
    readonly reg_country_id: number;
    readonly fact_country_id: number;
    readonly translations: IFirmTranslationCreate[];
}

export interface IFirmTranslationCreate {
    readonly lang_id: number;
    readonly name: string;
    readonly branch: string;
    readonly founder: string;
    readonly reg_addr: string;
    readonly fact_addr: string;
    readonly about: string;
}

export interface IUserPhoneCreate {
    readonly value: string;
    readonly pos: number;
}

export interface IUserEmailCreate {
    readonly value: string;
    readonly pos: number;
}

export interface IUserLinkCreate {
    readonly value: string;
    readonly pos: number;
}

export interface IUserSocialCreate {
    readonly social_id: number;
    readonly value: string;
    readonly pos: number;
}

export interface IUserImageCreate {
    readonly url: string;
    readonly pos: number;
}

export interface IUserVideoCreate {
    readonly url: string;
    readonly pos: number;
}

export interface IUserOtherCreate {
    readonly name: string;
    readonly url: string;
    readonly pos: number;
}

export interface IRewardCreate {
    readonly date: string;
    readonly img: string;
    readonly translations: IRewardTranslationCreate[];
}

export interface IRewardTranslationCreate {
    readonly lang_id: number;
    readonly name: string;
}
