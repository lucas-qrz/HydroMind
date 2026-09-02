import { Module } from '@nestjs/common';
import { AnomaliesModule } from '../anomalies/anomalies.module';
import { IotController } from './iot.controller';
import { IotService } from './iot.service';
@Module({ imports: [AnomaliesModule], controllers: [IotController], providers: [IotService] })
export class IotModule {}
