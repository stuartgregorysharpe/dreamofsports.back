import { TUserType } from "src/model/entities/user";

export interface IUserLogin {
    readonly type: TUserType;
    readonly email: string;
    readonly password: string;
}