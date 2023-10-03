import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CEntity } from "./_entity";
import { CPost } from "./posts";
import { CUser } from "./user";

@Entity({name: "a7_user_follow"})
export class CUserFollow extends CEntity {
    @Column({nullable: true, default: null})
    public user_id: number;

    @Column({nullable: true, default: null})
    public follower_id: number;

    @Column({nullable: true, default: null})
    public type: string;

    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "user_id"})
    public user: CUser;

    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "follower_id"})
    public follower: CUser;
}