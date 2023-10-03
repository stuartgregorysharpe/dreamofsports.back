import { Controller, Param, Post, Body, UseGuards } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CPaymentsService } from "./payments.service";
import { CPayment } from "src/model/entities/payment";
import { IGetList } from "src/model/dto/getlist.interface";
import { COwnerGuard } from "src/common/services/guards/owner.guard";

@Controller('api/owner/payments')
export class CPaymentsController {
    constructor (private paymentsService: CPaymentsService) {}        
    
    @UseGuards(COwnerGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CPayment[]>> {
        return this.paymentsService.chunk(dto);
    }
    
    @UseGuards(COwnerGuard)
    @Post("one/:id")
    public one(@Param("id") id: string): Promise<IResponse<CPayment>> {
        return this.paymentsService.one(parseInt(id));
    }    

    @UseGuards(COwnerGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.paymentsService.delete(parseInt(id));
    }

    @UseGuards(COwnerGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.paymentsService.deleteBulk(ids);
    }
}
