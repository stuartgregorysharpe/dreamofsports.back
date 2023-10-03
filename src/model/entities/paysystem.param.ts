import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CPaysystem } from "./paysystem";
import { CEntity } from "./_entity";

@Entity({name: "a7_paysystem_params"})
export class CPaysystemParam extends CEntity {
    @Column({nullable: true, default: null})
    public paysystem_id: number;

    @Column({nullable: true, default: null})
    public name: string;

    @Column({nullable: true, default: null, type: "text"})
    public value: string;

    @Column({nullable: false, default: false})
    public loadable: boolean;
        
    // relations
    @ManyToOne(type => CPaysystem, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "paysystem_id"})
    public paysystem: CPaysystem;
}
