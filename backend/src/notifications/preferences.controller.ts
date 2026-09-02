import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
class PreferenceDto {
  @IsOptional() @IsBoolean() inApp?: boolean;
  @IsOptional() @IsBoolean() email?: boolean;
  @IsOptional() @IsBoolean() push?: boolean;
}
@ApiTags('notification-preferences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notification-preferences')
export class PreferencesController {
  constructor(private readonly prisma: PrismaService) {}
  @Get() get(@CurrentUser() u: AuthUser) {
    return this.prisma.notificationPreference.findUnique({ where: { userId: u.sub } });
  }
  @Patch() update(@CurrentUser() u: AuthUser, @Body() d: PreferenceDto) {
    return this.prisma.notificationPreference.upsert({
      where: { userId: u.sub },
      create: { userId: u.sub, ...d },
      update: d,
    });
  }
}
