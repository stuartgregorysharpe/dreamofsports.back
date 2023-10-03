import { Body, Controller, HttpCode, Param, Post, RawBodyRequest, Req, Res, UseGuards, Request } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CUserGuard } from "src/common/services/guards/user.guard";
import { CPaymentsService } from "./payments.service";
import { JwtService } from "@nestjs/jwt";
import { IStripePaymentCreate } from "./dto/stripe.payment.create.interface";
import { INpPaymentCreate } from "./dto/np.payment.create.interface";
import { IIapNotification } from "./dto/iap.notification.interface";
import { IIapPaymentCreate } from "./dto/iap.payment.create.interface";
import { IIapResponse } from "./dto/iap.response.interface";

@Controller('api/mainsite/payments')
export class CPaymentsController {
    constructor(
        private paymentsService: CPaymentsService,
        private jwtService: JwtService,
    ) {}        

    @UseGuards(CUserGuard)
    @Post("stripe-prepare/:tariff_id")
    public stripePprepare(@Param("tariff_id") tariff_id: string, @Req() request: Request): Promise<IResponse<string>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"];
        return this.paymentsService.stripePrepare(visitor_id, parseInt(tariff_id));
    }

    @UseGuards(CUserGuard)
    @Post("stripe-pay")
    public stripePay(@Body() dto: IStripePaymentCreate, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"];
        return this.paymentsService.stripePay(visitor_id, dto);
    }

    @UseGuards(CUserGuard)
    @Post("stripe-check/:intent_id")
    public stripeCheck(@Param("intent_id") intent_id: string): Promise<IResponse<void>> {
        return this.paymentsService.stripeCheck(intent_id);
    }

    @Post("stripe-complete")
    public stripeComplete(@Req() request: RawBodyRequest<Request>): Promise<IResponse<void>> {
        return this.paymentsService.stripeComplete(request);
    }

    @UseGuards(CUserGuard)
    @Post("np-pay")
    public npPay(@Body() dto: INpPaymentCreate, @Req() request: Request): Promise<IResponse<string>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"];
        return this.paymentsService.npPay(visitor_id, dto);
    }

    @Post("np-complete")
    public npComplete(@Req() request: Request): Promise<IResponse<void>> {
        return this.paymentsService.npComplete(request);
    }

    @UseGuards(CUserGuard)
    @Post("np-currencies-all")
    public npCurrenciesAll(): Promise<IResponse<string[]>> {
        return this.paymentsService.npCurrenciesAll();
    }

    @UseGuards(CUserGuard)
    @Post("iap-pay")
    public iapPay(@Body() dto: IIapPaymentCreate, @Req() request: Request): Promise<IResponse<number>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"];
        return this.paymentsService.iapPay(visitor_id, dto);
    }

    @HttpCode(200)
    @Post("iap-complete")
    public async iapComplete(@Body() dto: IIapNotification): Promise<IIapResponse> {
        return this.paymentsService.iapComplete(dto);                
    }
}
