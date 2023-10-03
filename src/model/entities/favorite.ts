import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CEntity } from "./_entity";
import { CUser } from "./user";

@Entity({name: "a7_favorites"})
export class CFavorite extends CEntity {
    @Column({nullable: false})
    public user_id: number;

    @Column({nullable: false})
    public favorite_id: number;

    @Index()
    @CreateDateColumn({type: "timestamp"}) 
    public created_at: Date;

    // relations
    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "user_id"})
    public user: CUser;

    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "favorite_id"})
    public favorite: CUser;
}
