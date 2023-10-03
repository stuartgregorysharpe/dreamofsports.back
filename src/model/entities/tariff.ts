import { Column, Entity, OneToMany } from "typeorm";
import { CEntity } from "./_entity";
import { CTariffTranslation } from "./tariff.translation";

@Entity({name: "a7_tariffs"})
export class CTariff extends CEntity {
    @Column({nullable: false, default: 1})
    public price: number;

    @Column({nullable: false, default: 1})
    public duration: number;

    @Column({nullable: true, default: null})
    public apple_pid: string; // product ID in Apple "In App Purchase" system

    @Column({nullable: true, default: null})
    public google_pid: string; // product ID in Google "In App Purchase" system

    @Column({nullable: false, default: true})
    public np_compatible: boolean; // можно оплачивать через NowPayments (там есть ограничения на мин. сумму)
    
    @Column({nullable: false, default: true})
    public active: boolean;

    // relations
    @OneToMany(type => CTariffTranslation, translation => translation.tariff, {cascade: true})
    public translations: CTariffTranslation[];
}