import { TUserType } from "src/model/entities/user";

export interface IUserAuthData {
    readonly id: number;
    readonly type: TUserType;
    readonly token: string;    
}
