export interface INpPayment {
    price_amount: number;
    price_currency: string;
    pay_currency: string;
    ipn_callback_url: string;
    order_id: number;
    success_url: string;
    cancel_url: string;
}
