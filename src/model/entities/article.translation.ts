import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CEntityTranslation } from "./_entity.translation";
import { CArticle } from "./article";

@Entity({name: "a7_article_translations"})
export class CArticleTranslation extends CEntityTranslation {
    @Column({nullable: false})
    public article_id: number;

    @Index()
    @Column({nullable: true, default: null})
    public name: string;
    
    @Column({type: "longtext", nullable: true, default: null})
    public content: string;

    @Column({type: "text", nullable: true, default: null})
    public contentshort: string;

    @Column({nullable: true, default: null})
    public title: string;

    @Column({type: "text", nullable: true, default: null})
    public description: string;

    @Column({nullable: true, default: null})
    public h1: string;

    // relations
    @ManyToOne(type => CArticle, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "article_id"})
    public article: CArticle;
}