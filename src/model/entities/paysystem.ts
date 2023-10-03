import { Column, Entity, OneToMany } from "typeorm";
import { CPaysystemTranslation } from "./paysystem.translation";
import { CEntity } from "./_entity";
import { CPaysystemParam } from "./paysystem.param";

@Entity({name: "a7_paysystems"})
export class CPaysystem extends CEntity {
    @Column({nullable: false, unique: true})
    public name: string;

    @Column({nullable: false, default: 0})
    public pos: number;

    @Column({nullable: false, default: true})
    public active: boolean;

    // relations
    @OneToMany(type => CPaysystemTranslation, translation => translation.paysystem, {cascade: true})
    public translations: CPaysystemTranslation[];

    @OneToMany(type => CPaysystemParam, param => param.paysystem, {cascade: true})
    public params: CPaysystemParam[];
}
