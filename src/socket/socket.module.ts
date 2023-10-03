import { Module } from "@nestjs/common";
import { CSocketGateway } from "./socket.gateway";

@Module({
    providers: [
        CSocketGateway,
    ],
    exports: [
        CSocketGateway,
    ],
})
export class CSocketModule {}
