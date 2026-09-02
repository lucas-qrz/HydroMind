import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TariffsController } from './tariffs.controller';
@Module({ imports: [AuthModule], controllers: [TariffsController] })
export class TariffsModule {}
