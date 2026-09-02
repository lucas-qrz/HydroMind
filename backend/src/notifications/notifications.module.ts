import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InAppNotificationProvider, NotificationProvider } from './notification.provider';
import { PreferencesController } from './preferences.controller';
@Module({
  imports: [AuthModule],
  controllers: [PreferencesController],
  providers: [
    InAppNotificationProvider,
    { provide: NotificationProvider, useExisting: InAppNotificationProvider },
  ],
  exports: [NotificationProvider],
})
export class NotificationsModule {}
