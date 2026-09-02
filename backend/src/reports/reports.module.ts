import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ConsumptionModule } from '../consumption/consumption.module';
import { ReportsController } from './reports.controller';
@Module({ imports: [AuthModule, ConsumptionModule], controllers: [ReportsController] })
export class ReportsModule {}
