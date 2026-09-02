import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SitesController, ZonesController } from './locations.controller';
@Module({ imports: [AuthModule], controllers: [SitesController, ZonesController] })
export class LocationsModule {}
