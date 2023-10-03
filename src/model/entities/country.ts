import { Column, Entity, OneToMany } from "typeorm";
import { CEntity } from "./_entity";
import { CCountryTranslation } from "./country.translation";

@Entity({name: "a7_countries"})
export class CCountry extends CEntity {
    @Column({nullable: true, default: null})
    public code: string;

    // relations
    @OneToMany(type => CCountryTranslation, translation => translation.country, {cascade: true})
    public translations: CCountryTranslation[];
}