import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CEntityTranslation } from "./_entity.translation";
import { CCountry } from "./country";

@Entity({name: "a7_country_translations"})
export class CCountryTranslation extends CEntityTranslation {
    @Column({nullable: false})
    public country_id: number;

    @Column({nullable: true, default: null})
    public name: string;

    // relations
    @ManyToOne(type => CCountry, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "country_id"})
    public country: CCountry;
}
