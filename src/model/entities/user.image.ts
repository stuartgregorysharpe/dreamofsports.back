import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CUser } from "./user";
import { CEntity } from "./_entity";

@Entity({name: "a7_user_images"})
export class CUserImage extends CEntity {
    @Column({nullable: true, default: null})
    public user_id: number;

    @Index()
    @Column({nullable: true, default: null})
    public url: string;

    @Column({nullable: false, default: 0})
    public pos: number;

    // relations
    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "user_id"})
    public user: CUser; 
}   
