import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CEntity } from "./_entity";
import { CUser } from "./user";

@Entity({name: "a7_bans"})
export class CBan extends CEntity {
    @Column({nullable: false})
    public user_id: number;

    @Column({nullable: false})
    public banned_id: number;

    @Index()
    @CreateDateColumn({type: "timestamp"}) 
    public created_at: Date;

    // relations
    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "user_id"})
    public user: CUser;

    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "banned_id"})
    public banned: CUser;
}
