import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AnomalyStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenancy/tenant.service';
class UpdateAnomalyDto {
  @IsEnum(AnomalyStatus) status!: AnomalyStatus;
}
@ApiTags('anomalies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('anomalies')
export class AnomaliesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantService,
  ) {}
  @Get() async list(@CurrentUser() u: AuthUser, @Query('organizationId') o: string) {
    await this.tenant.authorize(u.sub, o);
    return this.prisma.anomaly.findMany({
      where: { organizationId: o },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
  @Get(':id') async get(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    const a = await this.prisma.anomaly.findUnique({ where: { id } });
    if (a) await this.tenant.authorize(u.sub, a.organizationId);
    return a;
  }
  @Patch(':id') async update(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() d: UpdateAnomalyDto,
  ) {
    const a = await this.prisma.anomaly.findUniqueOrThrow({ where: { id } });
    await this.tenant.authorize(u.sub, a.organizationId, ['OWNER', 'ADMIN', 'MANAGER']);
    return this.prisma.anomaly.update({
      where: { id },
      data: {
        status: d.status,
        endedAt: ['RESOLVED', 'DISMISSED'].includes(d.status) ? new Date() : undefined,
      },
    });
  }
}
