import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CEntityTranslation } from "./_entity.translation";
import { CFirm } from "./firm";

@Entity({name: "a7_firm_translations"})
export class CFirmTranslation extends CEntityTranslation {
    @Column({nullable: false})
    public firm_id: number;

    @Index()
    @Column({nullable: true, default: null})
    public name: string;

    @Index()
    @Column({nullable: true, default: null})
    public branch: string;

    @Index()
    @Column({nullable: true, default: null})
    public founder: string;

    @Index()
    @Column({nullable: true, default: null})
    public reg_addr: string;

    @Index()
    @Column({nullable: true, default: null})
    public fact_addr: string;

    @Column({nullable: true, default: null, type: "text"})
    public about: string;
    
    // relations
    @ManyToOne(type => CFirm, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "firm_id"})
    public firm: CFirm;
}