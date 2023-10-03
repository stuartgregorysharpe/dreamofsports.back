import { TGender } from "src/model/entities/athlet";
import { IReward } from "./reward.interface";

export interface IAthlet {
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
    // relations
    readonly translations: IAthletTranslation[];
    readonly rewards: IReward[];
}

export interface IAthletTranslation {
    readonly id: number;
    readonly lang_id: number;
    readonly athlet_id: number;
    readonly firstname: string;
    readonly lastname: string;
    readonly region: string;
    readonly city: string;
    readonly bio: string;
    readonly team: string; 
    readonly role: string;
}
