import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CPageTranslation } from "./page.translation";
import { CEntity } from "./_entity";
import { CPageWord } from "./page.word";
import { IChildable } from "../childable.interface";

@Entity({name: "a7_pages"})
export class CPage extends CEntity implements IChildable {
    @Column({nullable: true, default: null})
    public parent_id: number;

    @Column({nullable: false, unique: true})
    public slug: string;

    @Column({nullable: true, default: null})
    public img: string;

    @Column({nullable: false, default: 0})
    public pos: number;

    @Column({nullable: false, default: true})
    public active: boolean;

    @Column({nullable: false, default: true})
    public menumain: boolean;

    @Column({nullable: false, default: true})
    public menufoot: boolean;

    // relations
    @OneToMany(type => CPageTranslation, translation => translation.page, {cascade: true})
    public translations: CPageTranslation[];

    @OneToMany(type => CPage, child => child.parent, {cascade: false})
    public children: CPage[];

    @ManyToOne(type => CPage, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "parent_id"})
    public parent: CPage;

    @OneToMany(type => CPageWord, word => word.page, {cascade: true})
    public words: CPageWord[];
}
