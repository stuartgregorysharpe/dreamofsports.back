export interface INpNotification {
    readonly payment_id: number;
    readonly invoice_id: number;
    readonly payment_status: string; // finished
    readonly pay_address: string;
    readonly price_amount: number;
    readonly price_currency: string;
    readonly pay_amount: number;
    readonly actually_paid: number;
    readonly actually_paid_at_fiat: number;
    readonly pay_currency: string;
    readonly order_id: string;
    readonly order_description: string;
    readonly purchase_id: string;
    readonly created_at: string;
    readonly updated_at: string;
    readonly outcome_amount: number;
    readonly outcome_currency: string;
}