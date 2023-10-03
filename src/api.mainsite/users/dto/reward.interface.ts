export interface IReward {
    readonly id: number;
    readonly date: string;
    readonly img: string;
    readonly translations: IRewardTranslation[];
}

export interface IRewardTranslation {
    readonly id: number;
    readonly reward_id: number;
    readonly lang_id: number;
    readonly name: string;
}
