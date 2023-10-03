import { Column, CreateDateColumn, Entity, Index } from "typeorm";
import { CEntity } from "./_entity";

@Entity({name: "a7_messages"})
export class CMessage extends CEntity {
    @Column({nullable: true, default: null})
    public name: string;

    @Index()
    @Column({nullable: true, default: null})
    public email: string;

    @Column({nullable: true, default: null, type: "text"})
    public content: string;

    @Index()
    @CreateDateColumn({type: "timestamp"})
    public created_at: Date;
}
