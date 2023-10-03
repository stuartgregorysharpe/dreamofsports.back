import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "a7_errors"})
export class CError {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({nullable: true, default: null})
    public source: string;

    @Column({nullable: true, default: null, type: "text"})
    public text: string;

    @CreateDateColumn({type: "timestamp"})
    public created_at: Date;
}
