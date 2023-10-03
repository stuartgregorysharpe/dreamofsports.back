import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CEntity } from "./_entity";
import { CUser } from "./user";
import { CChat } from "./chat";
import { EncryptTransformer } from "src/common/transformers/encrypt.transformer";
import { cfg } from "src/app.config";

@Entity({name: "a7_chat_messages"})
export class CChatMessage extends CEntity {
    @Column({nullable: true, default: null})
    public chat_id: number;

    @Column({nullable: true, default: null})
    public user_id: number;

    @Column({nullable: true, default: null, type: "text", transformer: new EncryptTransformer(cfg.encryption)}) 
    public content: string;
    
    @CreateDateColumn({type: "timestamp"}) 
    public created_at: Date;

    // relations
    @ManyToOne(type => CUser, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "user_id"})
    public user: CUser;

    @ManyToOne(type => CChat, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "chat_id"})
    public chat: CChat; 
}