import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CEntity } from "./_entity";
import { CUser } from "./user";

@Entity({name: "a7_complaints"})
export class CComplaint extends CEntity {
    @Column({nullable: false})
    public author_id: number; // жалобщик

    @Column({nullable: false})
    public breaker_id: number; // нарушитель

    @Column({nullable: true, default: null})
    public content: string;

    @Index()
    @CreateDateColumn({type: "timestamp"}) 
    public created_at: Date;

    // relations
    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "author_id"})
    public author: CUser;

    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "breaker_id"})
    public breaker: CUser;
}