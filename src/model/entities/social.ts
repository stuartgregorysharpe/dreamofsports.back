import { Column, Entity } from "typeorm";
import { CEntity } from "./_entity";

@Entity({name: "a7_socials"})
export class CSocial extends CEntity {
    @Column({nullable: true, default: null})
    public name: string;

    @Column({nullable: true, default: null})
    public url: string;

    @Column({nullable: true, default: null})
    public img: string;
}
