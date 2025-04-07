import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { City } from "./city.entity";
import { CityController } from "./city.controller";
import { CityService } from "./city.service";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";

@Module({
    imports: [TypeOrmModule.forFeature([City]), AuthModule],
    controllers: [CityController],
    providers: [CityService, JwtService],
})
export class CityModule {}
