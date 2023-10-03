import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CEntity } from "./_entity";
import { CRewardTranslation } from "./reward.translation";
import { CAthlet } from "./athlet";

@Entity({name: "a7_rewards"})
export class CReward extends CEntity {
    @Column({nullable: true, default: null})
    public athlet_id: number;

    @Column({type: "date", nullable: true, default: null})
    public date: string;

    @Column({nullable: true, default: null})
    public img: string;

    // relations
    @OneToMany(type => CRewardTranslation, translation => translation.reward, {cascade: true})
    public translations: CRewardTranslation[];

    // relations
    @ManyToOne(type => CAthlet, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "athlet_id"})
    public athlet: CAthlet;
}
