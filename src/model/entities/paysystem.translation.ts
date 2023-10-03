import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CPaysystem } from "./paysystem";
import { CEntityTranslation } from "./_entity.translation";

@Entity({name: "a7_paysystem_translations"})
export class CPaysystemTranslation extends CEntityTranslation {
    @Column({nullable: false})
    public paysystem_id: number;

    @Column({nullable: true, default: null})
    public title: string;
        
    // relations
    @ManyToOne(type => CPaysystem, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "paysystem_id"})
    public paysystem: CPaysystem;
}
