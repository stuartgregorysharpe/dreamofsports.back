import { Column, CreateDateColumn, Entity, Index } from "typeorm";
import { CEntity } from "./_entity";

@Entity({name: "a7_payments"})
export class CPayment extends CEntity {
    @Index()
    @Column({nullable: true, default: null})
    public outer_id: string;

    @Column({nullable: true, default: null})
    public user_email: string;

    @Column({nullable: true, default: null})
    public paysystem: string;

    @Column({nullable: false, default: 0})
    public amount: number;

    @Column({nullable: false, default: 0})
    public duration: number;

    @Column({nullable: false, default: false})
    public completed: boolean;

    @Index()
    @CreateDateColumn({nullable: false, type: "timestamp"}) 
    public created_at: Date;    
}
