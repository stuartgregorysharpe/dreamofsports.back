import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CEntityTranslation } from "./_entity.translation";
import { CEmployee } from "./employee";

@Entity({name: "a7_employee_translations"})
export class CEmployeeTranslation extends CEntityTranslation {
    @Column({nullable: false})
    public employee_id: number;

    @Column({nullable: true, default: null})
    public name: string;
    
    @Column({nullable: true, default: null})
    public post: string;

    // relations
    @ManyToOne(type => CEmployee, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "employee_id"})
    public employee: CEmployee;
}
