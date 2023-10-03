export interface INpPaymentCreate {
    readonly tariff_id: number;
    readonly lang_slug: string;
    readonly npCurrency: string;
    //readonly is_app: boolean; // request from mobile app
}
