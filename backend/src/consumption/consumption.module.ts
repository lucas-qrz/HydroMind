import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ConsumptionController } from './consumption.controller';
import { ConsumptionService } from './consumption.service';
import { CostService } from './cost.service';
@Module({
  imports: [AuthModule],
  controllers: [ConsumptionController],
  providers: [ConsumptionService, CostService],
  exports: [ConsumptionService, CostService],
})
export class ConsumptionModule {}
