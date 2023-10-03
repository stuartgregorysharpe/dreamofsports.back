import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { CEntity } from "./_entity";
import { CUser } from "./user";
import { CChatMessage } from "./chat.message";

@Entity({name: "a7_chats"})
export class CChat extends CEntity {
    @Column({nullable: true, default: null})
    public user1_id: number;

    @Column({nullable: true, default: null})
    public user2_id: number;

    @Column({nullable: false, default: false})
    public user1_active: boolean;

    @Column({nullable: false, default: false})
    public user2_active: boolean;

    @Column({nullable: false, default: 0})
    public user1_unread: number;

    @Column({nullable: false, default: 0})
    public user2_unread: number;

    @Column({nullable: true, type: "timestamp"})
    public messaged_at: Date;
    
    // relations
    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "user1_id"})
    public user1: CUser;

    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "user2_id"})
    public user2: CUser;

    @OneToMany(type => CChatMessage, message => message.chat, {cascade: false})
    public messages: CChatMessage[];
}