export interface IIapNotification {
    readonly id: string;
    readonly type: string;
    readonly products: IIapProduct[];
    readonly transaction: IIapTransaction;
    readonly additionalData: IIapAdditional;
    readonly device: IIapDevice;    
    readonly currency?: string; // google
    readonly priceMicros?: number; // google
    readonly offers?: IIapOffer[]; // google
}

export interface IIapTransaction {
    readonly type: "ios-appstore" | "android-playstore";
    readonly id: string;
    readonly purchaseToken?: string; // google
    readonly signature?: string; // google
    readonly receipt?: string; // google
    readonly appStoreReceipt?: string; // apple
}

export interface IIapAdditional {
    readonly applicationUsername: string;
}

export interface IIapDevice {
    readonly plugin: string;
}

export interface IIapProduct {
    readonly className: string;
    readonly title: string;
    readonly description: string;
    readonly platform: string;
    readonly type: string;
    readonly id: string;
    readonly group: any;
    readonly offers: IIapOffer[];
    readonly raw: IIapRaw;
    readonly countryCode: string;
}

export interface IIapOffer {
    readonly className: string;
    readonly id: string;
    readonly pricingPhases: any[];
    readonly productId: string;
    readonly productType: string;
    readonly productGroup?: any; // apple
    readonly platform: string;
    readonly offerType?: string; // apple
    readonly type?: string; // google
}

export interface IIapRaw {
    readonly id: string;
    readonly description: string;
    readonly introPrice: any;
    readonly introPricePaymentMode: any;
    readonly billingPeriodUnit: string;
    readonly countryCode: string;
    readonly introPricePeriodUnit: any;
    readonly discounts: any[];
    readonly title: string;
    readonly price: string;
    readonly billingPeriod: number;
    readonly group: any;
    readonly priceMicros: number;
    readonly currency: string;
    readonly introPricePeriod: any;
    readonly introPriceMicros: any;
    readonly type: string;
    readonly platform: string;
}