import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CUser } from "./user";
import { CEntity } from "./_entity";

@Entity({name: "a7_user_videos"})
export class CUserVideo extends CEntity {
    @Column({nullable: true, default: null})
    public user_id: number;

    @Column({nullable: true, default: null})
    public url: string;

    @Column({nullable: false, default: 0})
    public pos: number;

    // relations
    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "user_id"})
    public user: CUser; 
}   
