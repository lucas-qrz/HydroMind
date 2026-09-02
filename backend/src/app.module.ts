import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { envSchema } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { TenancyModule } from './tenancy/tenancy.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { MembershipsModule } from './memberships/memberships.module';
import { LocationsModule } from './locations/locations.module';
import { SensorsModule } from './sensors/sensors.module';
import { IotModule } from './iot/iot.module';
import { ConsumptionModule } from './consumption/consumption.module';
import { AnomaliesModule } from './anomalies/anomalies.module';
import { AlertsModule } from './alerts/alerts.module';
import { TariffsModule } from './tariffs/tariffs.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { HealthModule } from './health/health.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envSchema }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 300 }]),
    PrismaModule,
    TenancyModule,
    AuditModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    MembershipsModule,
    LocationsModule,
    SensorsModule,
    IotModule,
    ConsumptionModule,
    AnomaliesModule,
    AlertsModule,
    TariffsModule,
    DashboardModule,
    ReportsModule,
    NotificationsModule,
    SubscriptionsModule,
    HealthModule,
  ],
})
export class AppModule {}
