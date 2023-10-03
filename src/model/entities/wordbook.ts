import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Index } from "typeorm";
import { CWord } from "./word";

@Entity({name: "a7_wordbooks"}) 
export class CWordbook {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({nullable: true, default: null})
    name: string;

    @Column({nullable: false, default: 0})
    pos: number;  

    @Index()
    @Column({nullable: false, default: "all"})
    load_to: string;
    
    @Column({nullable: false, default: false})
    defended: boolean;  

    // relations
    @OneToMany(type => CWord, word => word.wordbook, {cascade: true})
    words: CWord[];
}