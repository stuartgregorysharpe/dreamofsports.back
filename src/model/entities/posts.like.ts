import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CEntity } from "./_entity";
import { CPost } from "./posts";
import { CUser } from "./user";

@Entity({name: "a7_post_like"})
export class CPostLike extends CEntity {
    @Column({nullable: true, default: null})
    public user_id: number;

    @Column({nullable: true, default: null})
    public post_id: number;

    @Column({nullable: true, default: null})
    public type: string;

    @ManyToOne(type => CPost, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "post_id"})
    public post: CPost;
}