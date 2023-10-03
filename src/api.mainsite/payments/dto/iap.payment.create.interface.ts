export interface IIapPaymentCreate {
    vendor: TVendor;
    pid: string;
}

export type TVendor = "apple" | "google";
