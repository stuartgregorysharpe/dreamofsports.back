import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CEntityTranslation } from "./_entity.translation";
import { CReward } from "./reward";

@Entity({name: "a7_reward_translations"})
export class CRewardTranslation extends CEntityTranslation {
    @Column({nullable: false})
    public reward_id: number;

    @Column({nullable: true, default: null})
    public name: string;
    
    // relations
    @ManyToOne(type => CReward, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "reward_id"})
    public reward: CReward;
}