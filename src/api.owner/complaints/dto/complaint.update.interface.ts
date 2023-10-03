export interface IComplaintUpdate {
    readonly id: number;
    readonly author_id: number;
    readonly breaker_id: number;
    readonly content: string;
    readonly created_at: string;
    readonly defended: boolean;
}
