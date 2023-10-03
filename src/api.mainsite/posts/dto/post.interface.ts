import { IPostAttachment } from "src/api.mainsite/post.attachment/dto/post.attachment.interface";
import { IPostComment } from "src/api.mainsite/post.attachment/dto/post.comment.interface";
import { IUser } from "src/api.mainsite/users/dto/user.interface";

export interface IPost {
    readonly id: number;
    readonly content?: string;
    // relations
    readonly attachment: IPostAttachment[];
    readonly comments: IPostComment[];
    readonly user: IUser;
}
