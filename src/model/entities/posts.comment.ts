import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CEntity } from "./_entity";
import { CPost } from "./posts";
import { CUser } from "./user";

@Entity({name: "a7_post_comment"})
export class CPostComment extends CEntity {
    @Column({nullable: true, default: null})
    public user_id: number;

    @Column({nullable: true, default: null})
    public post_id: number;

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
    @ManyToOne(() => CPost, (post) => post.attachment)
    @JoinColumn({name: "post_id"})
    public post: CPost;
}