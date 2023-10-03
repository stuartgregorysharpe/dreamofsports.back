import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CEntity } from "./_entity";
import { CArticleTranslation } from "./article.translation";
import { CArticleCat } from "./article.cat";

@Entity({name: "a7_articles"})
export class CArticle extends CEntity {
    @Column({nullable: true, default: null})
    public cat_id: number;

    @Column({nullable: false, unique: true})
    public slug: string;

    @Column({type: "timestamp", nullable: false, default: () => "CURRENT_TIMESTAMP", precision: 0})
    public date: Date;

    @Column({nullable: true, default: null})
    public img: string;

    @Column({nullable: true, default: null})
    public img_s: string;

    @Column({nullable: false, default: true})
    public active: boolean;

    @Column({nullable: false, default: false})
    public in_gal: boolean;

    @CreateDateColumn({type: "timestamp", select: false})
    public created_at: Date;

    // relations
    @OneToMany(type => CArticleTranslation, translation => translation.article, {cascade: true})
    public translations: CArticleTranslation[];

    @ManyToOne(type => CArticleCat, {onDelete: "SET NULL", onUpdate: "CASCADE"})
    @JoinColumn({name: "cat_id"})
    public cat: CArticleCat;
}