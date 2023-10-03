import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CEntity } from "./_entity";
import { CCatTranslation } from "./cat.translation";
import { IChildable } from "../childable.interface";

@Entity({name: "a7_cats"})
export class CCat extends CEntity implements IChildable {
    @Column({nullable: true, default: null})
    public parent_id: number;

    @Column({nullable: false, unique: true})
    public slug: string;

    @Column({nullable: false, default: 0})
    public pos: number;

    @Column({nullable: false, default: false})
    public menufoot: boolean;

    // relations
    @OneToMany(type => CCatTranslation, translation => translation.cat, {cascade: true})
    public translations: CCatTranslation[];

    @OneToMany(type => CCat, child => child.parent, {cascade: false})
    public children: CCat[];

    @ManyToOne(type => CCat, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "parent_id"})
    public parent: CCat;
}
