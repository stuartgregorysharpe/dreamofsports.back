import { TUserType } from "src/model/entities/user";

export interface IUserEnterByEmail {
    readonly lang_id: number;
    readonly type: TUserType;
    readonly sub_type: string;
    readonly email: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly phoneNumber: string;
}
