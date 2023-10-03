import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CEntityTranslation } from "./_entity.translation";
import { CPageWord } from "./page.word";

@Entity({name: "a7_page_word_translations"})
export class CPageWordTranslation extends CEntityTranslation {
    @Column({nullable: false})
    word_id: number;

    @Column({type: "text", nullable: true, default: null})
    text: string;

    // relations
    @ManyToOne(type => CPageWord, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "word_id"})
    word: CPageWord;
}
