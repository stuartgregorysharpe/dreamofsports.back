import { Column, Entity, PrimaryGeneratedColumn, Index } from "typeorm";

@Entity({name: "a7_files"})
export class CFile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, unique: true})
    mark: string;

    @Column({nullable: false})
    filename: string;

    @Column({nullable: false})
    fileurl: string;

    @Column({nullable: false})
    filetype: string;

    @Index()
    @Column({nullable: false, default: "all"})
    load_to: string;

    @Column({nullable: false, default: false})
    defended: boolean;
}
