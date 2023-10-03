export interface IStripePaymentCreate {
    readonly tariff_id: number;
    readonly secret: string;
}