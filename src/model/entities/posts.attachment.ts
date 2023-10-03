import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CEntity } from "./_entity";
import { CArticleTranslation } from "./article.translation";
import { CArticleCat } from "./article.cat";
import { CPost } from "./posts";

@Entity({name: "a7_post_attachment"})
export class CPostAttachment extends CEntity {
    @Column({nullable: false})
    public file: string;

    @Column({nullable: false})
    public type: string;

    // relations
    @ManyToOne(() => CPost, (post) => post.attachment)
    public post: CPost;
}