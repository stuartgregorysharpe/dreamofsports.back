import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CEntityTranslation } from "./_entity.translation";
import { CCat } from "./cat";

@Entity({name: "a7_cat_translations"})
export class CCatTranslation extends CEntityTranslation {
    @Column({nullable: false})
    public cat_id: number;

    @Index()
    @Column({nullable: true, default: null})
    public name: string;
    
    @Column({nullable: true, default: null})
    public title: string;

    @Column({type: "text", nullable: true, default: null})
    public description: string;

    @Column({nullable: true, default: null})
    public h1: string;

    // relations
    @ManyToOne(type => CCat, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "cat_id"})
    public cat: CCat;
}