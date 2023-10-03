import { Injectable, RawBodyRequest } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CErrorsService } from "src/common/services/errors.service";
import { IResponse } from "src/model/dto/response.interface";
import { CPayment } from "src/model/entities/payment";
import { CTariff } from "src/model/entities/tariff";
import { Repository } from "typeorm";
import { CUser } from "src/model/entities/user";
import { CPaysystem } from "src/model/entities/paysystem";
import { cfg } from "src/app.config";
import Stripe from "stripe";
import { CNetworkService } from "src/common/services/network.service";
import { INpNotification } from "./dto/np.notification.interface";
import { createHmac } from "crypto";
import { CMailService } from "src/common/services/mail.service";
import { CAppService } from "src/common/services/app.service";
import { INpPayment } from "./dto/np.payment.interface";
import { IStripePaymentCreate } from "./dto/stripe.payment.create.interface";
import { INpPaymentCreate } from "./dto/np.payment.create.interface";
import { IIapNotification } from "./dto/iap.notification.interface";
import { IIapPaymentCreate } from "./dto/iap.payment.create.interface";
import { IIapAppleValidation } from "./dto/iap.apple.validation.interface";
import { JWT } from "google-auth-library";
import { IIapResponse } from "./dto/iap.response.interface";

@Injectable()
export class CPaymentsService {
    constructor(
        @InjectRepository(CPayment) private paymentRepository: Repository<CPayment>,
        @InjectRepository(CPaysystem) private paysystemRepository: Repository<CPaysystem>,
        @InjectRepository(CTariff) private tarifRepository: Repository<CTariff>,
        @InjectRepository(CUser) private userRepository: Repository<CUser>,
        private errorsService: CErrorsService,
        private networkService: CNetworkService,
        private mailService: CMailService,
        private appService: CAppService,
    ) {}

