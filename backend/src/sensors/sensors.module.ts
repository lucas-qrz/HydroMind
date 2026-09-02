import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SensorsController } from './sensors.controller';
import { SensorsService } from './sensors.service';
@Module({
  imports: [AuthModule],
  controllers: [SensorsController],
  providers: [SensorsService],
  exports: [SensorsService],
})
export class SensorsModule {}
