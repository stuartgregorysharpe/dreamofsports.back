import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CEntityTranslation } from "./_entity.translation";
import { CTariff } from "./tariff";

@Entity({name: "a7_tariff_translations"})
export class CTariffTranslation extends CEntityTranslation {
    @Column({nullable: false})
    public tariff_id: number;

    @Column({nullable: true, default: null})
    public name: string;
        
    // relations
    @ManyToOne(type => CTariff, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "tariff_id"})
    public tariff: CTariff;
}