    // return secret code of "intent"
    public async stripePrepare(visitor_id: number, tariff_id: number): Promise<IResponse<string>> {
        try {
            const user = await this.userRepository.findOne({where: {id: visitor_id, active: true}});
            if (!user) return {statusCode: 404, error: "user not found"};
            const tariff = await this.tarifRepository.findOne({where: {id: tariff_id, active: true}});
            if (!tariff) return {statusCode: 404, error: "tariff not found"};
            const paysystem = await this.paysystemRepository.findOne({where: {name: "stripe"}, relations: ["params"]});
            if (!paysystem) return {statusCode: 404, error: "paysystem not found"};
            const privateKey = paysystem.params.find(p => p.name === "private-key")?.value;
            if (!privateKey) return {statusCode: 404, error: "stripe private key not found"};
            const stripe = require('stripe')(privateKey) as Stripe;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: tariff.price * 100,
                currency: "usd",
                automatic_payment_methods: {enabled: true},
            });
            return {statusCode: 200, data: paymentIntent.client_secret};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CPaymentsService.stripePrepare", err);
            return {statusCode: 500, error}; 
        }
    }

    // just save payment to our DB
    public async stripePay(visitor_id: number, dto: IStripePaymentCreate): Promise<IResponse<void>> {
        try {
            const user = await this.userRepository.findOne({where: {id: visitor_id, active: true}});
            if (!user) return {statusCode: 404, error: "user not found"};
            const tariff = await this.tarifRepository.findOne({where: {id: dto.tariff_id, active: true}});
            if (!tariff) return {statusCode: 404, error: "tariff not found"};
            const payment = this.paymentRepository.create({
                user_email: user.email, 
                paysystem: "stripe",
                amount: tariff.price,
                duration: tariff.duration,
                outer_id: dto.secret, // чтобы связать подтверждение с нашей записью
            });
            await this.paymentRepository.save(payment);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CPaymentsService.stripePay", err);
            return {statusCode: 500, error};
        }
    }

    // get payment status (for "payment completion" page)
    public async stripeCheck(intent_id: string): Promise<IResponse<void>> {
        try {
            const paysystem = await this.paysystemRepository.findOne({where: {name: "stripe"}, relations: ["params"]});
            if (!paysystem) return {statusCode: 404, error: "paysystem not found"};
            const privateKey = paysystem.params.find(p => p.name === "private-key")?.value;
            if (!privateKey) return {statusCode: 404, error: "stripe private key not found"};
            const stripe = require('stripe')(privateKey) as Stripe;
            const intent = await stripe.paymentIntents.retrieve(intent_id);
            
            if (["succeeded", "processing"].includes(intent.status)) {
                return {statusCode: 200};
            }

            return {statusCode: 500, error: intent.status};            
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CPaymentsService.stripeCheck", err);
            return {statusCode: 500, error};
        }
    }

    // handle confirmation from Stripe
    public async stripeComplete(request: RawBodyRequest<Request>): Promise<IResponse<void>> {
        try {
            const signature = request.headers["stripe-signature"];
            const body = request.rawBody;
            const paysystem = await this.paysystemRepository.findOne({where: {name: "stripe"}, relations: ["params"]});
            if (!paysystem) return {statusCode: 404, error: "paysystem not found"};
            const privateKey = paysystem.params.find(p => p.name === "private-key")?.value;
            if (!privateKey) return {statusCode: 404, error: "stripe private key not found"};
            const webhookSecret = paysystem.params.find(p => p.name === "webhook-secret")?.value;
            if (!webhookSecret) return {statusCode: 404, error: "stripe webhook secret not found"};
            const stripe = require('stripe')(privateKey) as Stripe;
            const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

            if (event.type === "payment_intent.succeeded") {
                const outer_id = event.data.object["client_secret"];

                if (outer_id) {
                    const payment = await this.paymentRepository.findOne({where: {outer_id}});

                    if (payment) {
                        payment.completed = true;
                        await this.paymentRepository.save(payment);
                        const user = await this.userRepository.findOne({where: {email: payment.user_email, active: true}});
                        user && this.prolong(user, payment.duration);                        
                    }
                }                
            }

            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CPaymentsService.stripeComplete", err);
            return {statusCode: 500, error};
        }
    }

    // save payment to DB and return payment page URL
    public async npPay(visitor_id: number, dto: INpPaymentCreate): Promise<IResponse<string>> {
        try {
            const user = await this.userRepository.findOne({where: {id: visitor_id, active: true}});
            if (!user) return {statusCode: 404, error: "user not found"};
            const tariff = await this.tarifRepository.findOne({where: {id: dto.tariff_id, active: true}});
            if (!tariff) return {statusCode: 404, error: "tariff not found"};
            const paysystem = await this.paysystemRepository.findOne({where: {name: "nowpayments"}, relations: ["params"]});
            if (!paysystem) return {statusCode: 404, error: "paysystem not found"};
            const apiUrl = paysystem.params.find(p => p.name === "url")?.value;
            const apiKey = paysystem.params.find(p => p.name === "api-key")?.value;
            if (!apiUrl || !apiKey) return {statusCode: 404, error: "paysystem param(s) not found"};
            const ready = await this.npReady(apiUrl);
            if (!ready) return {statusCode: 400, error: "API not ready"};
            const minAmount = await this.npMinAmount(apiUrl, apiKey, dto.npCurrency);
            const estimatedAmount = await this.npEstimateAmount(apiUrl, apiKey, dto.npCurrency, tariff.price);
            if (estimatedAmount < minAmount) return {statusCode: 409, error: `amount-small#${minAmount.toFixed(2)}`} ;
            const payment = this.paymentRepository.create({
                user_email: user.email, 
                paysystem: "nowpayments",
                amount: tariff.price,
                duration: tariff.duration,
            });
            await this.paymentRepository.save(payment);
            const data: INpPayment = {
                price_amount: tariff.price,
                price_currency: "usd",
                pay_currency: dto.npCurrency,
                ipn_callback_url: `${cfg.backUrl}/api/mainsite/payments/np-complete`,
                order_id: payment.id,
                success_url: `${cfg.mainsiteUrl}/${dto.lang_slug}/paid`,
                cancel_url: `${cfg.mainsiteUrl}/${dto.lang_slug}/account/subscription`,
            };
            const url = await this.npBuildPaymentUrl(apiUrl, apiKey, data);
            return {statusCode: 200, data: url};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CPaymentsService.npPay", err);
            return {statusCode: 500, error};
        }
    }

    // handle confirmation from Nowpayments
    public async npComplete(request: Request): Promise<IResponse<void>> {
        try {
            const paysystem = await this.paysystemRepository.findOne({where: {name: "nowpayments"}, relations: ["params"]});
            if (!paysystem) return {statusCode: 404, error: "paysystem not found"};
            const ipnKey = paysystem.params.find(p => p.name === "ipn-key")?.value;
            if (!ipnKey) return {statusCode: 404, error: "Nowpayments notifications key not found"};            
            const data = request.body as unknown as INpNotification;
            const hmac = createHmac('sha512', ipnKey);
            hmac.update(JSON.stringify(data, Object.keys(data).sort()));
            const signature = hmac.digest('hex');
            const npSignature = request.headers["x-nowpayments-sig"];            
            if (signature !== npSignature) return {statusCode: 401, error: "signature is invalid"};                        
            if (data.payment_status !== "finished") return {statusCode: 400, error: "not finished"};            
            const payment = await this.paymentRepository.findOne({where: {id: parseInt(data.order_id)}});

            if (payment) {
                payment.completed = true;
                payment.outer_id = data.payment_id.toString();
                await this.paymentRepository.save(payment);
                const user = await this.userRepository.findOne({where: {email: payment.user_email, active: true}});
                user && this.prolong(user, payment.duration);                        
            }

            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CPaymentsService.npComplete", err);
            return {statusCode: 500, error};
        }
    }

    // list of cryptocurrencies in Nowpayments
    public async npCurrenciesAll(): Promise<IResponse<string[]>> {
        try {
            const paysystem = await this.paysystemRepository.findOne({where: {name: "nowpayments"}, relations: ["params"]});
            if (!paysystem) return {statusCode: 404, error: "paysystem not found"};
            const apiUrl = paysystem.params.find(p => p.name === "url")?.value;
            const apiKey = paysystem.params.find(p => p.name === "api-key")?.value;
            if (!apiUrl || !apiKey) return {statusCode: 404, error: "paysystem param(s) not found"};
            const res = await this.networkService.forcedGet(`${apiUrl}/currencies`, {headers: {"x-api-key": apiKey}});
            const data = (res.data["currencies"] as string[]).sort();
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CPaymentsService.nowcurrenciesAll", err);
            return {statusCode: 500, error};
        }
    }

    // save payment to DB and return payment ID
    public async iapPay(visitor_id: number, dto: IIapPaymentCreate): Promise<IResponse<number>> {
        try {
            const user = await this.userRepository.findOne({where: {id: visitor_id, active: true}});
            if (!user) return {statusCode: 404, error: "user not found"};
            const field = `${dto.vendor}_pid`;
            const tariff = await this.tarifRepository.findOne({where: {[field]: dto.pid, active: true}});
            if (!tariff) return {statusCode: 404, error: "tariff not found"};
            const payment = this.paymentRepository.create({                
                user_email: user.email, 
                paysystem: "in-app-purchase",
                amount: tariff.price,
                duration: tariff.duration,
            });
            await this.paymentRepository.save(payment);            
            return {statusCode: 200, data: payment.id};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CPaymentsService.iapPay", err);
            return {statusCode: 500, error};
        }
    }

    // handle confirmation from In-App purchase
    public async iapComplete(dto: IIapNotification): Promise<IIapResponse> {
        try {            
            if (!dto.additionalData.applicationUsername) return {ok: false};
            const paysystem = await this.paysystemRepository.findOne({where: {name: "in-app-purchase"}, relations: ["params"]});
            if (!paysystem) return {ok: false};
                        
            // validation 
            if (dto.transaction.type === "ios-appstore") {                
                if (!await this.iapAppleValidate(paysystem, dto)) return {ok: false};
            } else if (dto.transaction.type === "android-playstore") {
                if (!await this.iapGoogleValidate(paysystem, dto)) return {ok: false};
            } else {
                return {ok: false};
            }           
            
            const payment = await this.paymentRepository.findOne({where: {id: parseInt(dto.additionalData.applicationUsername)}});
            if (!payment) return {ok: false};            
            payment.completed = true;
            payment.outer_id = dto.transaction.id;
            await this.paymentRepository.save(payment);
            const user = await this.userRepository.findOne({where: {email: payment.user_email, active: true}});
            user && this.prolong(user, payment.duration);
            return {ok: true, data: {id: dto.id}};
        } catch (err) {
            await this.errorsService.log("api.mainsite/CPaymentsService.iapComplete", err);
            return {ok: false};;
        }
    }

    ////////////////
    // utils
    ////////////////

    private async npReady(apiUrl: string): Promise<boolean> {
        const res = await this.networkService.forcedGet(`${apiUrl}/status`);        
        return res.data["message"] === "OK";
    }

    private async npMinAmount(apiUrl: string, apiKey: string, npCurrency: string): Promise<number> {
        const res = await this.networkService.forcedGet(`${apiUrl}/min-amount?currency_from=${npCurrency}`, {headers: {"x-api-key": apiKey}});   
        return res.data["min_amount"];
    }

    private async npEstimateAmount(apiUrl: string, apiKey: string, npCurrency: string, amount: number): Promise<number> {
        const res = await this.networkService.forcedGet(`${apiUrl}/estimate?amount=${amount}&currency_from=usd&currency_to=${npCurrency}`, {headers: {"x-api-key": apiKey}});   
        return res.data["estimated_amount"];
    }

    private async npBuildPaymentUrl(apiUrl: string, apiKey: string, data: INpPayment): Promise<string> {        
        const res = await this.networkService.forcedPost(`${apiUrl}/invoice`, data, {headers: {"x-api-key": apiKey}});
        return res.data["invoice_url"];        
    }

    private async iapAppleValidate(paysystem: CPaysystem, dto: IIapNotification): Promise<boolean> {
        const secret = paysystem.params.find(p => p.name === "apple-secret")?.value;
        if (!secret) throw "apple-secret not found";
        const url = paysystem.params.find(p => p.name === "apple-validation-url")?.value;
        if (!url) throw "apple-validation-url not found";
        const validationReq = {"receipt-data": dto.transaction.appStoreReceipt, "password": secret, "exclude-old-transactions": true};
        const res = await this.networkService.forcedPost(url, validationReq);
        const validationResponse = res.data as IIapAppleValidation;
        return validationResponse.status === 0;
    }

    private async iapGoogleValidate(paysystem: CPaysystem, dto: IIapNotification): Promise<boolean> {
        const email = paysystem.params.find(p => p.name === "google-service-acc")?.value;
        if (!email) throw "google-service-acc not found";
        const key = paysystem.params.find(p => p.name === "google-service-acc-key")?.value?.replace(/\\n/g, '\n');
        if (!key) throw "google-service-acc-key not found";
        const urlTemplate = paysystem.params.find(p => p.name === "google-url-template")?.value;
        if (!urlTemplate) throw "google-url-template not found";
        const scopes = paysystem.params.find(p => p.name === "google-scopes")?.value;
        if (!scopes) throw "google-scopes not found";        
        const options = {email, key,  scopes};
        const productId = encodeURIComponent(JSON.parse(dto.transaction.receipt)["productId"]);
        const purchaseToken = encodeURIComponent(dto.transaction.purchaseToken);        
        const url = urlTemplate
            .replace(/{{product_id}}/g, productId)
            .replace(/{{purchase_token}}/g, purchaseToken);        
        const googleClient = new JWT(options);
        const { data } = await googleClient.request({url});
        return data["orderId"] === dto.transaction.id;
    }

    private async prolong(user: CUser, days: number): Promise<void> {
        const now = new Date();
        user.payed_at = now;
        if (!user.payed_until || user.payed_until.getTime() < now.getTime()) user.payed_until = new Date(); // если еще не было подписки или дата истечения подписки - в прошлом
        user.payed_until.setDate(user.payed_until.getDate() + days);
        await this.userRepository.save(user);
        await this.mailService.userSubscriptionProlonged(user.email, user.lang_id, this.appService.humanDate(user.payed_until, true));
    }
}