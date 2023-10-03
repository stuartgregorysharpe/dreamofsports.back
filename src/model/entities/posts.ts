import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CEntity } from "./_entity";
import { CPostAttachment } from "./posts.attachment";
import { CUser } from "./user";
import { CPostComment } from "./posts.comment";
import { CPostLike } from "./posts.like";

@Entity({name: "a7_posts"})
export class CPost extends CEntity {
    @Column({nullable: true, default: null})
    public user_id: number;

    @Column({nullable: true, default: null})
    public content: string;

    @CreateDateColumn({type: "timestamp"})
    public created_at: Date;

    @Column({nullable: false, default: true})
    public active: boolean;
    
    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "user_id"})
    public user: CUser;

    // relations
    @OneToMany(() => CPostAttachment, (attachment) => attachment.post, {cascade: true})
    public attachment: CPostAttachment[];

    @OneToMany(() => CPostComment, (comment) => comment.post, {cascade: true})
    public comments: CPostComment[];

    @OneToMany(() => CPostLike, (like) => like.post, {cascade: true})
    public likes: CPostComment[];
}