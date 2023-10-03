import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CEntity } from "./_entity";
import { CPage } from "./page";
import { CPageWordTranslation } from "./page.word.translation";

@Entity({name: "a7_page_words"}) 
export class CPageWord extends CEntity {
    @Column({nullable: true, default: null})
    public page_id: number;

    @Column({nullable: false, default: 0})
    public pos: number;

    @Column({nullable: true, default: null})
    public mark: string;

    @Column({nullable: true, default: null})
    public note: string;

    // relations
    @ManyToOne(type => CPage, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "page_id"})
    public page: CPage;

    @OneToMany(type => CPageWordTranslation, translation => translation.word, {cascade: true})
    public translations: CPageWordTranslation[];
}