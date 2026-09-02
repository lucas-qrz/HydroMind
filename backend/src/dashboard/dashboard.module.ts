import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ConsumptionModule } from '../consumption/consumption.module';
import { DashboardController } from './dashboard.controller';
@Module({ imports: [AuthModule, ConsumptionModule], controllers: [DashboardController] })
export class DashboardModule {}
