import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "a7_verifications"})
export class CVerification {
    @PrimaryGeneratedColumn()
    public id: number;

    @Index()
    @Column({nullable: true, default: null})
    public login: string;

    @Index()
    @Column({nullable: true, default: null})
    public code: string;
    
    @Index()
    @CreateDateColumn({type: "timestamp"})
    public created_at: Date;
}