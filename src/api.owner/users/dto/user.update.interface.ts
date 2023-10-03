import { TGender } from "src/model/entities/athlet";
import { TUserType } from "src/model/entities/user";

export interface IUserUpdate {
    readonly id: number;
    readonly lang_id: number;
    readonly type: TUserType;
    readonly email: string;
    readonly password: string;
    readonly active: boolean;
    readonly filled: boolean;
    readonly payed_at: string;
    readonly payed_until: string;
    readonly created_at: string;
    readonly defended: boolean;
    // relations
    readonly athlet: IAthletUpdate;
    readonly firm: IFirmUpdate;
    readonly phones: IUserPhoneUpdate[];
    readonly emails: IUserEmailUpdate[];
    readonly links: IUserLinkUpdate[];
    readonly socials: IUserSocialUpdate[];
    readonly images: IUserImageUpdate[];
    readonly videos: IUserVideoUpdate[];
    readonly others: IUserOtherUpdate[];
    readonly rewards: IRewardUpdate[];
}

export interface IAthletUpdate {
    readonly id: number;
    readonly user_id: number;
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
    readonly defended: boolean;
    readonly translations: IAthletTranslationUpdate[];
}

export interface IAthletTranslationUpdate {
    readonly id: number;
    readonly athlet_id: number;
    readonly lang_id: number;
    readonly firstname: string;
    readonly lastname: string;
    readonly region: string;
    readonly city: string;
    readonly bio: string;
    readonly team: string; 
    readonly role: string;
}

export interface IFirmUpdate {
    readonly id: number;
    readonly user_id: number;
    readonly img: string;
    readonly img_s: string;
    readonly reg_no: string;
    readonly reg_date: string;
    readonly reg_country_id: number;
    readonly fact_country_id: number;
    readonly defended: boolean;
    readonly translations: IFirmTranslationUpdate[];
}

export interface IFirmTranslationUpdate {
    readonly id: number;
    readonly firm_id: number;
    readonly lang_id: number;
    readonly name: string;
    readonly branch: string;
    readonly founder: string;
    readonly reg_addr: string;
    readonly fact_addr: string;
    readonly about: string;
}

export interface IUserPhoneUpdate {
    readonly id: number;
    readonly user_id: number;
    readonly value: string;
    readonly pos: number;
    readonly defended: boolean;
}

export interface IUserEmailUpdate {
    readonly id: number;
    readonly user_id: number;
    readonly value: string;
    readonly pos: number;
    readonly defended: boolean;
}

export interface IUserLinkUpdate {
    readonly id: number;
    readonly user_id: number;
    readonly value: string;
    readonly pos: number;
    readonly defended: boolean;
}

export interface IUserSocialUpdate {
    readonly id: number;
    readonly user_id: number;
    readonly social_id: number;
    readonly value: string;
    readonly pos: number;
    readonly defended: boolean;
}

export interface IUserImageUpdate {
    readonly id: number;
    readonly user_id: number;
    readonly url: string;
    readonly pos: number;
    readonly defended: boolean;
}

export interface IUserVideoUpdate {
    readonly id: number;
    readonly user_id: number;
    readonly url: string;
    readonly pos: number;
    readonly defended: boolean;
}

export interface IUserOtherUpdate {
    readonly id: number;
    readonly user_id: number;
    readonly name: string;
    readonly url: string;
    readonly pos: number;
    readonly defended: boolean;
}

export interface IRewardUpdate {
    readonly id: number;
    readonly date: string;
    readonly img: string;
    readonly translations: IRewardTranslationUpdate[];
    readonly defended: boolean;
}

export interface IRewardTranslationUpdate {
    readonly id: number;
    readonly reward_id: number;
    readonly lang_id: number;
    readonly name: string;
}
