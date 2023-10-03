import { Column, Entity, OneToMany } from "typeorm";
import { CEntity } from "./_entity";
import { CEmployeeTranslation } from "./employee.translation";

@Entity({name: "a7_employees"})
export class CEmployee extends CEntity {
    @Column({nullable: true, default: null})
    public img: string;

    @Column({nullable: false, default: 0})
    public pos: number;

    @Column({nullable: false, default: true})
    public active: boolean;

    // relations
    @OneToMany(type => CEmployeeTranslation, translation => translation.employee, {cascade: true})
    public translations: CEmployeeTranslation[];
}
