import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CEntity } from "./_entity";
import { CArticleCatTranslation } from "./article.cat.translation";

@Entity({name: "a7_article_cats"})
export class CArticleCat extends CEntity {
    @Column({nullable: false, unique: true})
    public slug: string;

    @Column({nullable: false, default: 0})
    public pos: number;

    @Column({nullable: false, default: true})
    public active: boolean;

    // relations
    @OneToMany(type => CArticleCatTranslation, translation => translation.cat, {cascade: true})
    public translations: CArticleCatTranslation[];
}
