import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AnomaliesController } from './anomalies.controller';
import { AnomalyService } from './anomaly.service';
@Module({
  imports: [AuthModule],
  controllers: [AnomaliesController],
  providers: [AnomalyService],
  exports: [AnomalyService],
})
export class AnomaliesModule {}
