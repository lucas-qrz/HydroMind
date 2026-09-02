import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenancy/tenant.service';
@ApiTags('alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantService,
  ) {}
  @Get() async list(
    @CurrentUser() u: AuthUser,
    @Query('organizationId') o: string,
    @Query('status') s?: 'NEW' | 'READ' | 'CLOSED',
  ) {
    await this.tenant.authorize(u.sub, o);
    return this.prisma.alert.findMany({
      where: { organizationId: o, status: s },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
  @Patch(':id/read') async read(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    const a = await this.prisma.alert.findUniqueOrThrow({ where: { id } });
    await this.tenant.authorize(u.sub, a.organizationId);
    return this.prisma.alert.update({ where: { id }, data: { status: 'READ' } });
  }
  @Patch(':id/close') async close(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    const a = await this.prisma.alert.findUniqueOrThrow({ where: { id } });
    await this.tenant.authorize(u.sub, a.organizationId, ['OWNER', 'ADMIN', 'MANAGER']);
    return this.prisma.alert.update({ where: { id }, data: { status: 'CLOSED' } });
  }
}
