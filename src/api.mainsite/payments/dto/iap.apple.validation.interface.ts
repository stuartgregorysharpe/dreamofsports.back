export interface IIapAppleValidation {
    readonly receipt: IIapAppleValidationReceipt;
    readonly environment: string;
    readonly latest_receipt_info: IIapAppleValidationReceiptInfo[];
    readonly latest_receipt: string;
    readonly status: number;
}

export interface IIapAppleValidationReceipt {
    readonly receipt_type: string;
    readonly adam_id: number;
    readonly app_item_id: number;
    readonly bundle_id: string;
    readonly application_version: string;
    readonly download_id: number;
    readonly version_external_identifier: number;
    readonly receipt_creation_date: string;
    readonly receipt_creation_date_ms: string;
    readonly receipt_creation_date_pst: string;
    readonly request_date: string;
    readonly request_date_ms: string;
    readonly request_date_pst: string;
    readonly original_purchase_date: string;
    readonly original_purchase_date_ms: string;
    readonly original_purchase_date_pst: string;
    readonly original_application_version: string;
    readonly in_app: any[];
}

export interface IIapAppleValidationReceiptInfo {
    readonly quantity: string;
    readonly product_id: string;
    readonly transaction_id: string;
    readonly original_transaction_id: string;
    readonly purchase_date: string;
    readonly purchase_date_ms: string;
    readonly purchase_date_pst: string;
    readonly original_purchase_date: string;
    readonly original_purchase_date_ms: string;
    readonly original_purchase_date_pst: string;
    readonly is_trial_period: string;
    readonly in_app_ownership_type: string;
}
