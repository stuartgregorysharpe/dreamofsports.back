import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CEntityTranslation } from "./_entity.translation";
import { CAthlet } from "./athlet";

@Entity({name: "a7_athlet_translations"})
export class CAthletTranslation extends CEntityTranslation {
    @Column({nullable: false})
    public athlet_id: number;

    @Index()
    @Column({nullable: true, default: null})
    public firstname: string;

    @Index()
    @Column({nullable: true, default: null})
    public lastname: string;

    @Index()
    @Column({nullable: true, default: null})
    public region: string;

    @Index()
    @Column({nullable: true, default: null})
    public city: string;

    @Column({nullable: true, default: null, type: "text"})
    public bio: string;

    @Index()
    @Column({nullable: true, default: null})
    public team: string; 
 
    @Index()
    @Column({nullable: true, default: null})
    public role: string;
    
    // relations
    @ManyToOne(type => CAthlet, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "athlet_id"})
    public athlet: CAthlet;
}