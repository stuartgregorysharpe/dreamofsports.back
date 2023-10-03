import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CUser } from "./user";
import { CEntity } from "./_entity";
import { CSocial } from "./social";

@Entity({name: "a7_user_socials"})
export class CUserSocial extends CEntity {
    @Column({nullable: true, default: null})
    public user_id: number;

    @Column({nullable: true, default: null})
    public social_id: number;
    
    @Column({nullable: true, default: null})
    public value: string;

    @Column({nullable: false, default: 0})
    public pos: number;

    // relations
    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "user_id"})
    public user: CUser;

    @ManyToOne(type => CSocial, {onDelete: "RESTRICT", onUpdate: "CASCADE"})
    @JoinColumn({name: "social_id"})
    public social: CSocial;
}
