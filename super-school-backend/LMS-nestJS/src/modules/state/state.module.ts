import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { State } from "./state.entity";
import { StateController } from "./state.controller";
import { StateService } from "./state.service";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";

@Module({
    imports: [TypeOrmModule.forFeature([State]), AuthModule],
    controllers: [StateController],
    providers: [StateService, JwtService],
})
export class StateModule {}
